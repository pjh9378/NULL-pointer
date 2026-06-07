package com.recipehub.domain.recipe;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cooking_steps")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CookingStep {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @Column(nullable = false)
    private int stepOrder;

    @Column(nullable = false, length = 1000)
    private String description;

    @Builder
    public CookingStep(Recipe recipe, int stepOrder, String description) {
        this.recipe = recipe;
        this.stepOrder = stepOrder;
        this.description = description;
    }
}
