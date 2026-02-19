import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';

type ProtectedRouteProps = {
  children: JSX.Element; // <- ini sekarang valid
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
