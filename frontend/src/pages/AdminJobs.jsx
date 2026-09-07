import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function AdminJobs() {
  const [jobs, setJobs] = useState([])
  const [form, setForm] = useState({
    title: '', company: '', description: '', location: '',
    employment_type: 'full_time', experience_required: '', salary: '',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data } = await api.get('/jobs/')
    setJobs(data.results || data)
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    try {
      await api.post('/jobs/', form)
      setForm({ title: '', company: '', description: '', location: '', employment_type: 'full_time', experience_required: '', salary: '' })
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job. Admin access required.')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this job posting?')) return
    await api.delete(`/jobs/${id}/`)
    load()
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Manage Jobs</h1>

        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md mb-4">{error}</div>}

        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-100 p-6 mb-8 space-y-3">
          <h2 className="font-semibold mb-2">Add New Job</h2>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Job title" required value={form.title} onChange={(e) => updateField('title', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
            <input placeholder="Company" required value={form.company} onChange={(e) => updateField('company', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <textarea placeholder="Job description" required rows={3} value={form.description} onChange={(e) => updateField('description', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          <div className="grid grid-cols-3 gap-3">
            <input placeholder="Location" value={form.location} onChange={(e) => updateField('location', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
            <select value={form.employment_type} onChange={(e) => updateField('employment_type', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="remote">Remote</option>
            </select>
            <input placeholder="Experience (e.g. 2-4 years)" value={form.experience_required} onChange={(e) => updateField('experience_required', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <input placeholder="Salary (optional)" value={form.salary} onChange={(e) => updateField('salary', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            Create Job
          </button>
        </form>

        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-xl border border-gray-100 p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">{job.title}</p>
                <p className="text-sm text-gray-500">{job.company} · {job.location}</p>
              </div>
              <button onClick={() => handleDelete(job.id)} className="text-red-500 text-sm font-medium">Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
