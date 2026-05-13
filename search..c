#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "bst.h"
#include "recipe.h"

// 1. 정확한 이름으로 레시피 검색 (이진 탐색 트리 활용)
RecipeNode* search_recipe_exact(RecipeNode* root, char* name) {
    // 트리가 비었거나 원하는 이름을 찾은 경우 반환
    if (root == NULL || strcmp(root->recipe.name, name) == 0) {
        return root;
    }

    // 이름 비교 후 왼쪽 또는 오른쪽으로 탐색 (BST 검색 알고리즘)
    if (strcmp(name, root->recipe.name) < 0) {
        return search_recipe_exact(root->left, name);
    } else {
        return search_recipe_exact(root->right, name);
    }
}

// 2. 키워드를 포함하는 레시피 목록 출력 (중위 순회 활용)
void display_recipes_by_keyword(RecipeNode* root, char* keyword, int* count) {
    if (root == NULL) return;

    // 왼쪽 서브트리 탐색
    display_recipes_by_keyword(root->left, keyword, count);

    // 현재 노드의 이름에 키워드가 포함되어 있는지 검사 (문자열 부분 일치)
    if (strstr(root->recipe.name, keyword) != NULL) {
        (*count)++;
        printf("[%d] %s (난이도: %d)\n", *count, root->recipe.name, root->recipe.difficulty);
    }

    // 오른쪽 서브트리 탐색
    display_recipes_by_keyword(root->right, keyword, count);
}

// 3. 검색 엔진 인터페이스 엔진 함수
void run_search_engine(RecipeNode* root) {
    char keyword[100];
    int found_count = 0;

    printf("\n--- 레시피 검색 엔진 ---\n");
    printf("검색어를 입력하세요: ");
    scanf("%s", keyword);

    printf("\n'%s' 검색 결과 목록:\n", keyword);
    printf("--------------------------\n");
    display_recipes_by_keyword(root, keyword, &found_count);
    
    if (found_count == 0) {
        printf("일치하는 레시피가 없습니다.\n");
    } else {
        printf("--------------------------\n");
        printf("총 %d개의 레시피를 발견했습니다.\n", found_count);
    }
}