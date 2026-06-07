import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { value: 'GENERAL', label: '일반 사용자' },
  { value: 'FRANCHISE', label: '가맹점 사용자' },
  { value: 'ADMIN', label: '본사 관리자' },
];

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'GENERAL' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signup(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || '회원가입에 실패했습니다.');
    }
  };

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  return (
    <div style={formWrap}>
      <h2 style={{ marginBottom: 24 }}>회원가입</h2>
      <form onSubmit={handleSubmit}>
        <input style={inputStyle} placeholder="닉네임 (2~20자)"
          value={form.username} onChange={set('username')} required />
        <input style={inputStyle} type="email" placeholder="이메일"
          value={form.email} onChange={set('email')} required />
        <input style={inputStyle} type="password" placeholder="비밀번호 (8자 이상)"
          value={form.password} onChange={set('password')} required />
        <select style={inputStyle} value={form.role} onChange={set('role')}>
          {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        {error && <p style={{ color: 'red', fontSize: 13 }}>{error}</p>}
        <button style={submitBtn} type="submit">가입하기</button>
      </form>
      <p style={{ fontSize: 13, color: '#666', marginTop: 16 }}>
        이미 계정이 있으신가요? <Link to="/login">로그인</Link>
      </p>
    </div>
  );
}

const formWrap = { maxWidth: 400, margin: '60px auto', padding: 32, border: '1px solid #eee', borderRadius: 12 };
const inputStyle = { display: 'block', width: '100%', padding: '10px 12px', marginBottom: 12, border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' };
const submitBtn = { width: '100%', padding: 12, background: '#111', color: '#fff', border: 'none', borderRadius: 6, fontSize: 15, cursor: 'pointer', fontWeight: 600 };
