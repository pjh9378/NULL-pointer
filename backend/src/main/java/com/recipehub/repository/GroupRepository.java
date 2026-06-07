package com.recipehub.repository;

import com.recipehub.domain.group.RecipeGroup;
import com.recipehub.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GroupRepository extends JpaRepository<RecipeGroup, Long> {
    List<RecipeGroup> findByOwner(User owner);

    // 내가 멤버로 속한 그룹 (수락된 것만)
    @Query("SELECT gm.group FROM GroupMember gm WHERE gm.user = :user AND gm.inviteStatus = 'ACCEPTED'")
    List<RecipeGroup> findGroupsByMember(@Param("user") User user);

    // 내가 속한 모든 그룹 (그룹장 + 멤버)
    @Query("SELECT DISTINCT g FROM RecipeGroup g LEFT JOIN g.members gm " +
           "WHERE g.owner = :user OR (gm.user = :user AND gm.inviteStatus = 'ACCEPTED')")
    List<RecipeGroup> findAllMyGroups(@Param("user") User user);
}
