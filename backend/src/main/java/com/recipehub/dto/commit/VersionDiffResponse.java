package com.recipehub.dto.commit;

import com.recipehub.domain.commit.Commit;
import lombok.*;

import java.time.LocalDateTime;
import java.util.*;

@Getter
@AllArgsConstructor
@Builder
public class VersionDiffResponse {
    private CommitInfo commitA;
    private CommitInfo commitB;
    private List<FieldDiff> diffs;
    private List<IngredientDiff> ingredientDiffs;

    public static VersionDiffResponse of(Commit a, Commit b, Map<?, ?> snapshotA, Map<?, ?> snapshotB) {
        List<FieldDiff> diffs = new ArrayList<>();
        List<String> fields = List.of("title", "description", "category", "cookingTime", "difficulty");

        for (String field : fields) {
            Object valA = snapshotA.get(field);
            Object valB = snapshotB.get(field);
            if (!Objects.equals(valA, valB)) {
                diffs.add(new FieldDiff(field, str(valA), str(valB)));
            }
        }

        // 재료 비교
        List<IngredientDiff> ingDiffs = new ArrayList<>();
        List<?> ingsA = (List<?>) snapshotA.get("ingredients");
        List<?> ingsB = (List<?>) snapshotB.get("ingredients");
        int maxLen = Math.max(ingsA != null ? ingsA.size() : 0, ingsB != null ? ingsB.size() : 0);
        for (int i = 0; i < maxLen; i++) {
            Map<?, ?> ingA = ingsA != null && i < ingsA.size() ? (Map<?, ?>) ingsA.get(i) : null;
            Map<?, ?> ingB = ingsB != null && i < ingsB.size() ? (Map<?, ?>) ingsB.get(i) : null;
            if (!Objects.equals(ingA, ingB)) {
                ingDiffs.add(new IngredientDiff(
                    ingA != null ? str(ingA.get("name")) : "-",
                    ingA != null ? str(ingA.get("amount")) + str(ingA.get("unit")) : "-",
                    ingB != null ? str(ingB.get("name")) : "-",
                    ingB != null ? str(ingB.get("amount")) + str(ingB.get("unit")) : "-"
                ));
            }
        }

        return VersionDiffResponse.builder()
            .commitA(new CommitInfo(a.getId(), a.getMessage(), a.getCreatedAt()))
            .commitB(new CommitInfo(b.getId(), b.getMessage(), b.getCreatedAt()))
            .diffs(diffs)
            .ingredientDiffs(ingDiffs)
            .build();
    }

    private static String str(Object o) { return o != null ? o.toString() : ""; }

    @Getter @AllArgsConstructor
    public static class CommitInfo {
        private Long id;
        private String message;
        private LocalDateTime createdAt;
    }

    @Getter @AllArgsConstructor
    public static class FieldDiff {
        private String field;
        private String before;
        private String after;
    }

    @Getter @AllArgsConstructor
    public static class IngredientDiff {
        private String nameA;
        private String amountA;
        private String nameB;
        private String amountB;
    }
}
