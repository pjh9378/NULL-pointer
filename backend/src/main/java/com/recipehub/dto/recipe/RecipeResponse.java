package com.recipehub.dto.recipe;

import com.recipehub.domain.recipe.CookingStep;
import com.recipehub.domain.recipe.Difficulty;
import com.recipehub.domain.recipe.Ingredient;
import com.recipehub.domain.recipe.Recipe;
import com.recipehub.domain.recipe.RecipeCategory;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecipeResponse {
    private Long id;
    private String title;
    private String description;
    private String ownerUsername;
    private Long forkedFromId;
    private String forkedFromTitle;
    private Long groupId;
    private String groupName;
    private boolean isPublic;
    private RecipeCategory category;
    private Integer cookingTime;
    private Difficulty difficulty;
    private List<IngredientDto> ingredients;
    private List<StepDto> cookingSteps;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static RecipeResponse from(Recipe recipe) {
        return RecipeResponse.builder()
            .id(recipe.getId())
            .title(recipe.getTitle())
            .description(recipe.getDescription())
            .ownerUsername(recipe.getOwner().getUsername())
            .forkedFromId(recipe.getForkedFrom() != null ? recipe.getForkedFrom().getId() : null)
            .forkedFromTitle(recipe.getForkedFrom() != null ? recipe.getForkedFrom().getTitle() : null)
            .groupId(recipe.getGroup() != null ? recipe.getGroup().getId() : null)
            .groupName(recipe.getGroup() != null ? recipe.getGroup().getName() : null)
            .isPublic(recipe.isPublic())
            .category(recipe.getCategory())
            .cookingTime(recipe.getCookingTime())
            .difficulty(recipe.getDifficulty())
            .ingredients(recipe.getIngredients().stream().map(IngredientDto::from).toList())
            .cookingSteps(recipe.getCookingSteps().stream()
                .sorted((a, b) -> Integer.compare(a.getStepOrder(), b.getStepOrder()))
                .map(StepDto::from).toList())
            .createdAt(recipe.getCreatedAt())
            .updatedAt(recipe.getUpdatedAt())
            .build();
    }

    @Getter @AllArgsConstructor
    public static class IngredientDto {
        private Long id;
        private String name;
        private String amount;
        private String unit;
        public static IngredientDto from(Ingredient i) {
            return new IngredientDto(i.getId(), i.getName(), i.getAmount(), i.getUnit());
        }
    }

    @Getter @AllArgsConstructor
    public static class StepDto {
        private int stepOrder;
        private String description;
        public static StepDto from(CookingStep s) {
            return new StepDto(s.getStepOrder(), s.getDescription());
        }
    }
}
