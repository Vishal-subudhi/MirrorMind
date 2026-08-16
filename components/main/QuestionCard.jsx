'use client'

import { useState, useRef } from 'react'
import useMirrorMindStore from '@/store/mirrorMindStore'

export default function QuestionCard({ question, index }) {
  const [isOpen, setIsOpen]           = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript]   = useState('')
  const [feedback, setFeedback]       = useState(null)
  const [loading, setLoading]         = useState(false)
  const [copied, setCopied]           = useState(false)
  const recognitionRef                = useRef(null)
  const { addScore }                  = useMirrorMindStore()

  function startRecording() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition requires Chrome or Edge.')
      return
    }

    const recognition          = new SpeechRecognition()
    recognition.continuous     = true
    recognition.interimResults = true
    recognition.lang           = 'en-US'

    let finalText = ''
    recognition.onresult = (event) => {
      finalText = ''
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript + ' '
        }
      }
      setTranscript(finalText.trim())
    }

    recognition.onerror = (e) => console.error('Speech error:', e)
    recognition.start()
    recognitionRef.current = recognition
    setIsRecording(true)
    setIsOpen(true)
    setFeedback(null)
  }

  async function stopRecording() {
    if (recognitionRef.current) recognitionRef.current.stop()
    setIsRecording(false)
    setTimeout(async () => {
      if (transcript.trim()) await evaluateAnswer()
    }, 500)
  }

  async function evaluateAnswer() {
    setLoading(true)
    try {
      const res = await fetch('/api/evaluate-answer', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          question:    question.question_text,
          transcript,
          question_id: question.id,
        }),
      })
      const data = await res.json()
      setFeedback(data)
      addScore(question.id, data.score)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function copyFeedback() {
    navigator.clipboard.writeText(feedback.feedback)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const scoreColor = feedback
    ? feedback.score >= 8 ? '#10B981'
      : feedback.score >= 5 ? '#F59E0B'
      : '#EF4444'
    : '#00D4FF'

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200"
      style={{
        border:     `1px solid ${isOpen ? '#00D4FF40' : '#00D4FF1A'}`,
        background: '#0D142180',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{
            background: feedback ? `${scoreColor}33` : '#00D4FF1A',
            color:      feedback ? scoreColor         : '#00D4FF',
          }}
        >
          {feedback ? '✓' : index + 1}
        </span>

        <p className="text-sm text-[#E2E8F0] flex-1 leading-snug">{question.question_text}</p>

        <div className="flex items-center gap-2 flex-shrink-0">
          {feedback && (
            <span className="text-xs font-bold mono" style={{ color: scoreColor }}>
              {feedback.score}/10
            </span>
          )}
          <button
            onClick={e => {
              e.stopPropagation()
              isRecording ? stopRecording() : startRecording()
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={isRecording ? {
              border:     '1px solid #EF444440',
              background: '#EF444410',
              color:      '#EF4444',
            } : {
              border:     '1px solid #00D4FF33',
              background: '#00D4FF0D',
              color:      '#00D4FF',
            }}
          >
            {isRecording ? '⏹ Stop' : '🎙 Record'}
          </button>
          <span className="text-[#3D5166] text-[10px]">{isOpen ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Expanded */}
      {isOpen && (
        <div className="px-4 pb-4" style={{ borderTop: '1px solid #00D4FF14' }}>

          {isRecording && (
            <div className="mt-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-red-400 font-medium">Recording — speak your answer clearly</span>
            </div>
          )}

          {(isRecording || transcript) && (
            <div className="mt-3">
              <p className="text-[9px] font-semibold text-[#00D4FF] uppercase tracking-widest mb-2">
                {isRecording ? 'Live Transcript' : 'Your Answer'}
              </p>
              <p
                className="text-sm text-[#E2E8F0] leading-relaxed p-3 rounded-lg min-h-[48px]"
                style={{ background: '#0D1421', border: '1px solid #00D4FF14' }}
              >
                {transcript || <span className="text-[#3D5166] italic">Listening...</span>}
              </p>
            </div>
          )}

          {loading && (
            <div className="mt-3 flex items-center gap-2 text-xs text-[#3D5166]">
              <span className="w-3 h-3 border border-[#00D4FF] border-t-transparent rounded-full animate-spin flex-shrink-0" />
              Evaluating your answer...
            </div>
          )}

          {feedback && !loading && (
            <div className="mt-4 space-y-3">

              {/* Score + Confidence Meter */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-semibold text-[#4A5568] uppercase tracking-widest">Score</span>
                  <span className="text-2xl font-bold mono" style={{ color: scoreColor }}>
                    {feedback.score}<span className="text-sm text-[#3D5166]">/10</span>
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full" style={{ background: '#1E2D40' }}>
                  <div
                    className="h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${feedback.score * 10}%`, background: scoreColor }}
                  />
                </div>
              </div>

              {/* Feedback + Copy Button */}
              <div className="p-3 rounded-lg" style={{ background: `${scoreColor}08`, border: `1px solid ${scoreColor}26` }}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: scoreColor }}>
                    Feedback
                  </p>
                  <button
                    onClick={copyFeedback}
                    className="text-[9px] transition-colors"
                    style={{ color: copied ? '#10B981' : '#3D5166' }}
                  >
                    {copied ? '✓ Copied' : '📋 Copy'}
                  </button>
                </div>
                <p className="text-sm text-[#E2E8F0] leading-relaxed">{feedback.feedback}</p>
              </div>

              {feedback.tip && (
                <div className="p-3 rounded-lg" style={{ background: '#00D4FF08', border: '1px solid #00D4FF1A' }}>
                  <p className="text-[9px] font-semibold text-[#00D4FF] uppercase tracking-widest mb-1.5">💡 Improvement Tip</p>
                  <p className="text-sm text-[#E2E8F0] leading-relaxed">{feedback.tip}</p>
                </div>
              )}

              <button
                onClick={() => { setTranscript(''); setFeedback(null) }}
                className="text-[10px] text-[#3D5166] hover:text-[#00D4FF] transition-colors"
              >
                ↺ Re-record this answer
              </button>
            </div>
          )}

          {!isRecording && !transcript && !loading && !feedback && (
            <div className="mt-3 text-center py-4">
              <p className="text-xs text-[#3D5166]">Click Record to answer this question</p>
              <p className="text-[10px] text-[#1E2D40] mt-1">Requires Chrome or Edge</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}