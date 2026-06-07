import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import RecipeListPage from './pages/RecipeListPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import RecipeFormPage from './pages/RecipeFormPage';
import MyRecipesPage from './pages/MyRecipesPage';
import AdminPage from './pages/AdminPage';
import { GroupListPage, GroupDetailPage } from './pages/GroupPage';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function PublicOnlyRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: user ? '0 0 24px' : '0' }}>
        <Routes>
          <Route path="/" element={<PrivateRoute><RecipeListPage /></PrivateRoute>} />
          <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
          <Route path="/signup" element={<PublicOnlyRoute><SignupPage /></PublicOnlyRoute>} />
          <Route path="/recipes/new" element={<PrivateRoute><RecipeFormPage /></PrivateRoute>} />
          <Route path="/recipes/:id" element={<PrivateRoute><RecipeDetailPage /></PrivateRoute>} />
          <Route path="/recipes/:id/edit" element={<PrivateRoute><RecipeFormPage /></PrivateRoute>} />
          <Route path="/my-recipes" element={<PrivateRoute><MyRecipesPage /></PrivateRoute>} />
          <Route path="/groups" element={<PrivateRoute><GroupListPage /></PrivateRoute>} />
          <Route path="/groups/:groupId" element={<PrivateRoute><GroupDetailPage /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><AdminPage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
