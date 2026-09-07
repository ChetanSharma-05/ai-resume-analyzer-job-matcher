import React from 'react'

export default function StatCard({ label, value, accent = 'primary' }) {
  const colorMap = {
    primary: 'text-primary-600',
    green: 'text-green-600',
    orange: 'text-orange-500',
    purple: 'text-purple-600',
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${colorMap[accent] || colorMap.primary}`}>{value}</p>
    </div>
  )
}
