package com.recipehub.controller;

import com.recipehub.dto.recipe.RecipeCreateRequest;
import com.recipehub.dto.recipe.RecipeResponse;
import com.recipehub.dto.recipe.RecipeUpdateRequest;
import com.recipehub.service.RecipeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recipes")
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService recipeService;

    // 전체 공개 레시피
    @GetMapping
    public ResponseEntity<Page<RecipeResponse>> getRecipes(
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 12) Pageable pageable) {
        if (keyword != null && !keyword.isBlank()) {
            return ResponseEntity.ok(recipeService.searchRecipes(keyword, pageable));
        }
        return ResponseEntity.ok(recipeService.getPublicRecipes(pageable));
    }

    // 그룹 레시피 목록
    @GetMapping("/group/{groupId}")
    public ResponseEntity<Page<RecipeResponse>> getGroupRecipes(
            @AuthenticationPrincipal String email,
            @PathVariable Long groupId,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 12) Pageable pageable) {
        if (keyword != null && !keyword.isBlank()) {
            return ResponseEntity.ok(recipeService.searchGroupRecipes(email, groupId, keyword, pageable));
        }
        return ResponseEntity.ok(recipeService.getGroupRecipes(email, groupId, pageable));
    }

    // 레시피 단건 조회
    @GetMapping("/{id}")
    public ResponseEntity<RecipeResponse> getRecipe(
            @AuthenticationPrincipal String email,
            @PathVariable Long id) {
        return ResponseEntity.ok(recipeService.getRecipe(email, id));
    }

    // 내 레시피
    @GetMapping("/my")
    public ResponseEntity<Page<RecipeResponse>> getMyRecipes(
            @AuthenticationPrincipal String email,
            @PageableDefault(size = 12) Pageable pageable) {
        return ResponseEntity.ok(recipeService.getMyRecipes(email, pageable));
    }

    // 레시피 등록
    @PostMapping
    public ResponseEntity<RecipeResponse> createRecipe(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody RecipeCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(recipeService.createRecipe(email, request));
    }

    // 레시피 수정
    @PutMapping("/{id}")
    public ResponseEntity<RecipeResponse> updateRecipe(
            @AuthenticationPrincipal String email,
            @PathVariable Long id,
            @RequestBody RecipeUpdateRequest request) {
        return ResponseEntity.ok(recipeService.updateRecipe(email, id, request));
    }

    // 레시피 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecipe(
            @AuthenticationPrincipal String email,
            @PathVariable Long id) {
        recipeService.deleteRecipe(email, id);
        return ResponseEntity.noContent().build();
    }

    // Fork
    @PostMapping("/{id}/fork")
    public ResponseEntity<RecipeResponse> forkRecipe(
            @AuthenticationPrincipal String email,
            @PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(recipeService.forkRecipe(email, id));
    }
    @PostMapping("/{id}/share/{groupId}")
    public ResponseEntity<RecipeResponse> shareToGroup(
            @AuthenticationPrincipal String email,
            @PathVariable Long id,
            @PathVariable Long groupId) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(recipeService.shareToGroup(email, id, groupId));
    }
    @GetMapping("/accessible")
    public ResponseEntity<Page<RecipeResponse>> getAccessibleRecipes(
            @AuthenticationPrincipal String email,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(recipeService.getAccessibleRecipes(email, pageable));
    }
}
