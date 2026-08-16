import { NextResponse } from 'next/server'
import client from '@/lib/openai'

export async function POST(request) {
  const { question, transcript } = await request.json()

  if (!transcript || transcript.trim().length === 0) {
    return NextResponse.json({
      score:    0,
      feedback: 'No answer was recorded.',
      tip:      'Try speaking clearly after clicking Record.',
    })
  }

  const response = await client.chat.completions.create({
    model: 'z-ai/glm-5.2',
    messages: [
      {
        role: 'system',
        content: 'You are an expert interview coach. Evaluate the candidate\'s answer. Respond ONLY with a JSON object: {"score": 7, "feedback": "detailed feedback here", "tip": "one actionable improvement tip"}'
      },
      {
        role: 'user',
        content: `Question: ${question}\n\nCandidate's Answer: ${transcript}`
      }
    ],
    max_tokens: 500,
  })

  try {
    const content      = response.choices[0].message.content
    const cleanContent = content.replace(/```json|```/g, '').trim()
    const evaluation   = JSON.parse(cleanContent)
    return NextResponse.json(evaluation)
  } catch {
    return NextResponse.json({
      score:    5,
      feedback: response.choices[0].message.content,
      tip:      'Structure your answers using the STAR method.',
    })
  }
}