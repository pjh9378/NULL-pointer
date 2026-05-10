# 레시피 검색엔진 (BST 기반)

이진 탐색 트리(BST)로 구현한 C 레시피 검색엔진.  
검색어 입력 → 레시피 목록 → 레시피 페이지 → 커밋 / 대체 재료 추천의 흐름을 모듈별로 분리했습니다.

---

## 📁 프로젝트 구조

```
recipe-search-engine/
├── include/
│   ├── recipe.h      # 레시피 구조체 & 노드 생성
│   ├── bst.h         # BST 삽입·삭제·순회
│   ├── search.h      # 정확한 검색 / 키워드 검색
│   ├── display.h     # 화면 출력 (목록·페이지)
│   ├── commit.h      # 즐겨찾기 커밋
│   └── recommend.h   # 대체 재료 추천
├── src/
│   ├── main.c        # 진입점 & 전체 플로우
│   ├── recipe.c
│   ├── bst.c
│   ├── search.c
│   ├── display.c
│   ├── commit.c
│   └── recommend.c
├── Makefile
└── README.md
```

---

## 🔨 빌드 & 실행

```bash
make          # 빌드
./recipe_search   # 실행
make clean    # 빌드 결과물 삭제
```

---

## 📦 권장 커밋 순서

| 순서 | 파일 | 커밋 메시지 예시 |
|------|------|----------------|
| 1 | `include/recipe.h` `src/recipe.c` | `feat: add Recipe struct and node creation` |
| 2 | `include/bst.h` `src/bst.c` | `feat: implement BST insert, delete, traversal` |
| 3 | `include/search.h` `src/search.c` | `feat: add exact and keyword search` |
| 4 | `include/display.h` `src/display.c` | `feat: add recipe list and page display` |
| 5 | `include/commit.h` `src/commit.c` | `feat: add recipe commit (favorites)` |
| 6 | `include/recommend.h` `src/recommend.c` | `feat: add alternative ingredient recommendation` |
| 7 | `src/main.c` | `feat: wire up full search engine flow` |
| 8 | `Makefile` `README.md` | `chore: add Makefile and README` |

---

## 🌳 자료구조 설계 요약

```
BST 구조 (이름 기준 정렬)

        김치찌개
       /        \
    된장찌개    카르보나라
               /        \
            비빔밥      파스타
```

- **삽입/정확한 검색**: O(log n)
- **키워드 검색**: O(n) — 중위순회로 전체 탐색
- **정렬된 목록 출력**: 중위순회 → 자동 가나다순

---

## 🔗 모듈 의존 관계

```
main.c
 ├── recipe   (구조체 정의)
 ├── bst      (트리 조작)
 ├── search   (검색 로직)
 ├── display  (출력)
 ├── commit   (즐겨찾기)
 └── recommend (추천)
```
