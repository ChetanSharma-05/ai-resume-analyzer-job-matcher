import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data } = await api.get('/auth/profile/')
    setProfile(data)
  }

  function updateField(field, value) {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    await api.put('/auth/profile/', {
      first_name: profile.first_name,
      last_name: profile.last_name,
      phone: profile.phone,
      headline: profile.headline,
      bio: profile.bio,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!profile) return <div><Navbar /><p className="text-center mt-10 text-gray-400">Loading...</p></div>

  return (
    <div>
      <Navbar />
      <div className="max-w-xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>

        {saved && <div className="bg-green-50 text-green-600 text-sm p-3 rounded-md mb-4">Profile updated!</div>}

        <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input value={profile.email} disabled className="w-full mt-1 border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm text-gray-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600">First name</label>
              <input value={profile.first_name || ''} onChange={(e) => updateField('first_name', e.target.value)}
                className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Last name</label>
              <input value={profile.last_name || ''} onChange={(e) => updateField('last_name', e.target.value)}
                className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600">Phone</label>
            <input value={profile.phone || ''} onChange={(e) => updateField('phone', e.target.value)}
              className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Headline</label>
            <input value={profile.headline || ''} onChange={(e) => updateField('headline', e.target.value)}
              placeholder="e.g. Backend Developer"
              className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Bio</label>
            <textarea value={profile.bio || ''} onChange={(e) => updateField('bio', e.target.value)} rows={3}
              className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  )
}
