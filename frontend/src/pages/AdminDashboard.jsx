import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StatCard from '../components/StatCard'
import api from '../api/axios'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function AdminDashboard() {
  const [jobCount, setJobCount] = useState(0)
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      const { data } = await api.get('/engagement/analytics/')
      setAnalytics(data.data)
      setJobCount(data.data.jobs)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Jobs" value={jobCount} accent="primary" />
          <StatCard label="Candidates" value={analytics?.candidates ?? '—'} accent="green" />
          <StatCard label="Applications" value={analytics?.applications ?? '—'} accent="purple" />
          <StatCard label="Manage Users" value="→" accent="green" />
          <StatCard label="Manage Jobs" value="→" accent="purple" />
        </div>

        <div className="flex gap-4">
          <Link to="/admin/users" className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex-1 hover:shadow-md transition">
            <h3 className="font-semibold mb-1">Users</h3>
            <p className="text-sm text-gray-500">View and manage registered users</p>
          </Link>
          <Link to="/admin/jobs" className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex-1 hover:shadow-md transition">
            <h3 className="font-semibold mb-1">Jobs</h3>
            <p className="text-sm text-gray-500">Add, edit, or remove job postings</p>
          </Link>
        </div>
        {analytics && <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mt-8"><h2 className="font-semibold mb-4">Application status distribution</h2><ResponsiveContainer width="100%" height={260}><BarChart data={analytics.application_statuses}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="status" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="#2563eb" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div>}
      </div>
    </div>
  )
}
