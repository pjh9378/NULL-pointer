#include <stdio.h>
#include <string.h>
#include "recommend.h"

/* 단일 레시피의 대체 재료 목록 출력 */
void recommend_alternatives(const Recipe *r) {
    printf("\n===== [대체 재료 추천] =====\n");
    if (!r || r->alt_count == 0) {
        printf("  대체 재료 정보가 없습니다.\n");
        return;
    }
    printf("  '%s'의 대체 재료:\n", r->name);
    for (int i = 0; i < r->alt_count; i++)
        printf("    %d. %s\n", i + 1, r->alt_ingredients[i]);
}

/* BST 중위순회: 특정 재료가 포함된 레시피 수집 */
int recommend_by_ingredient(Recipe *root, const char *ingredient,
                             Recipe **results, int max_results) {
    if (!root || max_results <= 0) return 0;

    int count = 0;
    count += recommend_by_ingredient(root->left, ingredient,
                                     results, max_results - count);

    if (strstr(root->ingredients, ingredient))
        results[count++] = root;

    count += recommend_by_ingredient(root->right, ingredient,
                                     results + count, max_results - count);
    return count;
}
