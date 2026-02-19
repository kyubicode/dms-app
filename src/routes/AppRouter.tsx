import { lazy, Suspense } from 'react'; // Tambahkan ini
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuthStore } from '@/stores/auth.store';
import LoadingScreen from '../components/Loading/LoadingScreen'; // Import komponen tadi

// Ubah import statis menjadi lazy loading
const Login = lazy(() => import('../pages/Login/Login'));
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'));

export default function AppRouter() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return (
    <BrowserRouter>
      {/* Suspense akan menangkap proses loading saat pindah route */}
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
            } 
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}