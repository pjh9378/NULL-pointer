package com.recipehub.dto.group;

import com.recipehub.domain.group.GroupMember;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Builder
public class InviteResponse {
    private Long memberId;
    private Long groupId;
    private String groupName;
    private String ownerUsername;
    private LocalDateTime invitedAt;

    public static InviteResponse from(GroupMember member) {
        return InviteResponse.builder()
            .memberId(member.getId())
            .groupId(member.getGroup().getId())
            .groupName(member.getGroup().getName())
            .ownerUsername(member.getGroup().getOwner().getUsername())
            .invitedAt(member.getJoinedAt())
            .build();
    }
}
