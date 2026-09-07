import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function Notifications() {
  const [items, setItems] = useState([])
  useEffect(() => { api.get('/engagement/notifications/').then(({ data }) => setItems(data.results || data)) }, [])
  async function markRead(id) { await api.patch(`/engagement/notifications/${id}/read/`); setItems((current) => current.map((item) => item.id === id ? { ...item, is_read: true } : item)) }
  return <div><Navbar /><main className="max-w-3xl mx-auto px-6 py-10"><h1 className="text-3xl font-bold">Notifications</h1><p className="text-gray-500 mt-2">Stay informed about applications, interviews, and hiring updates.</p><div className="grid gap-3 mt-8">{items.map((item) => <div key={item.id} className={`bg-white border rounded-xl p-5 ${item.is_read ? '' : 'border-primary-300'}`}><div className="flex justify-between gap-4"><div><h2 className="font-semibold">{item.title}</h2><p className="text-sm text-gray-500 mt-1">{item.message}</p><p className="text-xs text-gray-400 mt-3">{new Date(item.created_at).toLocaleString()}</p></div>{!item.is_read && <button onClick={() => markRead(item.id)} className="text-xs text-primary-600">Mark read</button>}</div></div>)}{!items.length && <div className="bg-white border rounded-xl p-12 text-center text-gray-400">No notifications yet.</div>}</div></main></div>
}
