'use client'

import useMirrorMindStore from '@/store/mirrorMindStore'

export default function RightPanel() {
  const { currentJD, questions } = useMirrorMindStore()

  return (
    <aside
      className="fixed top-0 right-0 h-screen w-72 flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #080E1A 0%, #070B14 100%)',
        borderLeft: '1px solid #00D4FF12',
      }}
    >
      <div className="px-5 py-5" style={{ borderBottom: '1px solid #00D4FF0F' }}>
        <p className="text-[9px] font-semibold text-[#1E2D40] uppercase tracking-widest mb-1">Session</p>
        <p className="text-sm font-semibold text-[#E2E8F0]">Job Description</p>
      </div>

      {/* Progress */}
      {questions.length > 0 && (
        <div className="px-5 py-3" style={{ borderBottom: '1px solid #00D4FF0F' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] text-[#3D5166] uppercase tracking-widest">Questions</p>
            <p className="text-xs font-semibold text-[#00D4FF]">{questions.length} total</p>
          </div>
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full"
                style={{ background: '#00D4FF33' }}
              />
            ))}
          </div>
        </div>
      )}

      {/* JD text */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {currentJD ? (
          <>
            <p className="text-[9px] font-semibold text-[#1E2D40] uppercase tracking-widest mb-3">Full Description</p>
            <p className="text-xs text-[#4A5568] leading-relaxed whitespace-pre-wrap">{currentJD}</p>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-3xl mb-3">📄</p>
            <p className="text-xs text-[#3D5166]">No job description loaded</p>
            <p className="text-[10px] text-[#1E2D40] mt-1">Start a session to see it here</p>
          </div>
        )}
      </div>
    </aside>
  )
}