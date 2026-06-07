import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || '로그인에 실패했습니다.');
    }
  };

  return (
    <div style={formWrap}>
      <h2 style={{ marginBottom: 24 }}>로그인</h2>
      <form onSubmit={handleSubmit}>
        <input style={inputStyle} type="email" placeholder="이메일"
          value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
        <input style={inputStyle} type="password" placeholder="비밀번호"
          value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
        {error && <p style={{ color: 'red', fontSize: 13 }}>{error}</p>}
        <button style={submitBtn} type="submit">로그인</button>
      </form>
      <p style={{ fontSize: 13, color: '#666', marginTop: 16 }}>
        계정이 없으신가요? <Link to="/signup">회원가입</Link>
      </p>
    </div>
  );
}

const formWrap = { maxWidth: 400, margin: '60px auto', padding: 32, border: '1px solid #eee', borderRadius: 12 };
const inputStyle = { display: 'block', width: '100%', padding: '10px 12px', marginBottom: 12, border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' };
const submitBtn = { width: '100%', padding: 12, background: '#111', color: '#fff', border: 'none', borderRadius: 6, fontSize: 15, cursor: 'pointer', fontWeight: 600 };
