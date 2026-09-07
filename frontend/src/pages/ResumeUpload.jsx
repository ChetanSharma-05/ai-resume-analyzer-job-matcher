import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function ResumeUpload() {
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file) {
      setError('Please select a PDF or DOCX file.')
      return
    }
    setError('')
    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', title || file.name)

    try {
      const { data } = await api.post('/resumes/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      navigate(`/resumes/${data.data.id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try a different file.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-6">Upload Resume</h1>

        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 space-y-4">
          <div>
            <label className="text-sm text-gray-600">Resume title (optional)</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Software Engineer Resume 2026"
              className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">File (PDF or DOCX, max 5MB)</label>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full mt-1 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-md text-sm font-medium disabled:opacity-50"
          >
            {uploading ? 'Uploading & analyzing...' : 'Upload & Analyze'}
          </button>
        </form>
      </div>
    </div>
  )
}
