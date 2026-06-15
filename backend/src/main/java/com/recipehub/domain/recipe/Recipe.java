package com.recipehub.domain.recipe;

import com.recipehub.domain.group.RecipeGroup;
import com.recipehub.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "recipes")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(length = 500)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    // Fork 원본 레시피
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "forked_from")
    private Recipe forkedFrom;

    // 그룹 (null이면 전체 공개)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private RecipeGroup group;

    @Column(nullable = false)
    private boolean isPublic = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecipeCategory category;

    @Column
    private Integer cookingTime;

    @Enumerated(EnumType.STRING)
    private Difficulty difficulty;

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Ingredient> ingredients = new ArrayList<>();

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CookingStep> cookingSteps = new ArrayList<>();

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Builder
    public Recipe(String title, String description, User owner, Recipe forkedFrom,
                  RecipeGroup group, boolean isPublic, RecipeCategory category,
                  Integer cookingTime, Difficulty difficulty) {
        this.title = title;
        this.description = description;
        this.owner = owner;
        this.forkedFrom = forkedFrom;
        this.group = group;
        this.isPublic = isPublic;
        this.category = category;
        this.cookingTime = cookingTime;
        this.difficulty = difficulty;
    }

    public void update(String title, String description, RecipeCategory category,
                       Integer cookingTime, Difficulty difficulty, boolean isPublic) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.cookingTime = cookingTime;
        this.difficulty = difficulty;
        this.isPublic = isPublic;
    }

    public void addIngredient(Ingredient ingredient) {
        this.ingredients.add(ingredient);
    }

    public void addCookingStep(CookingStep step) {
        this.cookingSteps.add(step);
    }

    public void clearForkedFrom() {
        this.forkedFrom = null;
    }
}
