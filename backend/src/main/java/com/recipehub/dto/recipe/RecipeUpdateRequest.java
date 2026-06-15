package com.recipehub.dto.recipe;

import com.recipehub.domain.recipe.Difficulty;
import com.recipehub.domain.recipe.RecipeCategory;
import lombok.Getter;
import com.recipehub.dto.recipe.RecipeCreateRequest;
import java.util.List;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class RecipeUpdateRequest {
    private String title;
    private String description;
    private RecipeCategory category;
    private Integer cookingTime;
    private Difficulty difficulty;
    private boolean isPublic;
    private List<RecipeCreateRequest.IngredientRequest> ingredients;
    private List<String> cookingSteps;
    private String commitMessage; // 수정 시 커밋 메시지
}
