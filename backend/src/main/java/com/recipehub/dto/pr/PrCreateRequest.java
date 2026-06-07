package com.recipehub.dto.pr;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PrCreateRequest {
    @NotNull
    private Long sourceRecipeId;
    @NotNull
    private Long targetRecipeId;
    private String description;
}
