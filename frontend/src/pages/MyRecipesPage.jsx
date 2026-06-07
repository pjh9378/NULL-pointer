import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { recipeApi, bookmarkApi, prApi } from '../api';
import { useAuth } from '../context/AuthContext';

export default function MyRecipesPage() {
  const [tab, setTab] = useState('recipes');
  const [recipes, setRecipes] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [myPrs, setMyPrs] = useState([]);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    recipeApi.getMy().then(res => setRecipes(res.data.content)).catch(() => {});
    bookmarkApi.getMy().then(res => setBookmarks(res.data)).catch(() => {});
    prApi.getMy().then(res => setMyPrs(res.data)).catch(() => {});
  }, []);

  const statusColor = { OPEN: '#f59e0b', MERGED: '#10b981', CLOSED: '#ef4444' };
  const statusLabel = { OPEN: '검토 중', MERGED: '승인됨', CLOSED: '거부됨' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, paddingTop: 24 }}>마이페이지</h2>
        <button onClick={() => { logout(); navigate('/login'); }} style={{ ...newBtn, background: '#fff', color: '#111', border: '1px solid #ddd', cursor: 'pointer' }}>로그아웃</button>
      </div>

      {/* 탭 */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '2px solid #eee' }}>
        {[['recipes', '내 레시피'], ['bookmarks', '즐겨찾기'], ['prs', 'PR 현황']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
            fontWeight: tab === key ? 700 : 400, fontSize: 14,
            borderBottom: tab === key ? '2px solid #111' : '2px solid transparent',
            marginBottom: -2, color: tab === key ? '#111' : '#888',
          }}>{label}</button>
        ))}
      </div>

      {/* 내 레시피 */}
      {tab === 'recipes' && (
        <div style={grid}>
          {recipes.map(r => (
            <div key={r.id} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0, fontSize: 15 }}>{r.title}</h3>
                {r.forkedFromId && <span style={forkBadge}>Fork</span>}
              </div>
              <p style={{ fontSize: 12, color: '#aaa', margin: '6px 0 12px' }}>{r.category}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to={`/recipes/${r.id}`} style={linkBtn}>보기</Link>
                <Link to={`/recipes/${r.id}/edit`} style={linkBtn}>수정</Link>
              </div>
            </div>
          ))}
          {recipes.length === 0 && <p style={{ color: '#888' }}>등록한 레시피가 없습니다.</p>}
        </div>
      )}

      {/* 즐겨찾기 */}
      {tab === 'bookmarks' && (
        <div style={grid}>
          {bookmarks.map(r => (
            <Link key={r.id} to={`/recipes/${r.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={card}>
                <h3 style={{ margin: 0, fontSize: 15 }}>★ {r.title}</h3>
                <p style={{ fontSize: 12, color: '#aaa', margin: '6px 0 0' }}>{r.category} · by {r.ownerUsername}</p>
              </div>
            </Link>
          ))}
          {bookmarks.length === 0 && <p style={{ color: '#888' }}>즐겨찾기한 레시피가 없습니다.</p>}
        </div>
      )}

      {/* PR 현황 */}
      {tab === 'prs' && (
        <div>
          {myPrs.map(pr => (
            <div key={pr.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingTop: 24 }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600 }}>{pr.sourceRecipeTitle} → {pr.targetRecipeTitle}</p>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#777' }}>{pr.description || '설명 없음'}</p>
                </div>
                <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: statusColor[pr.status] + '22', color: statusColor[pr.status] }}>
                  {statusLabel[pr.status]}
                </span>
              </div>
              {pr.rejectReason && (
                <p style={{ margin: '8px 0 0', fontSize: 13, color: '#ef4444', background: '#fff0f0', padding: '8px 12px', borderRadius: 6 }}>
                  반려 사유: {pr.rejectReason}
                </p>
              )}
            </div>
          ))}
          {myPrs.length === 0 && <p style={{ color: '#888' }}>보낸 PR이 없습니다.</p>}
        </div>
      )}
    </div>
  );
}

const newBtn = { padding: '8px 16px', background: '#111', color: '#fff', textDecoration: 'none', borderRadius: 6, fontSize: 14 };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 };
const card = { border: '1px solid #eee', borderRadius: 10, padding: 16 };
const forkBadge = { background: '#111', color: '#fff', padding: '2px 7px', borderRadius: 4, fontSize: 11 };
const linkBtn = { padding: '5px 12px', border: '1px solid #ddd', borderRadius: 5, textDecoration: 'none', color: '#333', fontSize: 12 };
