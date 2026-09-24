import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import NewComplaintPage from './pages/student/NewComplaintPage';
import ComplaintDetailsPage from './pages/student/ComplaintDetailsPage';

// Staff Pages (Faculty & HOD)
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffComplaintDetailsPage from './pages/staff/StaffComplaintDetailsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminComplaintsPage from './pages/admin/AdminComplaintsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';
import AdminComplaintViewPage from './pages/admin/AdminComplaintViewPage';

// App Layout with Sidebar and Navbar
const AppLayout = ({ children, title }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="app-container">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className="main-wrapper">
        <Navbar title={title} />
        <main className="content-body">{children}</main>
      </div>
    </div>
  );
};

// Root App Router
const App = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // Helper to compute page title based on path
  const getPageTitle = (pathname) => {
    if (pathname.includes('/student/new-complaint')) return 'File New Complaint';
    if (pathname.includes('/student/complaints/')) return 'Complaint Discussion';
    if (pathname.includes('/student/dashboard')) return 'Student Grievance Portal';
    if (pathname.includes('/staff/complaints/')) return 'Manage Grievance & Discussion';
    if (pathname.includes('/staff/dashboard')) return 'Staff Grievance Desk';
    if (pathname.includes('/admin/complaints/')) return 'Complaint Audit Inspection';
    if (pathname.includes('/admin/complaints')) return 'All Department Grievances';
    if (pathname.includes('/admin/users')) return 'User Account Directory';
    if (pathname.includes('/admin/audit-logs')) return 'System Audit Trail';
    if (pathname.includes('/admin/dashboard')) return 'Administration Overview';
    return 'Classroom Complaint Portal';
  };

  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Root redirect */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            user?.role === 'Student' ? (
              <Navigate to="/student/dashboard" replace />
            ) : user?.role === 'Faculty' || user?.role === 'HOD' ? (
              <Navigate to="/staff/dashboard" replace />
            ) : (
              <Navigate to="/admin/dashboard" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Student Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['Student']} />}>
        <Route
          path="/student/dashboard"
          element={
            <AppLayout title={getPageTitle(location.pathname)}>
              <StudentDashboard />
            </AppLayout>
          }
        />
        <Route
          path="/student/new-complaint"
          element={
            <AppLayout title={getPageTitle(location.pathname)}>
              <NewComplaintPage />
            </AppLayout>
          }
        />
        <Route
          path="/student/complaints/:id"
          element={
            <AppLayout title={getPageTitle(location.pathname)}>
              <ComplaintDetailsPage />
            </AppLayout>
          }
        />
      </Route>

      {/* Faculty & HOD Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['Faculty', 'HOD']} />}>
        <Route
          path="/staff/dashboard"
          element={
            <AppLayout title={getPageTitle(location.pathname)}>
              <StaffDashboard />
            </AppLayout>
          }
        />
        <Route
          path="/staff/complaints/:id"
          element={
            <AppLayout title={getPageTitle(location.pathname)}>
              <StaffComplaintDetailsPage />
            </AppLayout>
          }
        />
      </Route>

      {/* Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
        <Route
          path="/admin/dashboard"
          element={
            <AppLayout title={getPageTitle(location.pathname)}>
              <AdminDashboard />
            </AppLayout>
          }
        />
        <Route
          path="/admin/complaints"
          element={
            <AppLayout title={getPageTitle(location.pathname)}>
              <AdminComplaintsPage />
            </AppLayout>
          }
        />
        <Route
          path="/admin/complaints/:id"
          element={
            <AppLayout title={getPageTitle(location.pathname)}>
              <AdminComplaintViewPage />
            </AppLayout>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AppLayout title={getPageTitle(location.pathname)}>
              <AdminUsersPage />
            </AppLayout>
          }
        />
        <Route
          path="/admin/audit-logs"
          element={
            <AppLayout title={getPageTitle(location.pathname)}>
              <AdminAuditLogsPage />
            </AppLayout>
          }
        />
      </Route>

      {/* Fallback to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
