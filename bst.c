#include <string.h>
#include "bst.h"
#include "recipe.h"

/* BST 삽입: 이름 기준 알파벳(가나다)순 정렬 */
Recipe *bst_insert(Recipe *root, Recipe *node) {
    if (!root) return node;

    int cmp = strcmp(node->name, root->name);
    if      (cmp < 0) root->left  = bst_insert(root->left,  node);
    else if (cmp > 0) root->right = bst_insert(root->right, node);
    /* 동일 이름 중복 삽입 무시 */
    return root;
}

/* 내부 헬퍼: 서브트리에서 최솟값 노드 반환 */
static Recipe *min_node(Recipe *node) {
    while (node->left) node = node->left;
    return node;
}

/* BST 삭제: 이름으로 노드 제거 후 재구성 */
Recipe *bst_delete(Recipe *root, const char *name) {
    if (!root) return NULL;

    int cmp = strcmp(name, root->name);
    if (cmp < 0) {
        root->left  = bst_delete(root->left,  name);
    } else if (cmp > 0) {
        root->right = bst_delete(root->right, name);
    } else {
        /* 삭제 대상 발견 */
        if (!root->left) {
            Recipe *tmp = root->right;
            recipe_free(root);
            return tmp;
        }
        if (!root->right) {
            Recipe *tmp = root->left;
            recipe_free(root);
            return tmp;
        }
        /* 자식이 둘: 오른쪽 서브트리 최솟값으로 교체 */
        Recipe *successor = min_node(root->right);
        strncpy(root->name,        successor->name,        MAX_NAME - 1);
        strncpy(root->ingredients, successor->ingredients, MAX_INGREDIENT - 1);
        root->alt_count = successor->alt_count;
        for (int i = 0; i < successor->alt_count; i++)
            strncpy(root->alt_ingredients[i],
                    successor->alt_ingredients[i], MAX_NAME - 1);
        root->right = bst_delete(root->right, successor->name);
    }
    return root;
}

/* 중위순회: 방문 함수 콜백 */
void bst_inorder(const Recipe *root, void (*visit)(const Recipe *)) {
    if (!root) return;
    bst_inorder(root->left,  visit);
    visit(root);
    bst_inorder(root->right, visit);
}

/* BST 전체 메모리 해제 (후위순회) */
void bst_free(Recipe *root) {
    if (!root) return;
    bst_free(root->left);
    bst_free(root->right);
    recipe_free(root);
}
