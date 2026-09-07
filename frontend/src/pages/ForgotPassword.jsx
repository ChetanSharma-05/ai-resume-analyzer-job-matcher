import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  async function submit(event) { event.preventDefault(); const { data } = await api.post('/auth/password-reset/', { email }); setMessage(data.message) }
  return <div className="auth-reference-shell"><Link to="/" className="auth-reference-brand"><span>✦</span> ResumeAI</Link><div className="auth-reference-card auth-reference-single"><h1>Reset your password</h1><p className="auth-reference-subtitle">We will send secure reset instructions to your email.</p><form onSubmit={submit}><label>Email address<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>{message && <p className="text-green-700 text-sm">{message}</p>}<button className="reference-button">Send reset link →</button></form><p className="text-sm text-center mt-5"><Link to="/login">Back to sign in</Link></p></div></div>
}
