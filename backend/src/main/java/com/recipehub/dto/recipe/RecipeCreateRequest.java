package com.recipehub.dto.recipe;

import com.recipehub.domain.recipe.Difficulty;
import com.recipehub.domain.recipe.RecipeCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class RecipeCreateRequest {

    @NotBlank(message = "레시피 제목을 입력해주세요.")
    private String title;
    private String description;

    @NotNull(message = "카테고리를 선택해주세요.")
    private RecipeCategory category;

    private Integer cookingTime;
    private Difficulty difficulty;
    private boolean isPublic = true;
    private Long groupId;  // 그룹 레시피 여부 (null이면 공개)

    private List<IngredientRequest> ingredients;
    private List<String> cookingSteps;

    @Getter
    @NoArgsConstructor
    public static class IngredientRequest {
        private String name;
        private String amount;
        private String unit;
    }
}
