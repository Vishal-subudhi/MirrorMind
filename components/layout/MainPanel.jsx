'use client'

import { useState } from 'react'
import useMirrorMindStore from '@/store/mirrorMindStore'
import QuestionCard from '@/components/main/QuestionCard'
import { createClient } from '@/lib/pocketbase/client'

export default function MainPanel() {
  const { currentSessionId, questions, scores, setCurrentSession, clearSession } = useMirrorMindStore()
  const [showModal, setShowModal]           = useState(!currentSessionId)
  const [jobDescription, setJobDescription] = useState('')
  const [questionCount, setQuestionCount]   = useState(5)
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState(null)

  async function handleGenerate() {
    if (!jobDescription.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/generate-questions', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ job_description: jobDescription, question_count: questionCount }),
      })
      const { questions: generatedQuestions, error: apiError } = await res.json()
      if (apiError) throw new Error(apiError)

      const pb = createClient()
      const user = pb.authStore.record

      const sessionRecord = await pb.collection('sessions').create({
        user_id: user.id,
        job_description: jobDescription,
        title: jobDescription.slice(0, 60),
      }, { requestKey: null })

      const createdQuestions = []
      for (const q of generatedQuestions) {
        const questionRecord = await pb.collection('questions').create({
          session_id: sessionRecord.id,
          question_text: q.question_text,
          order_index: q.order_index,
        }, { requestKey: null })
        createdQuestions.push({
          id: questionRecord.id,
          question_text: questionRecord.question_text,
          order_index: questionRecord.order_index,
        })
      }

      setCurrentSession(sessionRecord.id, jobDescription, createdQuestions)
      setShowModal(false)
      setJobDescription('')
    } catch (err) {
      setError(err?.message || 'Failed to generate questions. Check your API key and try again.')
    } finally {
      setLoading(false)
    }
  }

  // Session summary calculation
  const scoreValues  = Object.values(scores)
  const avgScore     = scoreValues.length > 0
    ? (scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length).toFixed(1)
    : null
  const avgColor     = avgScore
    ? avgScore >= 8 ? '#10B981' : avgScore >= 5 ? '#F59E0B' : '#EF4444'
    : '#00D4FF'

  return (
    <div className="p-8 min-h-screen">

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: '#000000B3' }}
        >
          <div className="glass rounded-2xl p-8 w-[560px] max-w-[calc(100vw-2rem)] mx-4">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                style={{ background: 'linear-gradient(135deg, #0D1B2E, #142338)', border: '1px solid #00D4FF4D' }}
              >
                🪞
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#E2E8F0]">New Interview Session</h2>
                <p className="text-xs text-[#3D5166]">Paste a job description to get started</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[9px] font-semibold text-[#4A5568] uppercase tracking-widest mb-2">
                  Job Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here — role, requirements, responsibilities..."
                  className="input-field w-full rounded-xl px-4 py-3 text-sm resize-none"
                  rows={8}
                />
              </div>

              <div>
                <label className="block text-[9px] font-semibold text-[#4A5568] uppercase tracking-widest mb-2">
                  Number of Questions
                </label>
                <div className="flex gap-2">
                  {[3, 5, 7, 10].map(n => (
                    <button
                      key={n}
                      onClick={() => setQuestionCount(n)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                      style={questionCount === n ? {
                        background: '#00D4FF',
                        color:      '#070B14',
                        boxShadow:  '0 0 16px #00D4FF4D',
                      } : {
                        border:     '1px solid #00D4FF1A',
                        background: '#00D4FF0D',
                        color:      '#3D5166',
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 flex items-start gap-2 px-4 py-3 rounded-xl"
                style={{ background: '#EF444410', border: '1px solid #EF444430' }}>
                <span className="text-red-400 text-sm">⚠</span>
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || !jobDescription.trim()}
              className="btn-primary w-full py-3 rounded-xl text-sm mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#070B14]/30 border-t-[#070B14] rounded-full animate-spin" />
                  Generating {questionCount} questions...
                </span>
              ) : `Generate ${questionCount} Questions →`}
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[9px] font-semibold text-[#00D4FF] uppercase tracking-widest mb-1">Interview Coach</p>
          <h1 className="text-2xl font-bold text-[#E2E8F0]">MirrorMind</h1>
          <p className="text-xs text-[#3D5166] mt-1">Answer each question — get real-time AI feedback</p>
        </div>
        <div className="flex gap-2">
          {currentSessionId && (
            <button
              onClick={() => { clearSession(); setShowModal(true) }}
              className="px-4 py-2 rounded-xl text-xs text-[#3D5166] hover:text-[#E2E8F0] transition-colors"
              style={{ border: '1px solid #00D4FF1A' }}
            >
              Clear Session
            </button>
          )}
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary px-4 py-2 rounded-xl text-xs"
          >
            + New Session
          </button>
        </div>
      </div>

      {/* Questions */}
      {questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-5xl mb-4">🪞</p>
          <p className="text-sm font-medium text-[#E2E8F0]">No session active</p>
          <p className="text-xs text-[#3D5166] mt-1">Paste a job description to generate tailored interview questions</p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary px-5 py-2 rounded-xl text-sm mt-4"
          >
            Start Interview Prep
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[9px] font-semibold text-[#1E2D40] uppercase tracking-widest">
                {questions.length} Questions — click to expand, record to answer
              </p>
              <p className="text-[9px] text-[#3D5166]">🎙 Requires Chrome or Edge</p>
            </div>
            {questions.map((question, i) => (
              <QuestionCard key={question.id} question={question} index={i} />
            ))}
          </div>

          {/* Session Summary */}
          {avgScore && (
            <div className="mt-6 p-5 rounded-xl"
              style={{ border: '1px solid #00D4FF1A', background: '#00D4FF08' }}>
              <p className="text-[9px] font-semibold text-[#00D4FF] uppercase tracking-widest mb-4">
                Session Summary
              </p>
              <div className="flex items-center gap-5">
                <div>
                  <p className="text-3xl font-bold mono" style={{ color: avgColor }}>{avgScore}</p>
                  <p className="text-[9px] text-[#3D5166] mt-0.5">Avg Score</p>
                </div>
                <div className="flex-1">
                  <div className="w-full h-2 rounded-full mb-1.5" style={{ background: '#1E2D40' }}>
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{ width: `${avgScore * 10}%`, background: avgColor }}
                    />
                  </div>
                  <p className="text-[9px] text-[#3D5166]">Overall performance</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#E2E8F0] mono">
                    {scoreValues.length}<span className="text-[#3D5166] text-sm">/{questions.length}</span>
                  </p>
                  <p className="text-[9px] text-[#3D5166] mt-0.5">Answered</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}