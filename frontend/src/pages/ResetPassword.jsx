import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../api/axios'

export default function ResetPassword() {
  const [params] = useSearchParams(); const [password, setPassword] = useState(''); const [message, setMessage] = useState(''); const [error, setError] = useState('')
  async function submit(event) { event.preventDefault(); setError(''); try { const { data } = await api.post('/auth/password-reset/confirm/', { uid: params.get('uid'), token: params.get('token'), password }); setMessage(data.message) } catch (err) { setError(err.response?.data?.message || 'Reset link is invalid or expired.') } }
  return <div className="auth-reference-shell"><Link to="/" className="auth-reference-brand"><span>✦</span> ResumeAI</Link><div className="auth-reference-card auth-reference-single"><h1>Choose a new password</h1><p className="auth-reference-subtitle">Use at least eight characters.</p><form onSubmit={submit}><label>New password<input type="password" minLength="8" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>{error && <p className="text-red-600 text-sm">{error}</p>}{message && <p className="text-green-700 text-sm">{message} <Link to="/login">Sign in</Link></p>}<button className="reference-button">Update password →</button></form></div></div>
}
