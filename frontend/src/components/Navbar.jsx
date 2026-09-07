import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const landing = location.pathname === '/'

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <nav className={`${landing ? 'bg-transparent border-white/10 text-white absolute top-0 inset-x-0' : 'bg-white border-gray-200 text-gray-900'} border-b px-6 py-4 flex items-center justify-between z-10`}>
      <Link to={user ? (user.role === 'recruiter' ? '/recruiter/dashboard' : '/dashboard') : '/'} className="text-lg font-bold text-primary-600">
        ResumeAI
      </Link>
      {!user && landing && <div className="hidden md:flex items-center gap-6 text-sm"><a href="#features">Features</a><a href="#how-it-works">How it works</a><Link to="/jobs">Jobs</Link></div>}
      {!user && <div className="flex items-center gap-3 text-sm"><Link to="/login" className="hidden sm:block">Login</Link><Link to="/register" className={`${landing ? 'bg-white text-slate-900' : 'bg-primary-600 text-white'} px-4 py-2 rounded-md font-medium`}>Get Started</Link></div>}
      {user && (
        <div className="flex items-center gap-6 text-sm">
          <Link to="/dashboard" className="hover:text-primary-600">Dashboard</Link>
          <Link to="/resumes" className="hover:text-primary-600">Resumes</Link>
          <Link to="/jobs" className="hover:text-primary-600">Jobs</Link>
          {user.role !== 'recruiter' && <Link to="/applications" className="hover:text-primary-600">Applications</Link>}
          {user.role !== 'recruiter' && <><Link to="/recommendations" className="hover:text-primary-600">Recommended</Link><Link to="/saved-jobs" className="hover:text-primary-600">Saved Jobs</Link></>}
          <Link to="/notifications" className="hover:text-primary-600">Notifications</Link>
          <Link to="/interviews" className="hover:text-primary-600">Interviews</Link>
          {user.role === 'recruiter' && <><Link to="/recruiter/dashboard" className="hover:text-primary-600">Recruiter Dashboard</Link><Link to="/recruiter/applications" className="hover:text-primary-600">Applicants</Link><Link to="/recruiter/candidates" className="hover:text-primary-600">Candidates</Link></>}
          <Link to="/profile" className="hover:text-primary-600">Profile</Link>
          {user.role === 'admin' && (
            <Link to="/admin" className="hover:text-primary-600">Admin</Link>
          )}
          <button
            onClick={handleLogout}
            className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md text-gray-700"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}
