import { NextResponse } from 'next/server'
import client from '@/lib/openai'

export async function POST(request) {
  const { job_description, question_count } = await request.json()

  const response = await client.chat.completions.create({
    model: 'z-ai/glm-5.2',
    messages: [
      {
        role: 'system',
        content: `Generate exactly ${question_count} interview questions based on the job description. Return ONLY a JSON array of strings.`
      },
      {
        role: 'user',
        content: `Job Description:\n${job_description}`
      }
    ],
    max_tokens: 1000,
  })

  try {
    const content      = response.choices[0].message.content
    const cleanContent = content.replace(/```json|```/g, '').trim()
    const questionTexts = JSON.parse(cleanContent)

    const mockSession   = { id: 'mock-session-1' }
    const mockQuestions = questionTexts.map((q, i) => ({
      id:            `mock-q-${i}`,
      question_text: q,
      order_index:   i,
    }))

    return NextResponse.json({ session: mockSession, questions: mockQuestions })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 })
  }
}