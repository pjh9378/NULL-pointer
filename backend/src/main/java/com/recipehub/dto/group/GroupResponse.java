package com.recipehub.dto.group;

import com.recipehub.domain.group.GroupRole;
import com.recipehub.domain.group.RecipeGroup;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Builder
public class GroupResponse {
    private Long id;
    private String name;
    private String description;
    private String ownerUsername;
    private GroupRole myRole;
    private int memberCount;
    private LocalDateTime createdAt;

    public static GroupResponse from(RecipeGroup group, GroupRole myRole) {
        return GroupResponse.builder()
            .id(group.getId())
            .name(group.getName())
            .description(group.getDescription())
            .ownerUsername(group.getOwner().getUsername())
            .myRole(myRole)
            .memberCount(group.getMembers().size())
            .createdAt(group.getCreatedAt())
            .build();
    }
}
