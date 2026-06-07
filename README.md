# 🍳 RecipeHub

> **요식업계의 GitHub** — COMMIT할수록 맛있어지는 오픈소스 레시피 형상관리 플랫폼

---

## 📌 프로젝트 소개

RecipeHub는 GitHub의 형상관리 개념(Commit, Fork, Merge, Branch)을 레시피 관리에 적용한 웹 서비스입니다.  
프랜차이즈 본사와 가맹점 간의 레시피 협업, 버전 관리, 품질 관리를 하나의 플랫폼에서 제공합니다.

---

## 👥 팀 소개

| 이름 | 역할 |
|------|------|
| 서재희 | 팀장 |
| 송동준 | 메인 프로그래머 |
| 박재형 | 서브 프로그래머 / 서기 |

**팀명:** NULL-pointer

---

## 🛠 기술 스택

### Backend
- Java 17
- Spring Boot 3.2
- Spring Data JPA
- Spring Security + JWT
- PostgreSQL
- Redis (조회수 랭킹, 캐시)

### Frontend
- React 18
- React Router DOM
- Axios
- Chart.js / react-chartjs-2

---

## ✨ 핵심 기능

### 🔀 GitHub 기반 레시피 관리
- **Fork** — 본사 레시피를 가맹점이 복사해 독립적으로 수정
- **Commit** — 레시피 수정 시 자동으로 변경 이력 저장
- **Merge (PR)** — 가맹점이 수정한 레시피를 본사에 반영 요청
- **버전 비교** — 두 커밋 간 재료 배합 비율 변화를 막대그래프로 시각화
- **복구** — 특정 커밋 시점으로 레시피 복원

### 👥 그룹 시스템
- 그룹 생성 및 멤버 초대 (이메일 기반)
- 그룹 레시피는 멤버만 접근 가능 (비공개)
- 그룹장 / 멤버 권한 구분
- 내 레시피를 그룹에 공유 (Fork 방식 복사)

### 🔍 검색 & 자동완성
- **Trie 자료구조** 기반 실시간 자동완성 (전위순회)
- 카테고리, 난이도, 조리시간 필터 검색
- **HashMap (Alias Dictionary)** 기반 재료 표준화

### 📋 기타
- 즐겨찾기 토글
- 마이페이지 (내 레시피 / 즐겨찾기 / PR 현황)
- 관리자 페이지 (PR 승인 / 거부)

---

## 🗂 자료구조 설계

| 자료구조 | 적용 위치 | 설명 |
|----------|-----------|------|
| **Trie** (다진트리, 전위순회) | 검색 자동완성 | 접두사 기반 O(L) 탐색 |
| **Linked List** (단방향) | Commit History | HEAD → 이전 커밋 포인터 연결 |
| **Tree** | Fork / Branch 관계 | 본사 레시피(루트) → 가맹점(자식) |
| **HashMap** | 권한 조회, 재료 표준화 | O(1) 접근, Alias Dictionary |

---

## 🏗 시스템 아키텍처

```
사용자 (일반 / 가맹점 / 본사 관리자)
        ↓
Frontend (React · JS ES6+ · CSS3)
  - UI/UX Components
  - Recipe Timer Module
  - Tree/Stack Visualizer
        ↓
Backend (Java 17 · Spring Boot 3.2 · Spring Data JPA)
  - REST Controller
  - Category Tree Search (Trie)
  - Error Handling Stack
  - Ingredient Linked List
  - Recipe Versioning Manager
        ↓
Database Layer
  - PostgreSQL (레시피 & 이력)
  - Redis (랭킹 & 캐시)
```

---

## 🚀 실행 방법

### 사전 준비
- Java 21
- Node.js 24+
- PostgreSQL
- Redis

### 환경 설정

**PostgreSQL DB 생성:**
```sql
CREATE DATABASE recipehub;
CREATE USER recipehub WITH PASSWORD 'recipehub1234';
GRANT ALL PRIVILEGES ON DATABASE recipehub TO recipehub;
GRANT ALL ON SCHEMA public TO recipehub;
```

**Redis 실행:**
```bash
brew services start redis
```

### 백엔드 실행
```bash
cd backend
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
gradle wrapper --gradle-version 8.5
chmod +x gradlew
./gradlew bootRun
```

### 프론트엔드 실행
```bash
cd frontend
npm install
npm start
```

접속: `http://localhost:3000`

---

## 📁 프로젝트 구조

```
recipehub/
├── backend/
│   └── src/main/java/com/recipehub/
│       ├── controller/       # REST API 컨트롤러
│       ├── service/          # 비즈니스 로직
│       ├── domain/           # JPA 엔티티
│       │   ├── user/
│       │   ├── recipe/
│       │   ├── commit/
│       │   └── group/
│       ├── repository/       # Spring Data JPA
│       ├── dto/              # 요청/응답 DTO
│       ├── security/         # JWT 인증
│       └── config/           # Spring 설정
└── frontend/
    └── src/
        ├── pages/            # 페이지 컴포넌트
        ├── components/       # 공통 컴포넌트
        ├── api/              # Axios API 모듈
        └── context/          # 전역 상태 (AuthContext)
```

---

## 📊 데이터베이스 설계

| 테이블 | 설명 |
|--------|------|
| `users` | 사용자 정보 (GENERAL / FRANCHISE / ADMIN) |
| `recipes` | 레시피 정보 (group_id, forked_from 포함) |
| `ingredients` | 재료 (Alias 표준화 포함) |
| `cooking_steps` | 조리 순서 |
| `commits` | 레시피 버전 이력 (JSON 스냅샷) |
| `pull_requests` | Merge 요청 (OPEN / MERGED / CLOSED) |
| `recipe_groups` | 그룹 정보 |
| `group_members` | 그룹 멤버 (PENDING / ACCEPTED / REJECTED) |
| `bookmarks` | 즐겨찾기 |
| `ingredient_aliases` | 재료 표준화 사전 |

---

## 📝 API 엔드포인트

| Method | URL | 설명 |
|--------|-----|------|
| POST | `/api/auth/signup` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| GET | `/api/recipes` | 공개 레시피 목록 |
| GET | `/api/recipes/accessible` | 내가 볼 수 있는 레시피 전체 |
| POST | `/api/recipes` | 레시피 등록 |
| POST | `/api/recipes/{id}/fork` | 레시피 Fork |
| POST | `/api/recipes/{id}/share/{groupId}` | 그룹에 레시피 공유 |
| GET | `/api/recipes/{id}/commits` | 커밋 이력 조회 |
| GET | `/api/commits/compare` | 버전 비교 |
| POST | `/api/pull-requests` | PR 생성 |
| POST | `/api/pull-requests/{id}/approve` | PR 승인 |
| POST | `/api/pull-requests/{id}/reject` | PR 거부 |
| POST | `/api/groups` | 그룹 생성 |
| POST | `/api/groups/{id}/invite` | 멤버 초대 |
| GET | `/api/search/autocomplete` | 자동완성 (Trie) |

---

## 🔐 테스트 계정

| 역할 | 이메일 | 비밀번호 |
|------|--------|----------|
| 일반 사용자 | admin@recipe.hub | 12345678 |
| 본사 관리자 | head@recipe.hub | 12345678 |
| 가맹점 | under@recipe.hub | 12345678 |