package com.recipehub.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recipehub.domain.commit.Commit;
import com.recipehub.domain.recipe.Recipe;
import com.recipehub.domain.user.User;
import com.recipehub.dto.commit.CommitResponse;
import com.recipehub.dto.commit.VersionDiffResponse;
import com.recipehub.repository.CommitRepository;
import com.recipehub.repository.RecipeRepository;
import com.recipehub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CommitService {

    private final CommitRepository commitRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    // 커밋 생성 (레시피 수정 시 자동 호출)
    @Transactional
    public void createCommit(Recipe recipe, User author, String message) {
        try {
            // 현재 레시피 상태를 JSON 스냅샷으로 저장
            Map<String, Object> snapshot = Map.of(
                "title", recipe.getTitle(),
                "description", recipe.getDescription() != null ? recipe.getDescription() : "",
                "category", recipe.getCategory().name(),
                "cookingTime", recipe.getCookingTime() != null ? recipe.getCookingTime() : 0,
                "difficulty", recipe.getDifficulty() != null ? recipe.getDifficulty().name() : "",
                "ingredients", recipe.getIngredients().stream().map(i -> Map.of(
                    "name", i.getName(),
                    "amount", i.getAmount() != null ? i.getAmount() : "",
                    "unit", i.getUnit() != null ? i.getUnit() : ""
                )).toList()
            );
            String snapshotJson = objectMapper.writeValueAsString(snapshot);

            Commit commit = Commit.builder()
                .recipe(recipe)
                .author(author)
                .message(message)
                .snapshot(snapshotJson)
                .build();

            commitRepository.save(commit);
        } catch (Exception e) {
            throw new RuntimeException("커밋 생성 실패", e);
        }
    }

    // 커밋 이력 조회
    @Transactional(readOnly = true)
    public List<CommitResponse> getCommitHistory(Long recipeId) {
        Recipe recipe = recipeRepository.findById(recipeId)
            .orElseThrow(() -> new IllegalArgumentException("레시피를 찾을 수 없습니다."));
        return commitRepository.findByRecipeOrderByCreatedAtDesc(recipe)
            .stream().map(CommitResponse::from).toList();
    }

    // 두 커밋 간 버전 비교
    @Transactional(readOnly = true)
    public VersionDiffResponse compareVersions(Long commitAId, Long commitBId) {
        Commit commitA = commitRepository.findById(commitAId)
            .orElseThrow(() -> new IllegalArgumentException("커밋을 찾을 수 없습니다."));
        Commit commitB = commitRepository.findById(commitBId)
            .orElseThrow(() -> new IllegalArgumentException("커밋을 찾을 수 없습니다."));

        try {
            Map<?, ?> snapshotA = objectMapper.readValue(commitA.getSnapshot(), Map.class);
            Map<?, ?> snapshotB = objectMapper.readValue(commitB.getSnapshot(), Map.class);
            return VersionDiffResponse.of(commitA, commitB, snapshotA, snapshotB);
        } catch (Exception e) {
            throw new RuntimeException("버전 비교 실패", e);
        }
    }

    // 특정 커밋으로 복구
    @Transactional
    public void restoreToCommit(String email, Long recipeId, Long commitId) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        Recipe recipe = recipeRepository.findById(recipeId)
            .orElseThrow(() -> new IllegalArgumentException("레시피를 찾을 수 없습니다."));

        if (!recipe.getOwner().getEmail().equals(email)) {
            throw new IllegalArgumentException("권한이 없습니다.");
        }

        Commit commit = commitRepository.findById(commitId)
            .orElseThrow(() -> new IllegalArgumentException("커밋을 찾을 수 없습니다."));

        try {
            Map<?, ?> snapshot = objectMapper.readValue(commit.getSnapshot(), Map.class);
            recipe.update(
                (String) snapshot.get("title"),
                (String) snapshot.get("description"),
                com.recipehub.domain.recipe.RecipeCategory.valueOf((String) snapshot.get("category")),
                (Integer) snapshot.get("cookingTime"),
                com.recipehub.domain.recipe.Difficulty.valueOf((String) snapshot.get("difficulty")),
                recipe.isPublic()
            );
            createCommit(recipe, user, "복구: " + commit.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("복구 실패", e);
        }
    }
}
