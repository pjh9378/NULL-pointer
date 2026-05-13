import { useState } from "react";

// ① 레시피 데이터 (실제 서비스에서는 DB/API로 교체)
const RECIPES = [
  { id: 1, name: "김치찌개", tags: ["한식", "국물", "매운"], time: "30분", difficulty: "쉬움" },
  { id: 2, name: "된장찌개", tags: ["한식", "국물", "구수한"], time: "25분", difficulty: "쉬움" },
  { id: 3, name: "불고기",   tags: ["한식", "구이", "달콤한"], time: "40분", difficulty: "보통" },
  { id: 4, name: "카르보나라", tags: ["양식", "면", "크리미"],  time: "20분", difficulty: "보통" },
  { id: 5, name: "계란볶음밥", tags: ["한식", "밥", "간단"],   time: "15분", difficulty: "쉬움" },
  { id: 6, name: "돼지갈비찜", tags: ["한식", "찜", "특별"],   time: "60분", difficulty: "어려움" },
];

export default function RecipeSearch() {
  // ② 상태 관리
  const [query, setQuery]     = useState("");   // 검색어
  const [results, setResults] = useState([]);   // 검색 결과
  const [searched, setSearched] = useState(false); // 검색 실행 여부

  // ③ 검색 로직 — 이름 또는 태그에 검색어가 포함되면 노출
  const handleSearch = () => {
    const term = query.trim().toLowerCase();
    if (!term) return;

    const filtered = RECIPES.filter((recipe) => {
      const matchName = recipe.name.includes(term);
      const matchTag  = recipe.tags.some((tag) => tag.includes(term));
      return matchName || matchTag;
    });

    setResults(filtered);
    setSearched(true);
  };

  // ④ 엔터키 지원
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div style={styles.wrap}>
      <h1 style={styles.title}>🍽 레시피 검색</h1>

      {/* ⑤ 검색 입력 영역 */}
      <div style={styles.searchRow}>
        <input
          style={styles.input}
          placeholder="요리 이름이나 태그를 입력하세요 (예: 한식, 매운)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button style={styles.btn} onClick={handleSearch}>
          검색
        </button>
      </div>

      {/* ⑥ 검색 결과 영역 */}
      {searched && (
        <div style={styles.results}>
          {results.length === 0 ? (
            // ⑦ 결과 없음 처리
            <p style={styles.empty}>검색 결과가 없습니다.</p>
          ) : (
            results.map((recipe) => (
              // ⑧ 결과 카드
              <div key={recipe.id} style={styles.card}>
                <div style={styles.cardName}>{recipe.name}</div>
                <div style={styles.cardMeta}>
                  ⏱ {recipe.time} &nbsp;|&nbsp; ◈ {recipe.difficulty}
                </div>
                <div style={styles.tagRow}>
                  {recipe.tags.map((tag) => (
                    <span key={tag} style={styles.tag}>{tag}</span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap:     { maxWidth: 600, margin: "60px auto", padding: "0 24px", fontFamily: "sans-serif" },
  title:    { fontSize: "1.6rem", marginBottom: 24, color: "#1a1a1a" },
  searchRow:{ display: "flex", gap: 8 },
  input:    { flex: 1, padding: "12px 16px", fontSize: "1rem", border: "1px solid #ddd", borderRadius: 8, outline: "none" },
  btn:      { padding: "12px 24px", background: "#c0392b", color: "#fff", border: "none", borderRadius: 8, fontSize: "1rem", cursor: "pointer" },
  results:  { marginTop: 24 },
  empty:    { color: "#999", textAlign: "center", padding: "40px 0" },
  card:     { padding: "18px 20px", border: "1px solid #eee", borderRadius: 10, marginBottom: 12, background: "#fafafa" },
  cardName: { fontWeight: "bold", fontSize: "1.1rem", marginBottom: 6 },
  cardMeta: { fontSize: "0.82rem", color: "#888", marginBottom: 10 },
  tagRow:   { display: "flex", gap: 6, flexWrap: "wrap" },
  tag:      { fontSize: "0.72rem", background: "#ffe8d6", color: "#c0392b", borderRadius: 4, padding: "3px 9px" },
};
