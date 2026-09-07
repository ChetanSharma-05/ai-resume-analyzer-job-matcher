import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function Recommendations() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { api.get('/engagement/recommendations/').then(({ data }) => setItems(data.results || data)).finally(() => setLoading(false)) }, [])
  return <div><Navbar /><main className="max-w-6xl mx-auto px-6 py-10"><p className="text-sm text-primary-600 font-semibold uppercase tracking-widest">AI recommendations</p><h1 className="text-3xl font-bold mt-2">Recommended for you</h1><p className="text-gray-500 mt-2">Roles ranked from your processed resume and real matching signals.</p>{loading ? <p className="mt-8 text-gray-400">Finding relevant roles...</p> : !items.length ? <div className="bg-white border rounded-xl p-12 text-center mt-8"><h2 className="font-semibold">No recommendations yet</h2><p className="text-sm text-gray-500 mt-2">Upload and analyze a resume to unlock personalized roles.</p></div> : <div className="grid md:grid-cols-2 gap-4 mt-8">{items.map((item) => <Link key={item.id} to={`/jobs/${item.job.id}`} className="bg-white border rounded-xl p-5 hover:border-primary-300"><div className="flex justify-between gap-3"><div><p className="text-xs text-gray-400">{item.job.company}</p><h2 className="font-semibold mt-1">{item.job.title}</h2></div><strong className="text-primary-600">{item.score}%</strong></div><p className="text-sm text-gray-500 mt-3">{item.job.location || 'Remote'} · {item.job.employment_type}</p><div className="flex flex-wrap gap-2 mt-4">{(item.reason?.matched_skills || []).map((skill) => <span key={skill} className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs">{skill}</span>)}</div></Link>)}</div>}</main></div>
}
