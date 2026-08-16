import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useMirrorMindStore = create(
  persist(
    (set) => ({
      currentSessionId: null,
      currentJD:        '',
      questions:        [],
      scores:           {},
      setCurrentSession: (sessionId, jd, questions) => set({
        currentSessionId: sessionId,
        currentJD:        jd,
        questions,
        scores:           {},
      }),
      addScore: (questionId, score) => set(state => ({
        scores: { ...state.scores, [questionId]: score }
      })),
      clearSession: () => set({
        currentSessionId: null,
        currentJD:        '',
        questions:        [],
        scores:           {},
      }),
    }),
    { name: 'mirrormind-store' }
  )
)

export default useMirrorMindStore