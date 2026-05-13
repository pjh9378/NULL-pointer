#include <stdio.h>
#include "display.h"

/* 중위순회 콜백: 이름만 출력 */
void display_recipe_name(const Recipe *r) {
    printf("  - %s\n", r->name);
}

/* 레시피 상세 페이지 */
void display_recipe_page(const Recipe *r) {
    if (!r) { printf("[오류] 레시피 정보가 없습니다.\n"); return; }

    printf("\n========== [레시피 페이지] ==========\n");
    printf("  이름  : %s\n", r->name);
    printf("  재료  : %s\n", r->ingredients);

    if (r->alt_count > 0) {
        printf("  대체  :");
        for (int i = 0; i < r->alt_count; i++)
            printf(" %s", r->alt_ingredients[i]);
        printf("\n");
    }
    printf("=====================================\n");
}

/* 검색 결과 번호 목록 출력 */
void display_search_results(Recipe **results, int count) {
    if (count == 0) {
        printf("  (검색 결과 없음)\n");
        return;
    }
    for (int i = 0; i < count; i++)
        printf("  %d. %s\n", i + 1, results[i]->name);
}
