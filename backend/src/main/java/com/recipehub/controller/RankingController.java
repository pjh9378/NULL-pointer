package com.recipehub.controller;

import com.recipehub.dto.recipe.RecipeResponse;
import com.recipehub.service.RankingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ranking")
@RequiredArgsConstructor
public class RankingController {

    private final RankingService rankingService;

    // 인기 레시피 TOP 10
    @GetMapping
    public ResponseEntity<List<RecipeResponse>> getTopRecipes() {
        return ResponseEntity.ok(rankingService.getTopRecipes());
    }

    // 특정 레시피 조회수
    @GetMapping("/{recipeId}/views")
    public ResponseEntity<Map<String, Long>> getViewCount(@PathVariable Long recipeId) {
        return ResponseEntity.ok(Map.of("views", rankingService.getViewCount(recipeId)));
    }

    // 랭킹 초기화 (관리자용)
    @DeleteMapping("/reset")
    public ResponseEntity<Void> resetRanking() {
        rankingService.resetRanking();
        return ResponseEntity.ok().build();
    }
}
