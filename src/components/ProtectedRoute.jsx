import { Navigate } from 'react-router-dom';
import { isAdminLoggedIn } from '../utils/storage';

export default function ProtectedRoute({ children }) {
  return isAdminLoggedIn() ? children : <Navigate to="/admin" replace />;
}
