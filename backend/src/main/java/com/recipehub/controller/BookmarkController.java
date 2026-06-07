package com.recipehub.controller;

import com.recipehub.dto.recipe.RecipeResponse;
import com.recipehub.service.BookmarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookmarks")
@RequiredArgsConstructor
public class BookmarkController {

    private final BookmarkService bookmarkService;

    @PostMapping("/{recipeId}/toggle")
    public ResponseEntity<Map<String, Boolean>> toggle(
            @AuthenticationPrincipal String email,
            @PathVariable Long recipeId) {
        boolean added = bookmarkService.toggle(email, recipeId);
        return ResponseEntity.ok(Map.of("bookmarked", added));
    }

    @GetMapping("/{recipeId}/status")
    public ResponseEntity<Map<String, Boolean>> status(
            @AuthenticationPrincipal String email,
            @PathVariable Long recipeId) {
        return ResponseEntity.ok(Map.of("bookmarked", bookmarkService.isBookmarked(email, recipeId)));
    }

    @GetMapping("/my")
    public ResponseEntity<List<RecipeResponse>> myBookmarks(
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(bookmarkService.getMyBookmarks(email));
    }
}
