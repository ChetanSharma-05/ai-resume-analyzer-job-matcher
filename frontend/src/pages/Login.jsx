import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const loggedInUser = await login(email, password)
      navigate(loggedInUser.role === 'recruiter' ? '/recruiter/dashboard' : loggedInUser.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-reference-shell">
      <Link to="/" className="auth-reference-brand"><span>✦</span> ResumeAI</Link>
      <div className="auth-reference-layout">
        <div className="auth-reference-intro"><p className="reference-eyebrow">✦ Career intelligence, made practical</p><h1>Make your next move<br /><em>more intentional.</em></h1><p>Sign in to continue analyzing your resume, matching with opportunities, and tracking your applications.</p></div>
        <div className="auth-reference-card">
        <h1>Welcome back</h1>
        <p className="auth-reference-subtitle">Sign in to your ResumeAI workspace</p>

        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-md text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-6">
          <Link to="/forgot-password" className="text-primary-600 font-medium">Forgot password?</Link><br />
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 font-medium">Register</Link>
        </p>
        </div>
      </div>
    </div>
  )
}
