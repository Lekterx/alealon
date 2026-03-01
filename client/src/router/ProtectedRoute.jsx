import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-[50vh] text-ink-secondary">Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
