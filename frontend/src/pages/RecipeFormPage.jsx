import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { recipeApi, groupApi } from '../api';

const CATEGORIES = ['KOREAN','CHINESE','JAPANESE','WESTERN','DESSERT','DRINK','VEGETARIAN','VEGAN','LOW_CALORIE','SPICY','OTHER'];
const DIFFICULTIES = ['EASY','MEDIUM','HARD'];

export default function RecipeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const defaultGroupId = searchParams.get('groupId');

  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', category: 'KOREAN',
    cookingTime: '', difficulty: 'EASY', isPublic: true,
    groupId: defaultGroupId || '',
    ingredients: [{ name: '', amount: '', unit: '' }],
    cookingSteps: [''],
  });

  useEffect(() => {
    groupApi.getMy().then(res => setGroups(res.data)).catch(() => {});
    if (isEdit) {
      recipeApi.getOne(id).then(res => {
        const r = res.data;
        setForm({
          title: r.title, description: r.description || '',
          category: r.category, cookingTime: r.cookingTime || '',
          difficulty: r.difficulty || 'EASY', isPublic: r.isPublic,
          groupId: r.groupId ? String(r.groupId) : '',
          ingredients: r.ingredients.length ? r.ingredients : [{ name: '', amount: '', unit: '' }],
          cookingSteps: r.cookingSteps.length ? r.cookingSteps.map(s => s.description) : [''],
        });
      });
    }
  }, [id, isEdit]);

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));
  const setIngredient = (i, key, val) =>
    setForm(p => ({ ...p, ingredients: p.ingredients.map((ing, idx) => idx === i ? { ...ing, [key]: val } : ing) }));
  const addIngredient = () => setForm(p => ({ ...p, ingredients: [...p.ingredients, { name: '', amount: '', unit: '' }] }));
  const removeIngredient = (i) => setForm(p => ({ ...p, ingredients: p.ingredients.filter((_, idx) => idx !== i) }));
  const setStep = (i, val) => setForm(p => ({ ...p, cookingSteps: p.cookingSteps.map((s, idx) => idx === i ? val : s) }));
  const addStep = () => setForm(p => ({ ...p, cookingSteps: [...p.cookingSteps, ''] }));
  const removeStep = (i) => setForm(p => ({ ...p, cookingSteps: p.cookingSteps.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      cookingTime: Number(form.cookingTime) || null,
      groupId: form.groupId ? Number(form.groupId) : null,
    };
    try {
      if (isEdit) {
        await recipeApi.update(id, payload);
        navigate(`/recipes/${id}`);
      } else {
        const res = await recipeApi.create(payload);
        if (payload.groupId) navigate(`/groups/${payload.groupId}`);
        else navigate(`/recipes/${res.data.id}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || '저장 실패');
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <h2>{isEdit ? '레시피 수정' : '레시피 등록'}</h2>
      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>제목</label>
        <input style={inputStyle} value={form.title} onChange={set('title')} required />

        <label style={labelStyle}>설명</label>
        <textarea style={{ ...inputStyle, height: 80 }} value={form.description} onChange={set('description')} />

        {/* 그룹 선택 */}
        <label style={labelStyle}>그룹 (선택)</label>
        <select style={inputStyle} value={form.groupId} onChange={set('groupId')}>
          <option value="">전체 공개</option>
          {groups.map(g => (
            <option key={g.id} value={g.id}>{g.name} ({g.myRole === 'OWNER' ? '그룹장' : '멤버'})</option>
          ))}
        </select>
    

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>카테고리</label>
            <select style={inputStyle} value={form.category} onChange={set('category')}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>난이도</label>
            <select style={inputStyle} value={form.difficulty} onChange={set('difficulty')}>
              {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div style={{ width: 100 }}>
            <label style={labelStyle}>조리시간(분)</label>
            <input style={inputStyle} type="number" value={form.cookingTime} onChange={set('cookingTime')} />
          </div>
        </div>

        {/* 재료 */}
        <h3 style={{ marginTop: 24, marginBottom: 8 }}>재료</h3>
        {form.ingredients.map((ing, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input style={{ ...inputStyle, flex: 2, marginBottom: 0 }} placeholder="재료명" value={ing.name} onChange={e => setIngredient(i, 'name', e.target.value)} />
            <input style={{ ...inputStyle, flex: 1, marginBottom: 0 }} placeholder="양" value={ing.amount} onChange={e => setIngredient(i, 'amount', e.target.value)} />
            <input style={{ ...inputStyle, width: 60, marginBottom: 0 }} placeholder="단위" value={ing.unit} onChange={e => setIngredient(i, 'unit', e.target.value)} />
            <button type="button" onClick={() => removeIngredient(i)} style={removeBtn}>✕</button>
          </div>
        ))}
        <button type="button" onClick={addIngredient} style={addBtn}>+ 재료 추가</button>

        {/* 조리 순서 */}
        <h3 style={{ marginTop: 24, marginBottom: 8 }}>조리 순서</h3>
        {form.cookingSteps.map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
            <span style={stepNum}>{i + 1}</span>
            <textarea style={{ ...inputStyle, flex: 1, height: 64, marginBottom: 0 }} placeholder={`${i + 1}단계`} value={step} onChange={e => setStep(i, e.target.value)} />
            <button type="button" onClick={() => removeStep(i)} style={removeBtn}>✕</button>
          </div>
        ))}
        <button type="button" onClick={addStep} style={addBtn}>+ 단계 추가</button>

        <button type="submit" style={submitBtn}>{isEdit ? '수정 완료' : '등록하기'}</button>
        <div style={{ height: 80 }} />
      </form>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, marginTop: 12 };
const inputStyle = { display: 'block', width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box', marginBottom: 0 };
const submitBtn = { marginTop: 28, width: '100%', padding: 13, background: '#111', color: '#fff', border: 'none', borderRadius: 6, fontSize: 15, cursor: 'pointer', fontWeight: 600 };
const addBtn = { fontSize: 13, color: '#555', background: 'none', border: '1px dashed #ccc', borderRadius: 5, padding: '5px 12px', cursor: 'pointer', marginTop: 4 };
const removeBtn = { padding: '6px 10px', background: 'none', border: '1px solid #eee', borderRadius: 5, cursor: 'pointer', color: '#aaa' };
const stepNum = { minWidth: 26, height: 26, background: '#111', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, marginTop: 8 };
