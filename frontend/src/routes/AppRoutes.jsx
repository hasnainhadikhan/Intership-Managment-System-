import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AppLayout from '../components/layout/AppLayout';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';

// Admin Pages
import AdminDashboard from '../pages/admin/DashboardPage';
import InternsPage from '../pages/admin/InternsPage';
import TasksPage from '../pages/admin/TasksPage';
import AttendancePage from '../pages/admin/AttendancePage';
import SubmissionsPage from '../pages/admin/SubmissionsPage';
import ReportsPage from '../pages/admin/ReportsPage';

// Intern Pages
import MyDashboard from '../pages/intern/MyDashboard';
import MyTasksPage from '../pages/intern/MyTasksPage';
import SubmitWorkPage from '../pages/intern/SubmitWorkPage';
import ProfilePage from '../pages/intern/ProfilePage';

import { Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';

// Guards
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';

// Root Redirect Component
const RootRedirect = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (user.role === 'admin' || user.role === 'lead') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return <Navigate to="/intern/dashboard" replace />;
};

// Unauthorized Page Component
const UnauthorizedPage = () => {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center">
      <div className="w-24 h-24 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-rose-200 dark:shadow-none">
        <Shield className="w-12 h-12" />
      </div>
      <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Access Denied</h1>
      <p className="text-slate-500 font-medium max-w-md mb-10 leading-relaxed">
        You don't have the required permissions to access this high-security zone. Please contact your administrator if you think this is a mistake.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={() => window.history.back()}
          variant="outline"
          className="h-12 px-8 rounded-2xl font-black border-slate-200 dark:border-slate-800"
        >
          Go Back
        </Button>
        <Button 
          onClick={logout}
          className="h-12 px-8 rounded-2xl font-black bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 dark:shadow-none"
        >
          Logout & Try Again
        </Button>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          {/* Default Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Admin & Lead Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/interns" element={<InternsPage />} />
            <Route path="/admin/tasks" element={<TasksPage />} />
            <Route path="/admin/attendance" element={<AttendancePage />} />
            <Route path="/admin/submissions" element={<SubmissionsPage />} />
            <Route path="/admin/reports" element={<ReportsPage />} />
          </Route>

          {/* Intern Routes */}
          <Route path="/intern/dashboard" element={<MyDashboard />} />
          <Route path="/intern/tasks" element={<MyTasksPage />} />
          <Route path="/intern/submit" element={<SubmitWorkPage />} />
          <Route path="/intern/profile" element={<ProfilePage />} />
          <Route path="/intern/attendance" element={<AttendancePage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<div className="min-h-screen flex items-center justify-center">404 - Page Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;
