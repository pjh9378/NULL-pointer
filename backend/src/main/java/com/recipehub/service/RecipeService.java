package com.recipehub.service;

import com.recipehub.domain.group.RecipeGroup;
import com.recipehub.domain.recipe.*;
import com.recipehub.domain.user.User;
import com.recipehub.dto.recipe.RecipeCreateRequest;
import com.recipehub.dto.recipe.RecipeResponse;
import com.recipehub.dto.recipe.RecipeUpdateRequest;
import com.recipehub.repository.RecipeRepository;
import com.recipehub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.recipehub.repository.CommitRepository;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private final CommitService commitService;
    private final CommitRepository commitRepository;
    private final SearchService searchService;
    private final RankingService rankingService;
    private final GroupService groupService;

    // 전체 공개 레시피 (그룹 없는 것)
    @Transactional(readOnly = true)
    public Page<RecipeResponse> getPublicRecipes(Pageable pageable) {
        return recipeRepository.findByIsPublicTrueAndGroupIsNull(pageable)
            .map(RecipeResponse::from);
    }

    // 그룹 레시피 목록
    @Transactional(readOnly = true)
    public Page<RecipeResponse> getGroupRecipes(String email, Long groupId, Pageable pageable) {
        User user = findUserByEmail(email);
        RecipeGroup group = groupService.findGroup(groupId);
        if (!groupService.isMember(user, group) && !group.getOwner().getId().equals(user.getId())) {
            throw new IllegalArgumentException("그룹 멤버만 접근할 수 있습니다.");
        }
        return recipeRepository.findByGroup(group, pageable).map(RecipeResponse::from);
    }

    // 레시피 단건 조회
    @Transactional(readOnly = true)
    public RecipeResponse getRecipe(String email, Long id) {
        Recipe recipe = findRecipeById(id);

        // 그룹 레시피면 멤버 여부 확인
        if (recipe.getGroup() != null) {
            User user = findUserByEmail(email);
            if (!groupService.isMember(user, recipe.getGroup())
                    && !recipe.getGroup().getOwner().getId().equals(user.getId())) {
                throw new IllegalArgumentException("그룹 멤버만 접근할 수 있습니다.");
            }
        }
        rankingService.incrementViewCount(id);
        return RecipeResponse.from(recipe);
    }

    // 공개 레시피 검색
    @Transactional(readOnly = true)
    public Page<RecipeResponse> searchRecipes(String keyword, Pageable pageable) {
        return recipeRepository.searchPublicByKeyword(keyword, pageable).map(RecipeResponse::from);
    }

    // 그룹 내 레시피 검색
    @Transactional(readOnly = true)
    public Page<RecipeResponse> searchGroupRecipes(String email, Long groupId, String keyword, Pageable pageable) {
        User user = findUserByEmail(email);
        RecipeGroup group = groupService.findGroup(groupId);
        if (!groupService.isMember(user, group) && !group.getOwner().getId().equals(user.getId())) {
            throw new IllegalArgumentException("그룹 멤버만 접근할 수 있습니다.");
        }
        return recipeRepository.searchGroupByKeyword(group, keyword, pageable).map(RecipeResponse::from);
    }

    // 내 레시피 목록
    @Transactional(readOnly = true)
    public Page<RecipeResponse> getMyRecipes(String email, Pageable pageable) {
        User user = findUserByEmail(email);
        return recipeRepository.findByOwner(user, pageable).map(RecipeResponse::from);
    }

    // 레시피 등록
    @Transactional
    public RecipeResponse createRecipe(String email, RecipeCreateRequest request) {
        User owner = findUserByEmail(email);

        // 그룹 레시피 여부
        RecipeGroup group = null;
        if (request.getGroupId() != null) {
            group = groupService.findGroup(request.getGroupId());
            if (!groupService.isMember(owner, group) && !group.getOwner().getId().equals(owner.getId())) {
                throw new IllegalArgumentException("그룹 멤버만 레시피를 등록할 수 있습니다.");
            }
        }

        Recipe recipe = Recipe.builder()
            .title(request.getTitle())
            .description(request.getDescription())
            .owner(owner)
            .group(group)
            .isPublic(false)
            .category(request.getCategory())
            .cookingTime(request.getCookingTime())
            .difficulty(request.getDifficulty())
            .build();

        if (request.getIngredients() != null) {
            request.getIngredients().forEach(i -> {
                String standardName = searchService.standardize(i.getName());
                recipe.addIngredient(Ingredient.builder()
                    .recipe(recipe).name(standardName)
                    .amount(i.getAmount()).unit(i.getUnit()).build());
            });
        }
        if (request.getCookingSteps() != null) {
            for (int i = 0; i < request.getCookingSteps().size(); i++) {
                recipe.addCookingStep(CookingStep.builder()
                    .recipe(recipe).stepOrder(i + 1)
                    .description(request.getCookingSteps().get(i)).build());
            }
        }

        Recipe saved = recipeRepository.save(recipe);
        commitService.createCommit(saved, owner, "최초 등록: " + saved.getTitle());
        searchService.addToTrie(saved.getTitle());
        return RecipeResponse.from(saved);
    }

    // 레시피 수정
    @Transactional
    public RecipeResponse updateRecipe(String email, Long recipeId, RecipeUpdateRequest request) {
        User user = findUserByEmail(email);
        Recipe recipe = findRecipeById(recipeId);
        validateOwner(email, recipe);

        recipe.update(request.getTitle(), request.getDescription(),
            request.getCategory(), request.getCookingTime(),
            request.getDifficulty(), request.isPublic());

        // 기존 재료 삭제 후 새로 추가
        recipe.getIngredients().clear();
        if (request.getIngredients() != null) {
            request.getIngredients().forEach(i -> {
                String standardName = searchService.standardize(i.getName());
                recipe.addIngredient(Ingredient.builder()
                    .recipe(recipe).name(standardName)
                    .amount(i.getAmount()).unit(i.getUnit()).build());
            });
        }

        // 기존 조리순서 삭제 후 새로 추가
        recipe.getCookingSteps().clear();
        if (request.getCookingSteps() != null) {
            for (int i = 0; i < request.getCookingSteps().size(); i++) {
                recipe.addCookingStep(CookingStep.builder()
                    .recipe(recipe).stepOrder(i + 1)
                    .description(request.getCookingSteps().get(i)).build());
            }
        }

        commitService.createCommit(recipe, user,
            request.getCommitMessage() != null ? request.getCommitMessage() : "레시피 수정");
        return RecipeResponse.from(recipe);
    }

    // 레시피 삭제
    @Transactional
    public void deleteRecipe(String email, Long recipeId) {
        Recipe recipe = findRecipeById(recipeId);
            validateOwner(email, recipe);
            searchService.removeFromTrie(recipe.getTitle());

            // 커밋 이력 삭제
            commitRepository.deleteAll(commitRepository.findByRecipeOrderByCreatedAtDesc(recipe));

            // Fork된 자식 레시피들의 forkedFrom 연결 끊기
            List<Recipe> forkedRecipes = recipeRepository.findByForkedFrom(recipe);
            forkedRecipes.forEach(r -> r.clearForkedFrom());

            recipeRepository.delete(recipe);
    }

    // Fork
    @Transactional
    public RecipeResponse forkRecipe(String email, Long originalId) {
        User user = findUserByEmail(email);
        Recipe original = findRecipeById(originalId);

        Recipe forked = Recipe.builder()
            .title(original.getTitle() + " (Fork)")
            .description(original.getDescription())
            .owner(user)
            .forkedFrom(original)
            .group(original.getGroup())
            .isPublic(false)
            .category(original.getCategory())
            .cookingTime(original.getCookingTime())
            .difficulty(original.getDifficulty())
            .build();

        original.getIngredients().forEach(i ->
            forked.addIngredient(Ingredient.builder()
                .recipe(forked).name(i.getName())
                .amount(i.getAmount()).unit(i.getUnit()).build()));

        original.getCookingSteps().forEach(s ->
            forked.addCookingStep(CookingStep.builder()
                .recipe(forked).stepOrder(s.getStepOrder())
                .description(s.getDescription()).build()));

        Recipe saved = recipeRepository.save(forked);
        commitService.createCommit(saved, user, "Fork: " + original.getTitle());
        searchService.addToTrie(saved.getTitle());
        return RecipeResponse.from(saved);
    }

    @Transactional
    public RecipeResponse shareToGroup(String email, Long recipeId, Long groupId) {
        User user = findUserByEmail(email);
        Recipe original = findRecipeById(recipeId);
        RecipeGroup group = groupService.findGroup(groupId);

        if (!groupService.isMember(user, group) && !group.getOwner().getId().equals(user.getId())) {
            throw new IllegalArgumentException("그룹 멤버만 공유할 수 있습니다.");
        }

        Recipe shared = Recipe.builder()
            .title(original.getTitle())
            .description(original.getDescription())
            .owner(user)
            .forkedFrom(original)
            .group(group)
            .isPublic(false)
            .category(original.getCategory())
            .cookingTime(original.getCookingTime())
            .difficulty(original.getDifficulty())
            .build();

        original.getIngredients().forEach(i ->
            shared.addIngredient(Ingredient.builder()
                .recipe(shared).name(i.getName())
                .amount(i.getAmount()).unit(i.getUnit()).build()));

        original.getCookingSteps().forEach(s ->
            shared.addCookingStep(CookingStep.builder()
                .recipe(shared).stepOrder(s.getStepOrder())
                .description(s.getDescription()).build()));

        Recipe saved = recipeRepository.save(shared);
        commitService.createCommit(saved, user, "그룹 공유: " + group.getName());
        return RecipeResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public Page<RecipeResponse> getAccessibleRecipes(String email, Pageable pageable) {
        User user = findUserByEmail(email);
        return recipeRepository.findAccessibleRecipes(user, pageable).map(RecipeResponse::from);
    }

    public Recipe findRecipeById(Long id) {
        return recipeRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("레시피를 찾을 수 없습니다. id=" + id));
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }

    private void validateOwner(String email, Recipe recipe) {
        if (!recipe.getOwner().getEmail().equals(email)) {
            throw new IllegalArgumentException("레시피 작성자만 수정할 수 있습니다.");
        }
    }
}
