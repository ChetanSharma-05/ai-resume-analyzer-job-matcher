import React from 'react'
import Navbar from '../components/Navbar'

export default function AdminUsers() {
  return (
    <div>
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Manage Users</h1>
        <div className="bg-white rounded-xl border border-gray-100 p-6 text-sm text-gray-500">
          User management list connects to Django's built-in <code>/admin/</code> panel and a dedicated
          <code>/api/auth/users/</code> endpoint can be added here following the same pattern as the Jobs
          admin page (list + inline actions), scoped with <code>IsAdminRole</code> permission.
        </div>
      </div>
    </div>
  )
}
