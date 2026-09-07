import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Resumes from './pages/Resumes'
import ResumeUpload from './pages/ResumeUpload'
import ResumeDetail from './pages/ResumeDetail'
import ResumeAnalysis from './pages/ResumeAnalysis'
import Jobs from './pages/Jobs'
import JobDetail from './pages/JobDetail'
import Matches from './pages/Matches'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import AdminJobs from './pages/AdminJobs'
import Landing from './pages/ReferenceLanding'
import ApplyJob from './pages/ApplyJob'
import Applications from './pages/Applications'
import RecruiterDashboard from './pages/RecruiterDashboard'
import RecruiterJobs from './pages/RecruiterJobs'
import RecruiterJobForm from './pages/RecruiterJobForm'
import RecruiterApplications from './pages/RecruiterApplications'
import Recommendations from './pages/Recommendations'
import SavedJobs from './pages/SavedJobs'
import Notifications from './pages/Notifications'
import Interviews from './pages/Interviews'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import RecruiterCandidates from './pages/RecruiterCandidates'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/resumes" element={<ProtectedRoute><Resumes /></ProtectedRoute>} />
      <Route path="/resumes/upload" element={<ProtectedRoute><ResumeUpload /></ProtectedRoute>} />
      <Route path="/resumes/:id" element={<ProtectedRoute><ResumeDetail /></ProtectedRoute>} />
      <Route path="/resumes/:id/analysis" element={<ProtectedRoute><ResumeAnalysis /></ProtectedRoute>} />
      <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
      <Route path="/jobs/:id" element={<JobDetail />} />
      <Route path="/jobs/:id/apply" element={<ProtectedRoute><ApplyJob /></ProtectedRoute>} />
      <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
      <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
      <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
      <Route path="/saved-jobs" element={<ProtectedRoute><SavedJobs /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/interviews" element={<ProtectedRoute><Interviews /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/jobs" element={<ProtectedRoute adminOnly><AdminJobs /></ProtectedRoute>} />

      <Route path="/recruiter/dashboard" element={<ProtectedRoute role="recruiter"><RecruiterDashboard /></ProtectedRoute>} />
      <Route path="/recruiter/jobs" element={<ProtectedRoute role="recruiter"><RecruiterJobs /></ProtectedRoute>} />
      <Route path="/recruiter/jobs/create" element={<ProtectedRoute role="recruiter"><RecruiterJobForm /></ProtectedRoute>} />
      <Route path="/recruiter/jobs/:id/edit" element={<ProtectedRoute role="recruiter"><RecruiterJobForm /></ProtectedRoute>} />
      <Route path="/recruiter/applications" element={<ProtectedRoute role="recruiter"><RecruiterApplications /></ProtectedRoute>} />
      <Route path="/recruiter/candidates" element={<ProtectedRoute role="recruiter"><RecruiterCandidates /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
