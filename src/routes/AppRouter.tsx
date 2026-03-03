import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuthStore } from '@/stores/auth.store';
import LoadingScreen from '../components/Loading/LoadingScreen';
import TitleBar from '../components/TitleBar/TitleBar'; 

const Login = lazy(() => import('../pages/Login/Login'));
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'));

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login' || location.pathname === '/';

  return (
    <div 
      className="main-app-container"
      style={{ 
        flex: 1, // Mengambil sisa ruang setelah TitleBar
        width: '100vw',
        position: 'relative',
        overflow: isLoginPage ? 'hidden' : 'auto', // Scroll hanya di dashboard
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {children}
    </div>
  );
};

export default function AppRouter() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return (
    <BrowserRouter>
      {/* Container utama untuk memisahkan TitleBar dan Konten */}
      <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TitleBar />

        <AppLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route 
                path="/login" 
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </AppLayout>
      </div>

      <style>{`
        html, body, #root {
          margin: 0 !important;
          padding: 0 !important;
          height: 100vh !important;
          width: 100vw !important;
          overflow: hidden !important; 
        }
      `}</style>
    </BrowserRouter>
  );
}