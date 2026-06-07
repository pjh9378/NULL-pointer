package com.recipehub.repository;

import com.recipehub.domain.group.GroupMember;
import com.recipehub.domain.group.InviteStatus;
import com.recipehub.domain.group.RecipeGroup;
import com.recipehub.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    Optional<GroupMember> findByGroupAndUser(RecipeGroup group, User user);
    List<GroupMember> findByUserAndInviteStatus(User user, InviteStatus status);
    boolean existsByGroupAndUserAndInviteStatus(RecipeGroup group, User user, InviteStatus status);
    List<GroupMember> findByGroup(RecipeGroup group);
}
