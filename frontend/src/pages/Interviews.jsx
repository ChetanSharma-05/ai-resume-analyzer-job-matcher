import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function Interviews() {
  const [items, setItems] = useState([])
  useEffect(() => { api.get('/engagement/interviews/').then(({ data }) => setItems(data.results || data)) }, [])
  return <div><Navbar /><main className="max-w-5xl mx-auto px-6 py-10"><p className="text-sm text-primary-600 font-semibold uppercase tracking-widest">Interview schedule</p><h1 className="text-3xl font-bold mt-2">Upcoming interviews</h1><div className="grid gap-4 mt-8">{items.map((item) => <div key={item.id} className="bg-white border rounded-xl p-5 flex justify-between"><div><h2 className="font-semibold">{item.job_title}</h2><p className="text-sm text-gray-500 mt-1">{item.candidate_name} · {item.interview_type}</p><p className="text-sm text-gray-500 mt-3">{new Date(item.scheduled_at).toLocaleString()}</p>{item.notes && <p className="text-sm text-gray-500 mt-2">{item.notes}</p>}</div>{item.meeting_link && <a className="text-primary-600 text-sm" href={item.meeting_link} target="_blank" rel="noreferrer">Join meeting →</a>}</div>)}{!items.length && <div className="bg-white border rounded-xl p-12 text-center text-gray-400">No interviews scheduled yet.</div>}</div></main></div>
}
