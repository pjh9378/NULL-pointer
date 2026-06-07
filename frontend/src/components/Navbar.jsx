import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <>
      {/* 상단 */}
      <nav style={{ background: '#111', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52 }}>
        <Link to="/" style={{ color: '#fff', fontWeight: 700, fontSize: 20, textDecoration: 'none' }}>
          RecipeHub
        </Link>
        <Link to="/my-recipes" style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 20, padding: '6px 16px', color: '#fff', fontSize: 13, textDecoration: 'none', cursor: 'pointer' }}>
          👤 {user?.username}
        </Link>
      </nav>

      {/* 하단 탭바 */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '0.5px solid #eee', display: 'flex', justifyContent: 'space-around', padding: '8px 0 12px', zIndex: 1000 }}>
        {[
          { path: '/', icon: '🏠', label: '홈' },
          { path: '/groups', icon: '👥', label: '그룹' },
          { path: '/recipes/new', icon: '✏️', label: '등록' },
          ...(user?.role === 'ADMIN' ? [{ path: '/admin', icon: '⚙️', label: '관리자' }] : []),
        ].map(({ path, icon, label }) => (
          <Link key={path} to={path} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '4px 16px', textDecoration: 'none', color: isActive(path) ? '#111' : '#aaa', borderBottom: isActive(path) ? '2px solid #111' : '2px solid transparent' }}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            <span style={{ fontSize: 11, fontWeight: isActive(path) ? 700 : 400 }}>{label}</span>
          </Link>
        ))}
        <Link to="/my-recipes" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '4px 16px', textDecoration: 'none', color: isActive('/my-recipes') ? '#111' : '#aaa', borderBottom: isActive('/my-recipes') ? '2px solid #111' : '2px solid transparent' }}>
          <span style={{ fontSize: 20 }}>👤</span>
          <span style={{ fontSize: 11, fontWeight: isActive('/my-recipes') ? 700 : 400 }}>마이페이지</span>
        </Link>
      </div>
    </>
  );
}