import { Navigate, Outlet } from 'react-router-dom';
const ProtectedRoute = () => {
  const isLoggedIn = !!localStorage.getItem('access');
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
