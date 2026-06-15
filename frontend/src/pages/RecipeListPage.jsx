import { useState, useEffect, useRef } from 'react';
import { recipeApi, searchApi, bookmarkApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function RecipeListPage() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    recipeApi.getAccessible({ keyword: search || undefined, size: 20 })
      .then(res => setRecipes(res.data.content))
      .catch(console.error)
      .finally(() => setLoading(false));
    bookmarkApi.getMy().then(res => setBookmarks(res.data)).catch(() => {});
  }, [search]);

  const handleKeywordChange = (e) => {
    const val = e.target.value;
    setKeyword(val);
    clearTimeout(debounceRef.current);
    if (val.trim().length < 1) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchApi.autocomplete(val.trim());
        setSuggestions(res.data);
      } catch { setSuggestions([]); }
    }, 200);
  };

  const handleSuggestionClick = (suggestion) => {
      setSuggestions([]);
      setKeyword('');
      navigate(`/recipes/${suggestion.id}`);
  };

  return (
    <div>
      {/* 히어로 섹션 */}
      <div style={{ background: '#EEEEEE', padding: '20px 16px 20px', position: 'relative', borderRadius: '0 0 20px 20px' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, fontSize: 48, opacity: 0.15, lineHeight: 1, padding: 4 }}>
          🍅🌶️🧅🥩🍳
        </div>
        <p style={{ fontSize: 20, fontWeight: 700, margin: '0 0 2px', color: '#111', position: 'relative' }}>
          👋 안녕하세요, {user?.username}님!
        </p>
        <p style={{ fontSize: 13, color: '#555', margin: '0 0 16px', position: 'relative' }}>
          오늘도 맛있는 레시피를 찾아볼까요?
        </p>
        <div style={{ position: 'relative', display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              style={{ width: '100%', padding: '10px 14px', border: 'none', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', background: '#fff', color: '#333' }}
              placeholder="🔍  레시피 검색... (자동완성 지원)"
              value={keyword}
              onChange={handleKeywordChange}
              onKeyDown={e => { if (e.key === 'Enter') { setSearch(keyword); setSuggestions([]); } }}
              onBlur={() => setTimeout(() => setSuggestions([]), 150)}
            />
            {suggestions.length > 0 && (
              <ul style={suggestStyle}>
                {suggestions.map((s, i) => (
                    <li key={i} style={suggestItem} onMouseDown={() => handleSuggestionClick(s)}>
                        🔍 {s.title}
                    </li>
                ))}
              </ul>
            )}
          </div>
          <button
            onClick={() => { setSearch(keyword); setSuggestions([]); }}
            style={{ padding: '10px 20px', background: '#111', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
            검색
          </button>
        </div>
      </div>

      {/* 3컬럼 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: '20px 16px 24px' }}>

        {/* 전체 레시피 */}
        <div>
          <p style={colTitle}>🍽️ 전체 레시피</p>
          <div style={scrollBox}>
            {loading ? (
              <p style={emptyText}>불러오는 중...</p>
            ) : recipes.length === 0 ? (
              <p style={emptyText}>등록된 레시피가 없습니다.</p>
            ) : recipes.map(r => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        </div>

        {/* 즐겨찾는 레시피 */}
        <div>
          <p style={colTitle}>⭐ 즐겨찾는 레시피</p>
          <div style={scrollBox}>
            {bookmarks.length === 0 ? (
              <p style={emptyText}>즐겨찾기한 레시피가 없습니다.</p>
            ) : bookmarks.map(r => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RecipeCard({ recipe, rank }) {
  return (
    <Link to={`/recipes/${recipe.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#111', flex: 1 }}>{recipe.title}</p>
          {rank && (
            <span style={{ ...badgeStyle, background: rank <= 3 ? '#111' : '#888', color: '#fff', flexShrink: 0 }}>
              {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
            </span>
          )}
        </div>
        <p style={{ margin: '4px 0 6px', fontSize: 11, color: '#aaa' }}>by {recipe.ownerUsername}</p>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <span style={badgeStyle}>{recipe.category}</span>
          {recipe.difficulty && <span style={badgeStyle}>{recipe.difficulty}</span>}
          {recipe.cookingTime && <span style={badgeStyle}>{recipe.cookingTime}분</span>}
        </div>
      </div>
    </Link>
  );
}

const colTitle = { margin: '0 0 10px', fontSize: 14, fontWeight: 700, color: '#111' };
const scrollBox = {
  height: 'calc(100vh - 320px)',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  paddingRight: 4,
};
const cardStyle = { border: '1px solid #eee', borderRadius: 8, padding: 12, cursor: 'pointer', background: '#fff' };
const badgeStyle = { background: '#f0f0f0', padding: '2px 6px', borderRadius: 4, fontSize: 10, color: '#555' };
const emptyText = { fontSize: 12, color: '#aaa', margin: 0 };
const suggestStyle = { position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: 6, zIndex: 999, margin: '4px 0 0', padding: 0, listStyle: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' };
const suggestItem = { padding: '10px 14px', cursor: 'pointer', fontSize: 14, borderBottom: '1px solid #f0f0f0' };