import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import { LoginPage, RegisterPage, ForgotPasswordPage } from './pages/auth';
import { AdminDashboard, ExamDetailPage } from './pages/admin';
import { ExamDashboard, ExamInstructionsPage, LiveExamPage, ResultPage } from './pages/exams';
import CandidateDashboard from './pages/candidate/CandidateDashboard';
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token } = useAuthStore();
  if (!token || !user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />;
  }
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot" element={<ForgotPasswordPage />} />

        {/* Admin */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'admin', 'coordinator']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Candidate specific pages — MUST be before /candidate/* */}
        <Route
          path="/exams/exam/:exam_id/live"
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <LiveExamPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exams/exam/:exam_id/instructions"
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <ExamInstructionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exams/result/:exam_id"
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <ResultPage />
            </ProtectedRoute>
          }
        />

        {/* Exam dashboard — MUST be after specific routes */}
        <Route
          path="/exams/*"
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <ExamDashboard />
            </ProtectedRoute>
          }
        />
        {/* Candidate dashboard — fallback for any /candidate/* routes */}
        <Route
          path="/candidate/*"
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <CandidateDashboard />
            </ProtectedRoute>
          }
        />
        {/* Default */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
