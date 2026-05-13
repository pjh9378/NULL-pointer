#include <stdio.h>
#include "recipe.h"
#include "bst.h"
#include "search.h"
#include "display.h"
#include "commit.h"
#include "recommend.h"

/* ── 샘플 데이터 로드 ────────────────────────── */
static Recipe *load_sample_data(void) {
    Recipe *root = NULL;

    Recipe *r1 = recipe_create("카르보나라", "스파게티, 베이컨, 달걀, 파마산치즈, 후추");
    recipe_add_alt(r1, "스파게티면"); recipe_add_alt(r1, "쌀국수");
    root = bst_insert(root, r1);

    Recipe *r2 = recipe_create("김치찌개", "김치, 돼지고기, 두부, 파, 고추장");
    recipe_add_alt(r2, "묵은지"); recipe_add_alt(r2, "백김치");
    root = bst_insert(root, r2);

    Recipe *r3 = recipe_create("비빔밥", "밥, 나물, 달걀, 고추장, 참기름");
    recipe_add_alt(r3, "고추장"); recipe_add_alt(r3, "간장");
    root = bst_insert(root, r3);

    Recipe *r4 = recipe_create("된장찌개", "된장, 두부, 호박, 감자, 조개");
    root = bst_insert(root, r4);

    Recipe *r5 = recipe_create("파스타", "면, 토마토소스, 올리브오일, 마늘, 바질");
    recipe_add_alt(r5, "스파게티면"); recipe_add_alt(r5, "링귀네");
    root = bst_insert(root, r5);

    return root;
}

int main(void) {
    printf("======== 레시피 검색엔진 시작 ========\n");

    /* Step 0: 엔진 초기화 */
    Recipe *root = load_sample_data();

    /* Step 1: 전체 레시피 목록 (가나다순) */
    printf("\n[전체 레시피 목록]\n");
    bst_inorder(root, display_recipe_name);

    /* Step 2: 키워드 검색 */
    const char *keyword = "찌개";
    printf("\n[검색어 입력]: \"%s\"\n", keyword);

    Recipe *results[20];
    int count = search_keyword(root, keyword, results, 20);
    printf("[검색 결과 (%d건)]\n", count);
    display_search_results(results, count);

    if (count == 0) { bst_free(root); return 0; }

    /* Step 3: 레시피 페이지 */
    Recipe *selected = results[0];
    display_recipe_page(selected);

    /* Step 4a: 커밋 */
    commit_recipe(selected);
    commit_show_all();

    /* Step 4b: 대체 재료 추천 */
    recommend_alternatives(selected);

    /* 보너스: 정확한 이름 검색 */
    printf("\n[정확한 이름 검색]: \"비빔밥\"\n");
    Recipe *exact = search_exact(root, "비빔밥");
    display_recipe_page(exact);

    /* Step 5: 재료 기반 추천 */
    printf("\n[재료 기반 추천]: \"달걀\" 포함 레시피\n");
    Recipe *by_ing[10];
    int cnt = recommend_by_ingredient(root, "달걀", by_ing, 10);
    display_search_results(by_ing, cnt);

    /* 정리 */
    commit_clear();
    bst_free(root);

    printf("\n======== 레시피 검색엔진 종료 ========\n");
    return 0;
}
