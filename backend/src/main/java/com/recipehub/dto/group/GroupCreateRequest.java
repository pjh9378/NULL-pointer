package com.recipehub.dto.group;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class GroupCreateRequest {
    @NotBlank(message = "그룹 이름을 입력해주세요.")
    private String name;
    private String description;
}
