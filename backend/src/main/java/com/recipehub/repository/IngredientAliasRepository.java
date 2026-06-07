package com.recipehub.repository;

import com.recipehub.domain.recipe.IngredientAlias;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IngredientAliasRepository extends JpaRepository<IngredientAlias, Long> {
    Optional<IngredientAlias> findByAlias(String alias);
}
