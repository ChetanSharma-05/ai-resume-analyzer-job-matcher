import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function RecruiterJobs() {
  const [jobs, setJobs] = useState([])
  const [error, setError] = useState('')
  async function load() { try { const { data } = await api.get('/applications/recruiter/jobs/'); setJobs(data.results || data) } catch { setError('Jobs could not be loaded.') } }
  useEffect(() => { load() }, [])
  async function remove(id) { if (!window.confirm('Delete this job?')) return; try { await api.delete(`/jobs/${id}/`); setJobs((items) => items.filter((item) => item.id !== id)) } catch (err) { setError(err.response?.data?.message || 'Job could not be deleted.') } }
  return <div><Navbar /><main className="max-w-6xl mx-auto px-6 py-10"><div className="flex justify-between items-end"><div><h1 className="text-3xl font-bold">My jobs</h1><p className="text-gray-500 mt-2">Manage your open roles and applications.</p></div><Link to="/recruiter/jobs/create" className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm">Post a job</Link></div>{error && <p className="bg-red-50 text-red-600 p-3 rounded-md text-sm mt-5">{error}</p>}<div className="bg-white border rounded-xl overflow-hidden mt-8"><div className="hidden md:grid grid-cols-6 gap-4 bg-slate-50 px-5 py-3 text-xs font-semibold text-gray-500 uppercase"><span className="col-span-2">Job</span><span>Location</span><span>Status</span><span>Applications</span><span>Actions</span></div>{jobs.map((job) => <div key={job.id} className="grid md:grid-cols-6 gap-3 md:gap-4 px-5 py-4 border-t items-center text-sm"><div className="md:col-span-2"><p className="font-medium">{job.title}</p><p className="text-gray-500">{job.company}</p></div><span className="text-gray-500">{job.location || 'Remote'}</span><span className="text-xs">{job.status}</span><span>{job.application_count || 0}</span><div className="flex gap-3"><Link to={`/recruiter/jobs/${job.id}/edit`} className="text-primary-600">Edit</Link><button onClick={() => remove(job.id)} className="text-red-600">Delete</button></div></div>)}{!jobs.length && <p className="p-10 text-center text-gray-400">No jobs posted yet.</p>}</div></main></div>
}
