package com.recipehub.domain.commit;

import com.recipehub.domain.recipe.Recipe;
import com.recipehub.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "pull_requests")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class PullRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Fork된 레시피 (수정한 쪽)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_recipe_id", nullable = false)
    private Recipe sourceRecipe;

    // 반영될 원본 레시피 (본사)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_recipe_id", nullable = false)
    private Recipe targetRecipe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PrStatus status = PrStatus.OPEN;

    @Column(length = 1000)
    private String description;

    // 거부 시 반려 사유
    @Column(length = 500)
    private String rejectReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    private LocalDateTime reviewedAt;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public PullRequest(Recipe sourceRecipe, Recipe targetRecipe, User author, String description) {
        this.sourceRecipe = sourceRecipe;
        this.targetRecipe = targetRecipe;
        this.author = author;
        this.description = description;
        this.status = PrStatus.OPEN;
    }

    public void approve(User reviewer) {
        this.status = PrStatus.MERGED;
        this.reviewedBy = reviewer;
        this.reviewedAt = LocalDateTime.now();
    }

    public void reject(User reviewer, String reason) {
        this.status = PrStatus.CLOSED;
        this.reviewedBy = reviewer;
        this.rejectReason = reason;
        this.reviewedAt = LocalDateTime.now();
    }
}
