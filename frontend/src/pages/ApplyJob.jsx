import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function ApplyJob() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [resumes, setResumes] = useState([])
  const [resume, setResume] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [form, setForm] = useState({ phone: '', location: '', portfolio_url: '', notice_period: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([api.get(`/jobs/${id}/`), api.get('/resumes/'), api.get('/auth/profile/')]).then(([jobResponse, resumeResponse, profileResponse]) => {
      setJob(jobResponse.data)
      setForm((current) => ({ ...current, phone: profileResponse.data.phone || '', location: profileResponse.data.location || '' }))
      const list = resumeResponse.data.results || resumeResponse.data
      setResumes(list)
      if (list.length) setResume(String(list[0].id))
    }).catch((err) => setError(err.response?.data?.message || 'Unable to load application details.'))
  }, [id])

  async function submit(event) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      await api.post('/applications/', { job: id, resume, cover_letter: coverLetter, ...form })
      navigate('/applications')
    } catch (err) {
      setError(err.response?.data?.message || Object.values(err.response?.data?.errors || {})[0]?.[0] || 'Application could not be submitted.')
    } finally { setSaving(false) }
  }

  return <div><Navbar /><main className="max-w-3xl mx-auto px-6 py-10"><Link to={`/jobs/${id}`} className="text-sm text-primary-600">← Back to job</Link><h1 className="text-3xl font-bold mt-4">Apply for {job?.title || 'this role'}</h1>{job && <p className="text-gray-500 mt-2">{job.company} · {job.location || 'Remote'}</p>}{error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mt-6">{error}</div>}{!resumes.length ? <div className="bg-white border rounded-xl p-8 mt-8"><h2 className="font-semibold">Resume required</h2><p className="text-sm text-gray-500 mt-2">Upload and analyze a resume before applying.</p><Link to="/resumes/upload" className="inline-block mt-5 bg-primary-600 text-white px-4 py-2 rounded-md text-sm">Upload Resume</Link></div> : <form onSubmit={submit} className="bg-white border rounded-xl p-6 mt-8 space-y-5"><h2 className="font-semibold">Your application information</h2><div className="grid md:grid-cols-2 gap-4"><Field label="Phone number" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} required /><Field label="Current location" value={form.location} onChange={(value) => setForm({ ...form, location: value })} required /></div><div className="grid md:grid-cols-2 gap-4"><Field label="Portfolio / LinkedIn URL" value={form.portfolio_url} onChange={(value) => setForm({ ...form, portfolio_url: value })} type="url" /><Field label="Notice period" value={form.notice_period} onChange={(value) => setForm({ ...form, notice_period: value })} placeholder="e.g. Immediate, 30 days" /></div><div><label className="block text-sm font-medium mb-2">Resume</label><select required value={resume} onChange={(e) => setResume(e.target.value)} className="w-full border rounded-md px-3 py-2">{resumes.map((item) => <option key={item.id} value={item.id}>{item.title} · ATS {item.ats_score ?? '—'}%</option>)}</select></div><div><label className="block text-sm font-medium mb-2">Cover letter <span className="font-normal text-gray-400">(optional)</span></label><textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} rows="8" className="w-full border rounded-md px-3 py-2" placeholder="Tell the recruiter why this role is a strong fit." /></div><button disabled={saving} className="w-full bg-primary-600 text-white py-3 rounded-md font-medium disabled:opacity-60">{saving ? 'Submitting...' : 'Submit Application'}</button></form>}</main></div>
}

function Field({ label, value, onChange, required, type = 'text', placeholder = '' }) {
  return <label className="block text-sm font-medium">{label}<input required={required} type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="w-full border rounded-md px-3 py-2 mt-2 font-normal" /></label>
}
