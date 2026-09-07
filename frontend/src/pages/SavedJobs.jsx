import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function SavedJobs() {
  const [items, setItems] = useState([])
  useEffect(() => { api.get('/engagement/saved-jobs/').then(({ data }) => setItems(data.results || data)) }, [])
  async function remove(id) { await api.delete(`/engagement/saved-jobs/${id}/`); setItems((current) => current.filter((item) => item.id !== id)) }
  return <div><Navbar /><main className="max-w-5xl mx-auto px-6 py-10"><h1 className="text-3xl font-bold">Saved jobs</h1><p className="text-gray-500 mt-2">Keep promising opportunities close while you decide.</p><div className="grid gap-4 mt-8">{items.map((item) => <div key={item.id} className="bg-white border rounded-xl p-5 flex justify-between items-center"><Link to={`/jobs/${item.job.id}`}><h2 className="font-semibold">{item.job.title}</h2><p className="text-sm text-gray-500 mt-1">{item.job.company} · {item.job.location || 'Remote'}</p></Link><button onClick={() => remove(item.id)} className="text-sm text-red-600">Remove</button></div>)}{!items.length && <div className="bg-white border rounded-xl p-12 text-center text-gray-400">No saved jobs yet.</div>}</div></main></div>
}
