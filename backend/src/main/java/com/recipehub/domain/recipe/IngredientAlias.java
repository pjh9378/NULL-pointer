package com.recipehub.domain.recipe;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ingredient_aliases")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class IngredientAlias {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String alias;       // 예: "체다치즈", "모짜렐라"

    @Column(nullable = false)
    private String standardName; // 예: "치즈류"

    @Builder
    public IngredientAlias(String alias, String standardName) {
        this.alias = alias;
        this.standardName = standardName;
    }
}
