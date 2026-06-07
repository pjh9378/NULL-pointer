package com.recipehub.dto.group;

import com.recipehub.domain.group.GroupMember;
import com.recipehub.domain.group.GroupRole;
import com.recipehub.domain.group.InviteStatus;
import lombok.*;

@Getter
@AllArgsConstructor
@Builder
public class MemberResponse {
    private Long memberId;
    private Long userId;
    private String username;
    private String email;
    private GroupRole role;
    private InviteStatus inviteStatus;

    public static MemberResponse from(GroupMember member) {
        return MemberResponse.builder()
            .memberId(member.getId())
            .userId(member.getUser().getId())
            .username(member.getUser().getUsername())
            .email(member.getUser().getEmail())
            .role(member.getRole())
            .inviteStatus(member.getInviteStatus())
            .build();
    }
}
