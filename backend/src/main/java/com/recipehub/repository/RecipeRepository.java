package com.recipehub.repository;

import com.recipehub.domain.group.RecipeGroup;
import com.recipehub.domain.recipe.Recipe;
import com.recipehub.domain.recipe.RecipeCategory;
import com.recipehub.domain.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RecipeRepository extends JpaRepository<Recipe, Long> {

    // 전체 공개 레시피 (그룹 없는 것만)
    Page<Recipe> findByIsPublicTrueAndGroupIsNull(Pageable pageable);

    // 내 레시피
    Page<Recipe> findByOwner(User owner, Pageable pageable);

    // 그룹 레시피
    Page<Recipe> findByGroup(RecipeGroup group, Pageable pageable);

    // Fork 목록
    List<Recipe> findByForkedFrom(Recipe original);

    // 내가 볼 수 있는 레시피 전체 (내 레시피 + 내 그룹 레시피)
    @Query("SELECT r FROM Recipe r WHERE r.owner = :user OR " +
           "(r.group IS NOT NULL AND EXISTS (" +
           "  SELECT gm FROM GroupMember gm WHERE gm.group = r.group " +
           "  AND gm.user = :user AND gm.inviteStatus = 'ACCEPTED'" +
           "))")
    Page<Recipe> findAccessibleRecipes(@Param("user") User user, Pageable pageable);

    // 공개 레시피 키워드 검색
    @Query("SELECT r FROM Recipe r WHERE r.isPublic = true AND r.group IS NULL AND " +
           "(LOWER(r.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(r.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Recipe> searchPublicByKeyword(@Param("keyword") String keyword, Pageable pageable);

    // 그룹 내 키워드 검색
    @Query("SELECT r FROM Recipe r WHERE r.group = :group AND " +
           "(LOWER(r.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(r.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Recipe> searchGroupByKeyword(@Param("group") RecipeGroup group,
                                      @Param("keyword") String keyword, Pageable pageable);
}
