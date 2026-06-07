package com.recipehub.controller;

import com.recipehub.dto.commit.CommitResponse;
import com.recipehub.dto.commit.VersionDiffResponse;
import com.recipehub.service.CommitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CommitController {

    private final CommitService commitService;

    // 레시피 커밋 이력
    @GetMapping("/recipes/{recipeId}/commits")
    public ResponseEntity<List<CommitResponse>> getHistory(@PathVariable Long recipeId) {
        return ResponseEntity.ok(commitService.getCommitHistory(recipeId));
    }

    // 두 버전 비교
    @GetMapping("/commits/compare")
    public ResponseEntity<VersionDiffResponse> compare(
            @RequestParam Long commitAId,
            @RequestParam Long commitBId) {
        return ResponseEntity.ok(commitService.compareVersions(commitAId, commitBId));
    }

    // 특정 커밋으로 복구
    @PostMapping("/recipes/{recipeId}/commits/{commitId}/restore")
    public ResponseEntity<Void> restore(
            @AuthenticationPrincipal String email,
            @PathVariable Long recipeId,
            @PathVariable Long commitId) {
        commitService.restoreToCommit(email, recipeId, commitId);
        return ResponseEntity.ok().build();
    }
}
