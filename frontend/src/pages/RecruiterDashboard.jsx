import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  useEffect(() => { Promise.all([api.get('/applications/recruiter/jobs/'), api.get('/applications/recruiter/')]).then(([jobsResponse, applicationsResponse]) => { setJobs(jobsResponse.data.results || jobsResponse.data); setApplications(applicationsResponse.data.results || applicationsResponse.data) }) }, [])
  const activeJobs = jobs.filter((job) => job.status === 'published').length
  const shortlisted = applications.filter((item) => item.status === 'shortlisted').length
  return <div><Navbar /><main className="max-w-6xl mx-auto px-6 py-10"><div className="flex flex-col md:flex-row justify-between md:items-end gap-4"><div><p className="text-sm text-primary-600 font-semibold uppercase tracking-widest">Recruiter workspace</p><h1 className="text-3xl font-bold mt-2">Hiring dashboard</h1><p className="text-gray-500 mt-2">Keep your hiring pipeline moving.</p></div><Link to="/recruiter/jobs/create" className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium">Post a job</Link></div><div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8"><Metric label="Total jobs" value={jobs.length} /><Metric label="Active jobs" value={activeJobs} /><Metric label="Applications" value={applications.length} /><Metric label="Shortlisted" value={shortlisted} /></div><div className="bg-white border rounded-xl p-6 mt-8"><div className="flex justify-between"><h2 className="font-semibold">Recent applications</h2><Link to="/recruiter/applications" className="text-sm text-primary-600">View all</Link></div>{applications.slice(0, 5).map((item) => <div key={item.id} className="border-b last:border-0 py-4 flex justify-between"><div><p className="font-medium">{item.candidate_name}</p><p className="text-sm text-gray-500">{item.job.title}</p></div><span className="text-sm text-gray-500">{item.match_score ?? '—'}% match</span></div>)}{!applications.length && <p className="text-sm text-gray-400 mt-5">No applications received yet.</p>}</div></main></div>
}
function Metric({ label, value }) { return <div className="bg-white border rounded-xl p-5"><p className="text-sm text-gray-500">{label}</p><p className="text-3xl font-bold mt-2">{value}</p></div> }
