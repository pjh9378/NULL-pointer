package com.recipehub.domain.recipe;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ingredients")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Ingredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 50)
    private String amount;

    @Column(length = 20)
    private String unit;

    @Builder
    public Ingredient(Recipe recipe, String name, String amount, String unit) {
        this.recipe = recipe;
        this.name = name;
        this.amount = amount;
        this.unit = unit;
    }
}
