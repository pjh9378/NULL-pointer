package com.recipehub.repository;

import com.recipehub.domain.commit.PrStatus;
import com.recipehub.domain.commit.PullRequest;
import com.recipehub.domain.recipe.Recipe;
import com.recipehub.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PullRequestRepository extends JpaRepository<PullRequest, Long> {
    List<PullRequest> findByTargetRecipeAndStatus(Recipe targetRecipe, PrStatus status);
    List<PullRequest> findByAuthorOrderByCreatedAtDesc(User author);
    List<PullRequest> findByStatus(PrStatus status);
}
