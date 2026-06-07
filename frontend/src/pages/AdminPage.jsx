import { useEffect, useState } from 'react';
import { prApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [prs, setPrs] = useState([]);
  const [rejectReason, setRejectReason] = useState({});

  useEffect(() => {
    if (user?.role !== 'ADMIN') { navigate('/'); return; }
    prApi.getAll().then(res => setPrs(res.data)).catch(() => {});
  }, [user, navigate]);

  const handleApprove = async (id) => {
    if (!window.confirm('승인하시겠습니까?')) return;
    try {
      await prApi.approve(id);
      setPrs(prev => prev.map(p => p.id === id ? { ...p, status: 'MERGED' } : p));
      alert('승인 완료!');
    } catch (e) { alert(e.response?.data?.message || '승인 실패'); }
  };

  const handleReject = async (id) => {
    const reason = rejectReason[id];
    if (!reason?.trim()) return alert('반려 사유를 입력해주세요.');
    if (!window.confirm('거부하시겠습니까?')) return;
    try {
      await prApi.reject(id, reason);
      setPrs(prev => prev.map(p => p.id === id ? { ...p, status: 'CLOSED', rejectReason: reason } : p));
      alert('거부 완료!');
    } catch (e) { alert(e.response?.data?.message || '거부 실패'); }
  };

  const statusColor = { OPEN: '#f59e0b', MERGED: '#10b981', CLOSED: '#ef4444' };
  const statusLabel = { OPEN: '검토 중', MERGED: '승인됨', CLOSED: '거부됨' };
  const openPrs = prs.filter(p => p.status === 'OPEN');
  const donePrs = prs.filter(p => p.status !== 'OPEN');

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>관리자 페이지 — PR 승인/거부</h2>

      <h3 style={{ marginBottom: 12 }}>검토 대기 ({openPrs.length})</h3>
      {openPrs.length === 0 && <p style={{ color: '#888', marginBottom: 24 }}>대기 중인 PR이 없습니다.</p>}
      {openPrs.map(pr => (
        <div key={pr.id} style={prCard}>
          <div style={{ marginBottom: 12 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>
              {pr.sourceRecipeTitle} → {pr.targetRecipeTitle}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#777' }}>
              요청자: {pr.authorUsername} · {new Date(pr.createdAt).toLocaleString('ko-KR')}
            </p>
            {pr.description && <p style={{ margin: '6px 0 0', fontSize: 13 }}>{pr.description}</p>}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <input
              style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }}
              placeholder="반려 사유 (거부 시 필수)"
              value={rejectReason[pr.id] || ''}
              onChange={e => setRejectReason(prev => ({ ...prev, [pr.id]: e.target.value }))}
            />
            <button onClick={() => handleApprove(pr.id)} style={{ ...actionBtn, background: '#111' }}>✔ 승인</button>
            <button onClick={() => handleReject(pr.id)} style={{ ...actionBtn, background: '#cc3333' }}>✕ 거부</button>
          </div>
        </div>
      ))}

      {donePrs.length > 0 && (
        <>
          <h3 style={{ margin: '28px 0 12px' }}>처리 완료 ({donePrs.length})</h3>
          {donePrs.map(pr => (
            <div key={pr.id} style={{ ...prCard, opacity: 0.7 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600 }}>{pr.sourceRecipeTitle} → {pr.targetRecipeTitle}</p>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#aaa' }}>요청자: {pr.authorUsername}</p>
                  {pr.rejectReason && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ef4444' }}>반려 사유: {pr.rejectReason}</p>}
                </div>
                <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: statusColor[pr.status] + '22', color: statusColor[pr.status] }}>
                  {statusLabel[pr.status]}
                </span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

const prCard = { border: '1px solid #eee', borderRadius: 10, padding: 18, marginBottom: 14 };
const actionBtn = { padding: '8px 16px', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap' };
