package com.recipehub.domain.commit;

import com.recipehub.domain.recipe.Recipe;
import com.recipehub.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "commits")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Commit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, length = 200)
    private String message;

    // 변경된 재료/조리법 스냅샷 (JSON)
    @Column(columnDefinition = "TEXT")
    private String diffData;

    // 해당 시점 레시피 전체 스냅샷 (JSON)
    @Column(columnDefinition = "TEXT")
    private String snapshot;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public Commit(Recipe recipe, User author, String message, String diffData, String snapshot) {
        this.recipe = recipe;
        this.author = author;
        this.message = message;
        this.diffData = diffData;
        this.snapshot = snapshot;
    }
}
