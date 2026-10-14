import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signedOut } from './app/store';
import SiteLayout from './layouts/SiteLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Requests from './pages/Requests';
import RequestDetails from './pages/RequestDetails';
import PaymentResult from './pages/PaymentResult';

function Protected({ children }) { const token = useSelector((s) => s.auth.token); return token ? children : <Navigate to="/login" replace />; }
export default function App() {
  const dispatch = useDispatch(); const navigate = useNavigate(); const location = useLocation();
  useEffect(() => { const onExpired = () => { dispatch(signedOut()); navigate('/login', { replace: true, state: { from: location.pathname, expired: true } }); }; window.addEventListener('motora:session-expired', onExpired); return () => window.removeEventListener('motora:session-expired', onExpired); }, [dispatch, navigate, location.pathname]);
  return <Routes>
    <Route element={<SiteLayout />}><Route path="/" element={<Home />} /><Route path="/login" element={<AuthPage mode="login" />} /><Route path="/register" element={<AuthPage mode="register" />} /><Route path="/verify-email" element={<AuthPage mode="verify" />} /></Route>
    <Route path="/app" element={<Protected><DashboardLayout /></Protected>}><Route index element={<Dashboard />} /><Route path="vehicles" element={<Vehicles />} /><Route path="requests" element={<Requests />} /><Route path="requests/:id" element={<RequestDetails />} /></Route>
    <Route path="/payments/result" element={<PaymentResult />} /><Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
