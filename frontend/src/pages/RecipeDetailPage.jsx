import { useEffect, useState } from 'react';
import { recipeApi, bookmarkApi, prApi } from '../api';
import { useAuth } from '../context/AuthContext';
import CommitHistory from '../components/CommitHistory';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';

export default function RecipeDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [showCommits, setShowCommits] = useState(false);
  const [showPrForm, setShowPrForm] = useState(false);
  const location = useLocation();
  const [prDesc, setPrDesc] = useState('');

  useEffect(() => {
    recipeApi.getOne(id).then(res => setRecipe(res.data));
    if (user) {
      bookmarkApi.status(id).then(res => setBookmarked(res.data.bookmarked)).catch(() => {});
    }
  }, [id, user, location.key]);

  const handleFork = async () => {
    try {
      const res = await recipeApi.fork(id);
      alert('Fork 완료! 내 레시피에서 확인하세요.');
      navigate(`/recipes/${res.data.id}`);
    } catch (e) { alert(e.response?.data?.message || 'Fork 실패'); }
  };

  const handleBookmark = async () => {
    try {
      const res = await bookmarkApi.toggle(id);
      setBookmarked(res.data.bookmarked);
    } catch (e) { alert('즐겨찾기 실패'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    await recipeApi.delete(id);
    navigate('/my-recipes');
  };

  const handlePrSubmit = async () => {
    if (!recipe.forkedFromId) return alert('Fork된 레시피만 PR을 보낼 수 있습니다.');
    try {
      await prApi.create({ sourceRecipeId: recipe.id, targetRecipeId: recipe.forkedFromId, description: prDesc });
      alert('PR 요청 완료!');
      setShowPrForm(false);
    } catch (e) { alert(e.response?.data?.message || 'PR 요청 실패'); }
  };

  if (!recipe) return <p>불러오는 중...</p>;
  const isOwner = user?.username === recipe.ownerUsername;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', paddingTop: 24 }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, margin: 0 }}>{recipe.title}</h1>
          {recipe.forkedFromId && (
            <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
              🍴 <Link to={`/recipes/${recipe.forkedFromId}`}>{recipe.forkedFromTitle}</Link>에서 Fork됨
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={handleBookmark} style={{ ...actionBtn, background: bookmarked ? '#111' : '#fff', color: bookmarked ? '#fff' : '#111', border: '1px solid #111' }}>
            {bookmarked ? '★ 즐겨찾기' : '☆ 즐겨찾기'}
          </button>
          {!isOwner && (
            <button onClick={handleFork} style={actionBtn}>Fork</button>
          )}
          {isOwner && recipe.forkedFromId && (
            <button onClick={() => setShowPrForm(p => !p)} style={{ ...actionBtn, background: '#444' }}>PR 요청</button>
          )}
          {isOwner && (
            <>
              <Link to={`/recipes/${id}/edit`} style={{ ...actionBtn, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>수정</Link>
              <button onClick={handleDelete} style={{ ...actionBtn, background: '#cc3333' }}>삭제</button>
            </>
          )}
        </div>
      </div>

      {/* PR 폼 */}
      {showPrForm && (
        <div style={{ background: '#f9f9f9', border: '1px solid #eee', borderRadius: 8, padding: 16, marginBottom: 20 }}>
          <h4 style={{ margin: '0 0 8px' }}>본사에 Merge 요청</h4>
          <textarea
            style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6, fontSize: 13, boxSizing: 'border-box', height: 80 }}
            placeholder="수정 내용을 설명해주세요..."
            value={prDesc} onChange={e => setPrDesc(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={handlePrSubmit} style={actionBtn}>요청 보내기</button>
            <button onClick={() => setShowPrForm(false)} style={{ ...actionBtn, background: '#aaa' }}>취소</button>
          </div>
        </div>
      )}

      {/* 배지 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <span style={badge}>{recipe.category}</span>
        {recipe.difficulty && <span style={badge}>{recipe.difficulty}</span>}
        {recipe.cookingTime && <span style={badge}>{recipe.cookingTime}분</span>}
        <span style={badge}>by {recipe.ownerUsername}</span>
      </div>

      {recipe.description && <p style={{ color: '#555', marginBottom: 24 }}>{recipe.description}</p>}

      {/* 재료 */}
      {recipe.ingredients?.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <h2 style={sectionTitle}>재료</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={th}>재료명</th><th style={th}>양</th><th style={th}>단위</th>
              </tr>
            </thead>
            <tbody>
              {recipe.ingredients.map((ing, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={td}>{ing.name}</td>
                  <td style={td}>{ing.amount}</td>
                  <td style={td}>{ing.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* 조리 순서 */}
      {recipe.cookingSteps?.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <h2 style={sectionTitle}>조리 순서</h2>
          {recipe.cookingSteps.map(step => (
            <div key={step.stepOrder} style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
              <span style={stepNum}>{step.stepOrder}</span>
              <p style={{ margin: 0, lineHeight: 1.6 }}>{step.description}</p>
            </div>
          ))}
        </section>
      )}

      {/* 커밋 이력 */}
      <section>
        <button onClick={() => setShowCommits(p => !p)} style={{ ...actionBtn, background: '#fff', color: '#111', border: '1px solid #ddd', marginBottom: 12 }}>
          {showCommits ? '▲ 커밋 이력 닫기' : '▼ 커밋 이력 보기'}
        </button>
        {showCommits && <CommitHistory recipeId={id} isOwner={isOwner} />}
      </section>
    <div style={{ height: 80}} />
    </div>
  );
}

const actionBtn = { padding: '7px 14px', background: '#111', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 };
const badge = { background: '#f0f0f0', padding: '3px 8px', borderRadius: 4, fontSize: 12, color: '#555' };
const sectionTitle = { fontSize: 18, fontWeight: 600, marginBottom: 12, borderBottom: '2px solid #111', paddingBottom: 6 };
const th = { padding: '8px 12px', textAlign: 'left', fontSize: 13, fontWeight: 600 };
const td = { padding: '8px 12px', fontSize: 13 };
const stepNum = { minWidth: 28, height: 28, background: '#111', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 };
