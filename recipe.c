#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "recipe.h"

/* 새 레시피 노드 생성 */
Recipe *recipe_create(const char *name, const char *ingredients) {
    Recipe *r = (Recipe *)calloc(1, sizeof(Recipe));
    if (!r) { perror("recipe_create: 메모리 할당 실패"); exit(1); }

    strncpy(r->name,        name,        MAX_NAME - 1);
    strncpy(r->ingredients, ingredients, MAX_INGREDIENT - 1);
    /* left, right, alt_count = 0 (calloc) */
    return r;
}

/* 대체 재료 추가 (최대 MAX_ALT개) */
void recipe_add_alt(Recipe *r, const char *alt) {
    if (!r || r->alt_count >= MAX_ALT) return;
    strncpy(r->alt_ingredients[r->alt_count++], alt, MAX_NAME - 1);
}

/* 단일 노드 메모리 해제 */
void recipe_free(Recipe *r) {
    free(r);
}
