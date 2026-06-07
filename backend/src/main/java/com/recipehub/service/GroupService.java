package com.recipehub.service;

import com.recipehub.domain.group.*;
import com.recipehub.domain.user.User;
import com.recipehub.dto.group.*;
import com.recipehub.repository.GroupMemberRepository;
import com.recipehub.repository.GroupRepository;
import com.recipehub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    // 그룹 생성
    @Transactional
    public GroupResponse createGroup(String email, GroupCreateRequest request) {
        User owner = findUser(email);

        RecipeGroup group = RecipeGroup.builder()
            .name(request.getName())
            .description(request.getDescription())
            .owner(owner)
            .build();

        groupRepository.save(group);

        // 그룹장을 OWNER로 멤버에 추가
        GroupMember ownerMember = GroupMember.builder()
            .group(group)
            .user(owner)
            .role(GroupRole.OWNER)
            .inviteStatus(InviteStatus.ACCEPTED)
            .build();
        groupMemberRepository.save(ownerMember);

        return GroupResponse.from(group, GroupRole.OWNER);
    }

    // 내 그룹 목록
    @Transactional(readOnly = true)
    public List<GroupResponse> getMyGroups(String email) {
        User user = findUser(email);
        return groupRepository.findAllMyGroups(user).stream()
            .map(g -> {
                GroupRole role = g.getOwner().getId().equals(user.getId())
                    ? GroupRole.OWNER : GroupRole.MEMBER;
                return GroupResponse.from(g, role);
            }).toList();
    }

    // 그룹 상세 조회
    @Transactional(readOnly = true)
    public GroupResponse getGroup(String email, Long groupId) {
        User user = findUser(email);
        RecipeGroup group = findGroup(groupId);
        validateMember(user, group);
        GroupRole role = group.getOwner().getId().equals(user.getId())
            ? GroupRole.OWNER : GroupRole.MEMBER;
        return GroupResponse.from(group, role);
    }

    // 멤버 초대 (그룹장만)
    @Transactional
    public void invite(String email, Long groupId, String targetEmail) {
        User owner = findUser(email);
        RecipeGroup group = findGroup(groupId);
        validateOwner(owner, group);

        User target = userRepository.findByEmail(targetEmail)
            .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 이메일입니다: " + targetEmail));

        if (groupMemberRepository.findByGroupAndUser(group, target).isPresent()) {
            throw new IllegalArgumentException("이미 초대된 멤버입니다.");
        }

        GroupMember member = GroupMember.builder()
            .group(group)
            .user(target)
            .role(GroupRole.MEMBER)
            .inviteStatus(InviteStatus.PENDING)
            .build();
        groupMemberRepository.save(member);
    }

    // 초대 수락/거절
    @Transactional
    public void respondInvite(String email, Long memberId, boolean accept) {
        User user = findUser(email);
        GroupMember member = groupMemberRepository.findById(memberId)
            .orElseThrow(() -> new IllegalArgumentException("초대를 찾을 수 없습니다."));

        if (!member.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("본인의 초대만 처리할 수 있습니다.");
        }
        if (accept) member.accept();
        else member.reject();
    }

    // 대기 중인 초대 목록
    @Transactional(readOnly = true)
    public List<InviteResponse> getPendingInvites(String email) {
        User user = findUser(email);
        return groupMemberRepository.findByUserAndInviteStatus(user, InviteStatus.PENDING)
            .stream().map(InviteResponse::from).toList();
    }

    // 멤버 내보내기 (그룹장만)
    @Transactional
    public void removeMember(String email, Long groupId, Long memberId) {
        User owner = findUser(email);
        RecipeGroup group = findGroup(groupId);
        validateOwner(owner, group);

        GroupMember member = groupMemberRepository.findById(memberId)
            .orElseThrow(() -> new IllegalArgumentException("멤버를 찾을 수 없습니다."));

        if (member.getRole() == GroupRole.OWNER) {
            throw new IllegalArgumentException("그룹장은 내보낼 수 없습니다.");
        }
        groupMemberRepository.delete(member);
    }

    // 그룹 멤버 목록
    @Transactional(readOnly = true)
    public List<MemberResponse> getMembers(String email, Long groupId) {
        User user = findUser(email);
        RecipeGroup group = findGroup(groupId);
        validateMember(user, group);
        return groupMemberRepository.findByGroup(group)
            .stream().map(MemberResponse::from).toList();
    }

    // 멤버 여부 확인 (다른 서비스에서 사용)
    @Transactional(readOnly = true)
    public boolean isMember(User user, RecipeGroup group) {
        return groupMemberRepository
            .existsByGroupAndUserAndInviteStatus(group, user, InviteStatus.ACCEPTED);
    }

    public RecipeGroup findGroup(Long id) {
        return groupRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("그룹을 찾을 수 없습니다."));
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }

    private void validateOwner(User user, RecipeGroup group) {
        if (!group.getOwner().getId().equals(user.getId())) {
            throw new IllegalArgumentException("그룹장만 할 수 있습니다.");
        }
    }

    private void validateMember(User user, RecipeGroup group) {
        boolean isOwner = group.getOwner().getId().equals(user.getId());
        boolean isMember = groupMemberRepository
            .existsByGroupAndUserAndInviteStatus(group, user, InviteStatus.ACCEPTED);
        if (!isOwner && !isMember) {
            throw new IllegalArgumentException("그룹 멤버만 접근할 수 있습니다.");
        }
    }
}
