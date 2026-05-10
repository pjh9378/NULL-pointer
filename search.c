#include <string.h>
#include "search.h"

/* 정확한 이름 검색: BST 특성으로 O(log n) */
Recipe *search_exact(Recipe *root, const char *name) {
    if (!root) return NULL;

    int cmp = strcmp(name, root->name);
    if      (cmp == 0) return root;
    else if (cmp  < 0) return search_exact(root->left,  name);
    else               return search_exact(root->right, name);
}

/* 키워드 포함 검색 (중위순회 전체 탐색)
 * - 이름 또는 재료 필드에 keyword가 포함된 노드를 results에 수집
 * - 반환값: 수집된 레시피 수                                       */
int search_keyword(Recipe *root, const char *keyword,
                   Recipe **results, int max_results) {
    if (!root || max_results <= 0) return 0;

    int count = 0;

    /* 왼쪽 서브트리 */
    count += search_keyword(root->left, keyword,
                            results, max_results - count);

    /* 현재 노드 검사 */
    if (strstr(root->name,        keyword) ||
        strstr(root->ingredients, keyword)) {
        results[count++] = root;
    }

    /* 오른쪽 서브트리 */
    count += search_keyword(root->right, keyword,
                            results + count, max_results - count);

    return count;
}
