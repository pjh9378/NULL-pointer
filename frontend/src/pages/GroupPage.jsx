import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { groupApi, recipeApi } from '../api';
import { useAuth } from '../context/AuthContext';

export function GroupListPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [invites, setInvites] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => {
    groupApi.getMy().then(res => setGroups(res.data)).catch(() => {});
    groupApi.getPendingInvites().then(res => setInvites(res.data)).catch(() => {});
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await groupApi.create(form);
      setGroups(prev => [...prev, res.data]);
      setShowCreate(false);
      setForm({ name: '', description: '' });
    } catch (e) { alert(e.response?.data?.message || '그룹 생성 실패'); }
  };

  const handleRespond = async (memberId, accept) => {
    try {
      await groupApi.respondInvite(memberId, accept);
      setInvites(prev => prev.filter(i => i.memberId !== memberId));
      if (accept) {
        const res = await groupApi.getMy();
        setGroups(res.data);
      }
      alert(accept ? '초대를 수락했습니다!' : '초대를 거절했습니다.');
    } catch (e) { alert('처리 실패'); }
  };

  return (
      <div style={{ paddingTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>그룹</h2>
        <button onClick={() => setShowCreate(p => !p)} style={btnStyle}>
          {showCreate ? '취소' : '+ 그룹 만들기'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} style={{ background: '#f9f9f9', border: '1px solid #eee', borderRadius: 10, padding: 20, marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 16px' }}>새 그룹 만들기</h3>
          <input style={inputStyle} placeholder="그룹 이름 (예: 엽기떡볶이)" value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
          <textarea style={{ ...inputStyle, height: 70 }} placeholder="그룹 설명 (선택)"
            value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          <button type="submit" style={btnStyle}>만들기</button>
        </form>
      )}

      {invites.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>📬 초대 알림 ({invites.length})</h3>
          {invites.map(invite => (
            <div key={invite.memberId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', border: '1px solid #ddd', borderRadius: 8, marginBottom: 8, background: '#fffbeb' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600 }}>{invite.groupName}</p>
                <p style={{ margin: 0, fontSize: 13, color: '#777' }}>그룹장: {invite.ownerUsername}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleRespond(invite.memberId, true)} style={{ ...btnStyle, padding: '6px 14px' }}>수락</button>
                <button onClick={() => handleRespond(invite.memberId, false)} style={{ ...btnStyle, background: '#aaa', padding: '6px 14px' }}>거절</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {groups.map(g => (
          <div key={g.id} style={cardStyle} onClick={() => navigate(`/groups/${g.id}`)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>{g.name}</h3>
              <span style={{ ...roleBadge, background: g.myRole === 'OWNER' ? '#111' : '#888' }}>
                {g.myRole === 'OWNER' ? '그룹장' : '멤버'}
              </span>
            </div>
            <p style={{ fontSize: 13, color: '#777', margin: '8px 0 12px' }}>{g.description || '설명 없음'}</p>
            <p style={{ fontSize: 12, color: '#aaa', margin: 0 }}>멤버 {g.memberCount}명</p>
          </div>
        ))}
        {groups.length === 0 && <p style={{ color: '#888' }}>소속된 그룹이 없습니다.</p>}
      </div>
    </div>
  );
}

export function GroupDetailPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [myRecipes, setMyRecipes] = useState([]);
  const [tab, setTab] = useState('recipes');
  const [inviteEmail, setInviteEmail] = useState('');
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState('');
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    groupApi.getOne(groupId).then(res => setGroup(res.data)).catch(() => navigate('/groups'));
    groupApi.getMembers(groupId).then(res => setMembers(res.data)).catch(() => {});
    recipeApi.getMy().then(res => setMyRecipes(res.data.content)).catch(() => {});
  }, [groupId]);

  useEffect(() => {
    groupApi.getGroupRecipes(groupId, { keyword: search || undefined, size: 12 })
      .then(res => setRecipes(res.data.content)).catch(() => {});
  }, [groupId, search]);

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      await groupApi.invite(groupId, inviteEmail);
      alert(`${inviteEmail}에게 초대를 보냈습니다!`);
      setInviteEmail('');
    } catch (e) { alert(e.response?.data?.message || '초대 실패'); }
  };

  const handleShare = async (recipeId) => {
    try {
      await recipeApi.shareToGroup(recipeId, groupId);
      alert('그룹에 공유됐어요!');
      setShowShare(false);
      const res = await groupApi.getGroupRecipes(groupId, { size: 12 });
      setRecipes(res.data.content);
    } catch (e) { alert(e.response?.data?.message || '공유 실패'); }
  };

  const handleRemoveMember = async (memberId, username) => {
    if (!window.confirm(`${username}을 내보내시겠습니까?`)) return;
    try {
      await groupApi.removeMember(groupId, memberId);
      setMembers(prev => prev.filter(m => m.memberId !== memberId));
    } catch (e) { alert(e.response?.data?.message || '실패'); }
  };

  if (!group) return <p>불러오는 중...</p>;
  const isOwner = group.myRole === 'OWNER';

  return (
    <div style={{ paddingTop: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h2 style={{ margin: 0 }}>{group.name}</h2>
            <span style={{ ...roleBadge, background: isOwner ? '#111' : '#888' }}>
              {isOwner ? '그룹장' : '멤버'}
            </span>
          </div>
          <p style={{ margin: 0, color: '#777', fontSize: 14 }}>{group.description}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowShare(p => !p)} style={{ ...btnStyle, background: '#444' }}>
            {showShare ? '닫기' : '내 레시피 공유'}
          </button>
          {isOwner && (
            <Link to={`/recipes/new?groupId=${groupId}`} style={{ ...btnStyle, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              + 레시피 등록
            </Link>
          )}
        </div>
      </div>

      {showShare && (
        <div style={{ background: '#f9f9f9', border: '1px solid #eee', borderRadius: 10, padding: 16, marginBottom: 20 }}>
          <h4 style={{ margin: '0 0 12px' }}>내 레시피를 그룹에 공유</h4>
          {myRecipes.length === 0
            ? <p style={{ color: '#888', fontSize: 13 }}>공유할 레시피가 없습니다.</p>
            : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                {myRecipes.map(r => (
                  <div key={r.id}
                    style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, cursor: 'pointer', background: '#fff' }}
                    onClick={() => handleShare(r.id)}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>{r.title}</p>
                    <p style={{ margin: '4px 0 0', fontSize: 11, color: '#aaa' }}>{r.category}</p>
                  </div>
                ))}
              </div>
            )}
        </div>
      )}

      <div style={{ display: 'flex', borderBottom: '2px solid #eee', marginBottom: 20 }}>
        {[['recipes', '레시피'], ['members', `멤버 (${members.filter(m => m.inviteStatus === 'ACCEPTED').length})`]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '8px 18px', border: 'none', background: 'none', cursor: 'pointer',
            fontWeight: tab === key ? 700 : 400, fontSize: 14,
            borderBottom: tab === key ? '2px solid #111' : '2px solid transparent',
            marginBottom: -2, color: tab === key ? '#111' : '#888',
          }}>{label}</button>
        ))}
      </div>

      {tab === 'recipes' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <input style={{ flex: 1, padding: '9px 14px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14 }}
              placeholder="그룹 레시피 검색..."
              value={keyword} onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setSearch(keyword)} />
            <button onClick={() => setSearch(keyword)} style={btnStyle}>검색</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {recipes.map(r => (
              <Link key={r.id} to={`/recipes/${r.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h3 style={{ margin: 0, fontSize: 15 }}>{r.title}</h3>
                    {r.forkedFromId && <span style={{ ...roleBadge, background: '#555' }}>공유</span>}
                  </div>
                  <p style={{ fontSize: 12, color: '#aaa', margin: '6px 0 0' }}>by {r.ownerUsername} · {r.category}</p>
                </div>
              </Link>
            ))}
            {recipes.length === 0 && <p style={{ color: '#888' }}>등록된 레시피가 없습니다.</p>}
          </div>
        </div>
      )}

      {tab === 'members' && (
        <div>
          {isOwner && (
            <form onSubmit={handleInvite} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <input style={{ flex: 1, padding: '9px 14px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14 }}
                placeholder="초대할 이메일 입력" type="email"
                value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required />
              <button type="submit" style={btnStyle}>초대하기</button>
            </form>
          )}
          <div>
            {members.map(m => (
              <div key={m.memberId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', border: '1px solid #eee', borderRadius: 8, marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, background: m.role === 'OWNER' ? '#111' : '#ddd', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.role === 'OWNER' ? '#fff' : '#555', fontWeight: 700, fontSize: 14 }}>
                    {m.username[0]}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{m.username}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#aaa' }}>{m.email}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ ...roleBadge, background: m.role === 'OWNER' ? '#111' : m.inviteStatus === 'PENDING' ? '#f59e0b' : '#888' }}>
                    {m.role === 'OWNER' ? '그룹장' : m.inviteStatus === 'PENDING' ? '초대 중' : '멤버'}
                  </span>
                  {isOwner && m.role !== 'OWNER' && (
                    <button onClick={() => handleRemoveMember(m.memberId, m.username)}
                      style={{ padding: '4px 10px', background: 'none', border: '1px solid #eee', borderRadius: 5, cursor: 'pointer', fontSize: 12, color: '#cc3333' }}>
                      내보내기
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const btnStyle = { padding: '8px 16px', background: '#111', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 };
const inputStyle = { display: 'block', width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box', marginBottom: 10 };
const cardStyle = { border: '1px solid #eee', borderRadius: 10, padding: 16, cursor: 'pointer' };
const roleBadge = { padding: '2px 8px', borderRadius: 4, fontSize: 11, color: '#fff', fontWeight: 600 };