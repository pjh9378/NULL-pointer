package com.recipehub.controller;

import com.recipehub.dto.pr.PrCreateRequest;
import com.recipehub.dto.pr.PrRejectRequest;
import com.recipehub.dto.pr.PrResponse;
import com.recipehub.service.PullRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pull-requests")
@RequiredArgsConstructor
public class PullRequestController {

    private final PullRequestService prService;

    @PostMapping
    public ResponseEntity<PrResponse> create(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody PrCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(prService.createPr(email, request));
    }

    @GetMapping
    public ResponseEntity<List<PrResponse>> getAll() {
        return ResponseEntity.ok(prService.getAllPrs());
    }

    @GetMapping("/my")
    public ResponseEntity<List<PrResponse>> getMy(@AuthenticationPrincipal String email) {
        return ResponseEntity.ok(prService.getMyPrs(email));
    }

    @GetMapping("/incoming/{recipeId}")
    public ResponseEntity<List<PrResponse>> getIncoming(@PathVariable Long recipeId) {
        return ResponseEntity.ok(prService.getIncomingPrs(recipeId));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<PrResponse> approve(
            @AuthenticationPrincipal String email,
            @PathVariable Long id) {
        return ResponseEntity.ok(prService.approve(email, id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<PrResponse> reject(
            @AuthenticationPrincipal String email,
            @PathVariable Long id,
            @RequestBody PrRejectRequest request) {
        return ResponseEntity.ok(prService.reject(email, id, request.getReason()));
    }
}
