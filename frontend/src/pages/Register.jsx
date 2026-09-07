import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({ username: '', email: '', password: '', first_name: '', last_name: '', role: searchParams.get('role') === 'recruiter' ? 'recruiter' : 'user', company_name: '', company_website: '', company_description: '', company_location: '', industry: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-reference-shell">
      <Link to="/" className="auth-reference-brand"><span>✦</span> ResumeAI</Link>
      <div className="auth-reference-layout">
        <div className="auth-reference-intro"><p className="reference-eyebrow">✦ A clearer career system</p><h1>Build your next chapter<br /><em>with better signal.</em></h1><p>Create a candidate or recruiter account and keep every important career decision in one calm workspace.</p></div>
        <div className="auth-reference-card">
        <h1>Create your account</h1>
        <p className="auth-reference-subtitle">Start your ResumeAI workspace</p>

        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md mb-4">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 text-sm p-3 rounded-md mb-4">Account created! Redirecting to login...</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => updateField('role', 'user')} className={`border rounded-md py-2 text-sm ${form.role === 'user' ? 'border-primary-600 text-primary-600' : ''}`}>Candidate</button><button type="button" onClick={() => updateField('role', 'recruiter')} className={`border rounded-md py-2 text-sm ${form.role === 'recruiter' ? 'border-primary-600 text-primary-600' : ''}`}>Recruiter</button></div>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="First name" value={form.first_name} onChange={(e) => updateField('first_name', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
            <input placeholder="Last name" value={form.last_name} onChange={(e) => updateField('last_name', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <input placeholder="Username" required value={form.username} onChange={(e) => updateField('username', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          <input type="email" placeholder="Email" required value={form.email} onChange={(e) => updateField('email', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          <input type="password" placeholder="Password (min 8 characters)" required value={form.password} onChange={(e) => updateField('password', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          {form.role === 'recruiter' && <div className="space-y-3 border-t pt-3"><input placeholder="Company name" required value={form.company_name} onChange={(e) => updateField('company_name', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" /><input placeholder="Company website" type="url" value={form.company_website} onChange={(e) => updateField('company_website', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" /><input placeholder="Company location" value={form.company_location} onChange={(e) => updateField('company_location', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" /><input placeholder="Industry" value={form.industry} onChange={(e) => updateField('industry', e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" /></div>}
          <button type="submit" disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-md text-sm font-medium disabled:opacity-50">
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium">Login</Link>
        </p>
        </div>
      </div>
    </div>
  )
}
