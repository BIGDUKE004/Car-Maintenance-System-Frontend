import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signedOut } from './app/store';
import { homeFor, isAdminRole } from './lib/session';
import SiteLayout from './layouts/SiteLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import { ForgotPassword, ResetPassword } from './pages/PasswordPages';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Requests from './pages/Requests';
import RequestDetails from './pages/RequestDetails';
import PaymentResult from './pages/PaymentResult';
import AdminHome from './admin/AdminHome';
import AdminRequest from './admin/AdminRequest';
import AdminPayments from './admin/AdminPayments';
import AdminWorkshop from './admin/AdminWorkshop';

// `admin` = which area this route belongs to. Customers can't open /admin and
// admins are sent to /admin instead of the customer portal (the customer
// endpoints are scoped to the signed-in user's own cars, so they'd be empty).
function Protected({ admin = false, children }) {
  const { token, role } = useSelector((s) => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  if (isAdminRole(role) !== admin) return <Navigate to={homeFor(role)} replace />;
  return children;
}

export default function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onExpired = () => {
      dispatch(signedOut());
      navigate('/login', { replace: true, state: { from: location.pathname, expired: true } });
    };
    window.addEventListener('motora:session-expired', onExpired);
    return () => window.removeEventListener('motora:session-expired', onExpired);
  }, [dispatch, navigate, location.pathname]);

  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/verify-email" element={<AuthPage mode="verify" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      <Route path="/app" element={<Protected><DashboardLayout /></Protected>}>
        <Route index element={<Dashboard />} />
        <Route path="vehicles" element={<Vehicles />} />
        <Route path="requests" element={<Requests />} />
        <Route path="requests/:id" element={<RequestDetails />} />
      </Route>

      <Route path="/admin" element={<Protected admin><AdminLayout /></Protected>}>
        <Route index element={<AdminHome />} />
        <Route path="requests/:id" element={<AdminRequest />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="workshop" element={<AdminWorkshop />} />
      </Route>

      <Route path="/payments/result" element={<PaymentResult />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
