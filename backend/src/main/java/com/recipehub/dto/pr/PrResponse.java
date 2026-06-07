package com.recipehub.dto.pr;

import com.recipehub.domain.commit.PrStatus;
import com.recipehub.domain.commit.PullRequest;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Builder
public class PrResponse {
    private Long id;
    private Long sourceRecipeId;
    private String sourceRecipeTitle;
    private Long targetRecipeId;
    private String targetRecipeTitle;
    private String authorUsername;
    private PrStatus status;
    private String description;
    private String rejectReason;
    private String reviewedBy;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;

    public static PrResponse from(PullRequest pr) {
        return PrResponse.builder()
            .id(pr.getId())
            .sourceRecipeId(pr.getSourceRecipe().getId())
            .sourceRecipeTitle(pr.getSourceRecipe().getTitle())
            .targetRecipeId(pr.getTargetRecipe().getId())
            .targetRecipeTitle(pr.getTargetRecipe().getTitle())
            .authorUsername(pr.getAuthor().getUsername())
            .status(pr.getStatus())
            .description(pr.getDescription())
            .rejectReason(pr.getRejectReason())
            .reviewedBy(pr.getReviewedBy() != null ? pr.getReviewedBy().getUsername() : null)
            .reviewedAt(pr.getReviewedAt())
            .createdAt(pr.getCreatedAt())
            .build();
    }
}
