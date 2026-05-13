#include <stdio.h>
#include "commit.h"

static Recipe *committed[MAX_COMMITS];
static int     g_count = 0;

/* 레시피 커밋: 성공 시 1, 실패 시 0 반환 */
int commit_recipe(Recipe *r) {
    if (!r) return 0;
    if (g_count >= MAX_COMMITS) {
        printf("[커밋 실패] 저장 공간이 가득 찼습니다. (최대 %d개)\n", MAX_COMMITS);
        return 0;
    }
    committed[g_count++] = r;
    printf("  >> '%s' 커밋 완료! (총 %d개)\n", r->name, g_count);
    return 1;
}

/* 저장된 커밋 목록 전체 출력 */
void commit_show_all(void) {
    printf("\n===== [커밋된 레시피 목록] =====\n");
    if (g_count == 0) { printf("  (없음)\n"); return; }
    for (int i = 0; i < g_count; i++)
        printf("  %d. %s\n", i + 1, committed[i]->name);
}

/* 현재 커밋 개수 반환 */
int commit_count(void) {
    return g_count;
}

/* 커밋 목록 초기화 (노드 메모리는 건드리지 않음) */
void commit_clear(void) {
    g_count = 0;
}
