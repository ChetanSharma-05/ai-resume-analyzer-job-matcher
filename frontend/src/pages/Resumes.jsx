import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function Resumes() {
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const { data } = await api.get('/resumes/')
    setResumes(data.results || data)
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this resume?')) return
    await api.delete(`/resumes/${id}/`)
    load()
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Resumes</h1>
          <Link to="/resumes/upload" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            + Upload Resume
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : resumes.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400">
            No resumes yet. Upload one to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumes.map((r) => (
              <div key={r.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold">{r.title}</h3>
                  <span className="text-xs uppercase text-gray-400">{r.file_type}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  ATS Score: <span className="font-medium text-gray-800">{r.ats_score != null ? `${r.ats_score}%` : 'N/A'}</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {r.is_processed ? 'Processed' : 'Pending analysis'}
                </p>
                <div className="flex gap-3 mt-4 text-sm">
                  <Link to={`/resumes/${r.id}`} className="text-primary-600 font-medium">View</Link>
                  <button onClick={() => handleDelete(r.id)} className="text-red-500 font-medium">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
