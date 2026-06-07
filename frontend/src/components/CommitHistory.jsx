import { useEffect, useState } from 'react';
import { commitApi } from '../api';
import VersionDiff from './VersionDiff';

export default function CommitHistory({ recipeId, isOwner }) {
  const [commits, setCommits] = useState([]);
  const [selected, setSelected] = useState([]);
  const [diff, setDiff] = useState(null);

  useEffect(() => {
    commitApi.getHistory(recipeId).then(res => setCommits(res.data)).catch(() => {});
  }, [recipeId]);

  const toggleSelect = (id) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
    setDiff(null);
  };

  const handleCompare = async () => {
    if (selected.length !== 2) return alert('비교할 커밋 2개를 선택하세요.');
    try {
      const res = await commitApi.compare(selected[0], selected[1]);
      setDiff(res.data);
    } catch (e) { alert('비교 실패'); }
  };

  const handleRestore = async (commitId) => {
    if (!window.confirm('이 버전으로 복구하시겠습니까?')) return;
    try {
      await commitApi.restore(recipeId, commitId);
      alert('복구 완료! 페이지를 새로고침해주세요.');
    } catch (e) { alert('복구 실패'); }
  };

  return (
    <div>
      {selected.length > 0 && (
        <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#555' }}>{selected.length}개 선택됨</span>
          <button onClick={handleCompare} style={btn}>버전 비교</button>
          <button onClick={() => { setSelected([]); setDiff(null); }} style={{ ...btn, background: '#aaa' }}>선택 해제</button>
        </div>
      )}

      {diff && <VersionDiff diff={diff} onClose={() => setDiff(null)} />}

      {commits.length === 0 ? (
        <p style={{ color: '#aaa', fontSize: 13 }}>커밋 이력이 없습니다.</p>
      ) : (
        <div style={{ border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
          {commits.map((commit, i) => (
            <div key={commit.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', borderBottom: i < commits.length - 1 ? '1px solid #f0f0f0' : 'none',
              background: selected.includes(commit.id) ? '#f0f7ff' : '#fff',
            }}>
              <input type="checkbox" checked={selected.includes(commit.id)}
                onChange={() => toggleSelect(commit.id)} style={{ cursor: 'pointer' }} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{commit.message}</p>
                <p style={{ margin: 0, fontSize: 12, color: '#aaa', marginTop: 2 }}>
                  {commit.authorUsername} · {new Date(commit.createdAt).toLocaleString('ko-KR')}
                </p>
              </div>
              {isOwner && (
                <button onClick={() => handleRestore(commit.id)} style={{ ...btn, fontSize: 12, padding: '4px 10px', background: '#fff', color: '#333', border: '1px solid #ddd' }}>
                  복구
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const btn = { padding: '6px 14px', background: '#111', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 13 };
