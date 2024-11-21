import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { useCustomerStore } from './stores/customerStore';
import { useRepairStore } from './stores/repairStore';
import { useSettingsStore } from './stores/settingsStore';
import { Layout } from './components/Layout';
import CustomerLayout from './components/CustomerLayout';
import Dashboard from './pages/Dashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import Login from './pages/Login';
import Settings from './pages/Settings';
import Customers from './pages/Customers';
import Calendar from './pages/Calendar';
import Dings from './pages/Dings';
import AdminProfiles from './pages/AdminProfiles';
import ForgotPassword from './pages/ForgotPassword';
import CreateAccount from './pages/CreateAccount';
import CustomerDetails from './pages/CustomerDetails';
import PendingValidation from './pages/PendingValidation';
import PublicRepairStatus from './pages/PublicRepairStatus';

function App() {
  const { isAuthenticated, initialize, isLoading, isValidated, userRole } = useAuthStore();
  const { initializeCustomers } = useCustomerStore();
  const { initializeRepairs } = useRepairStore();
  const { initializeSettings } = useSettingsStore();

  // Initialize auth state
  useEffect(() => {
    const init = async () => {
      try {
        await initialize();
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      }
    };
    init();
  }, []);

  // Initialize data when auth state changes
  useEffect(() => {
    const initData = async () => {
      if (isAuthenticated && isValidated) {
        try {
          await Promise.all([
            initializeCustomers?.(),
            initializeRepairs?.(),
            initializeSettings?.()
          ]);
        } catch (error) {
          console.error('Error initializing data:', error);
        }
      }
    };

    initData();
  }, [isAuthenticated, isValidated, initializeCustomers, initializeRepairs, initializeSettings]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#323b44] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#45b7d1]"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/repairs-status-:id" element={<PublicRepairStatus />} />
        <Route path="/customer-dashboard/:id" element={<CustomerDashboard />} />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/forgot-password"
          element={isAuthenticated ? <Navigate to="/" /> : <ForgotPassword />}
        />
        <Route
          path="/create-account"
          element={isAuthenticated ? <Navigate to="/" /> : <CreateAccount />}
        />
        <Route
          path="/pending-validation"
          element={
            !isAuthenticated ? (
              <Navigate to="/login" />
            ) : !isValidated ? (
              <PendingValidation />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Protected routes */}
        {!isAuthenticated ? (
          <Route path="*" element={<Navigate to="/login" />} />
        ) : (
          <>
            {/* Customer routes */}
            {userRole === 'customer' && (
              <Route element={<CustomerLayout />}>
                <Route index element={<CustomerDashboard />} />
              </Route>
            )}

            {/* Staff and Admin routes */}
            {(userRole === 'staff' || userRole === 'super_admin') && (
              <Route
                element={
                  !isValidated ? (
                    <Navigate to="/pending-validation" />
                  ) : (
                    <Layout />
                  )
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="settings" element={<Settings />} />
                <Route path="customers" element={<Customers />} />
                <Route path="customers/:id" element={<CustomerDetails />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="dings" element={<Dings />} />
                {userRole === 'super_admin' && (
                  <Route path="admin-profiles" element={<AdminProfiles />} />
                )}
              </Route>
            )}
          </>
        )}

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;