package com.recipehub.service;

import com.recipehub.domain.commit.PrStatus;
import com.recipehub.domain.commit.PullRequest;
import com.recipehub.domain.recipe.Recipe;
import com.recipehub.domain.user.User;
import com.recipehub.dto.pr.PrCreateRequest;
import com.recipehub.dto.pr.PrResponse;
import com.recipehub.repository.PullRequestRepository;
import com.recipehub.repository.RecipeRepository;
import com.recipehub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PullRequestService {

    private final PullRequestRepository prRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private final CommitService commitService;

    // PR 생성 (가맹점 → 본사)
    @Transactional
    public PrResponse createPr(String email, PrCreateRequest request) {
        User author = findUser(email);
        Recipe source = findRecipe(request.getSourceRecipeId());
        Recipe target = findRecipe(request.getTargetRecipeId());

        if (!source.getOwner().getEmail().equals(email)) {
            throw new IllegalArgumentException("본인 레시피만 PR 요청할 수 있습니다.");
        }
        if (source.getForkedFrom() == null || !source.getForkedFrom().getId().equals(target.getId())) {
            throw new IllegalArgumentException("Fork된 레시피만 원본에 PR 요청할 수 있습니다.");
        }

        PullRequest pr = PullRequest.builder()
            .sourceRecipe(source)
            .targetRecipe(target)
            .author(author)
            .description(request.getDescription())
            .build();

        return PrResponse.from(prRepository.save(pr));
    }

    // 전체 PR 목록 (관리자용)
    @Transactional(readOnly = true)
    public List<PrResponse> getAllPrs() {
        return prRepository.findAll().stream().map(PrResponse::from).toList();
    }

    // 내가 보낸 PR 목록
    @Transactional(readOnly = true)
    public List<PrResponse> getMyPrs(String email) {
        User user = findUser(email);
        return prRepository.findByAuthorOrderByCreatedAtDesc(user)
            .stream().map(PrResponse::from).toList();
    }

    // 특정 레시피로 들어온 OPEN PR 목록
    @Transactional(readOnly = true)
    public List<PrResponse> getIncomingPrs(Long recipeId) {
        Recipe recipe = findRecipe(recipeId);
        return prRepository.findByTargetRecipeAndStatus(recipe, PrStatus.OPEN)
            .stream().map(PrResponse::from).toList();
    }

    // 승인
    @Transactional
    public PrResponse approve(String email, Long prId) {
        User reviewer = findUser(email);
        PullRequest pr = findPr(prId);

        pr.approve(reviewer);

        // 소스 레시피 내용을 타겟 레시피에 반영
        Recipe source = pr.getSourceRecipe();
        Recipe target = pr.getTargetRecipe();
        target.update(
            source.getTitle().replace(" (Fork)", ""),
            source.getDescription(),
            source.getCategory(),
            source.getCookingTime(),
            source.getDifficulty(),
            target.isPublic()
        );

        commitService.createCommit(target, reviewer, "Merge: " + pr.getDescription());

        return PrResponse.from(pr);
    }

    // 거부
    @Transactional
    public PrResponse reject(String email, Long prId, String reason) {
        User reviewer = findUser(email);
        PullRequest pr = findPr(prId);
        pr.reject(reviewer, reason);
        return PrResponse.from(pr);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }

    private Recipe findRecipe(Long id) {
        return recipeRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("레시피를 찾을 수 없습니다."));
    }

    private PullRequest findPr(Long id) {
        return prRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("PR을 찾을 수 없습니다."));
    }
}
