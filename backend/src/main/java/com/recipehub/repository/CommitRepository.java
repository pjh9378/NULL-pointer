package com.recipehub.repository;

import com.recipehub.domain.commit.Commit;
import com.recipehub.domain.recipe.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommitRepository extends JpaRepository<Commit, Long> {
    // 레시피의 커밋 이력 (최신순)
    List<Commit> findByRecipeOrderByCreatedAtDesc(Recipe recipe);
}
