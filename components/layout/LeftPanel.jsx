'use client'

import { useEffect, useState } from 'react'
import { ensureAuth } from '@/lib/pocketbase/client'

export default function LeftPanel() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    ensureAuth()
      .then(pb => pb.collection('sessions').getFullList({
        filter: pb.filter('user_id = {:userId}', { userId: pb.authStore.record.id }),
        sort: '-created',
        requestKey: null,
      }))
      .then(setSessions)
      .catch(() => setSessions([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <aside
      className="fixed top-0 left-0 h-screen w-64 flex flex-col"
      style={{
        background:  'linear-gradient(180deg, #080E1A 0%, #070B14 100%)',
        borderRight: '1px solid #00D4FF12',
      }}
    >
      <div className="px-5 py-5" style={{ borderBottom: '1px solid #00D4FF0F' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
            style={{ background: 'linear-gradient(135deg, #0D1B2E, #142338)', border: '1px solid #00D4FF4D' }}
          >
            🪞
          </div>
          <p className="text-sm font-semibold text-[#E2E8F0]">MirrorMind</p>
        </div>
      </div>
      <div className="px-5 pt-5 pb-2">
        <p className="text-[9px] font-semibold text-[#1E2D40] uppercase tracking-widest">Past Sessions</p>
      </div>
      <div className="flex-1 px-3 overflow-y-auto">
        {loading ? (
          <div className="px-3 py-8 text-center">
            <p className="text-xs text-[#3D5166]">Loading...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <p className="text-xs text-[#3D5166]">No sessions yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {sessions.map(session => (
              <div
                key={session.id}
                className="px-3 py-2.5 rounded-lg"
                style={{ border: '1px solid #00D4FF0F' }}
              >
                <p className="text-xs text-[#E2E8F0] truncate">{session.title}</p>
                <p className="text-[9px] text-[#3D5166] mt-0.5">
                  {new Date(session.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
