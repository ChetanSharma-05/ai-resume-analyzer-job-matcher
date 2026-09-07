import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function ResumeAnalysis() {
  const { id } = useParams()
  const [resume, setResume] = useState(null)

  useEffect(() => {
    api.get(`/resumes/${id}/`).then(({ data }) => setResume(data))
  }, [id])

  if (!resume) return <div><Navbar /><p className="text-center mt-10 text-gray-400">Loading...</p></div>

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <h1 className="text-2xl font-bold">{resume.title} — Full Analysis</h1>

        <Section title="Education" items={resume.education} render={(e) => `${e.degree} — ${e.institution}`} />
        <Section title="Experience" items={resume.experience} render={(e) => `${e.position} @ ${e.company}`} />
        <Section title="Projects" items={resume.projects} render={(p) => `${p.name}: ${p.technologies || ''}`} />
        <Section title="Certifications" items={resume.certifications} render={(c) => `${c.name}${c.issuer ? ' — ' + c.issuer : ''}`} />

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold mb-2">Raw Extracted Text</h2>
          <pre className="text-xs text-gray-500 whitespace-pre-wrap max-h-96 overflow-y-auto">{resume.extracted_text}</pre>
        </div>
      </div>
    </div>
  )
}

function Section({ title, items, render }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h2 className="font-semibold mb-3">{title}</h2>
      {(!items || items.length === 0) ? (
        <p className="text-sm text-gray-400">Not detected in this resume. Layout-based detection is heuristic — consider adding a clear "{title}" heading to your resume.</p>
      ) : (
        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
          {items.map((item, idx) => <li key={idx}>{render(item)}</li>)}
        </ul>
      )}
    </div>
  )
}
