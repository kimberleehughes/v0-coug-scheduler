import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { streamText, convertToModelMessages, type UIMessage } from 'ai'
import type { UserPreferences, ScheduleItems } from '@/lib/schemas'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

// Create Google AI provider with custom API key
const google = createGoogleGenerativeAI({
  apiKey: process.env.NEXT_GEMINI_API_KEY,
})

interface ChatRequestBody {
  messages: UIMessage[]
  userPreferences?: UserPreferences | null
  schedule?: ScheduleItems
}

export async function POST(req: Request) {
  const { messages, userPreferences, schedule }: ChatRequestBody =
    await req.json()

  // Convert messages to the format expected by AI SDK using the built-in converter
  const coreMessages = convertToModelMessages(messages)

  // Build context string for system prompt
  let contextInfo = ''

  if (userPreferences) {
    contextInfo += `\nUser Preferences:
- Productive hours: ${userPreferences.productiveHours}
- Sleep hours: ${userPreferences.sleepHours}
- Sleep schedule working: ${userPreferences.sleepScheduleWorking}
- Task breakdown: ${userPreferences.taskBreakdown}
- Study habits working: ${userPreferences.studyHabitsWorking}
- Reminder type: ${userPreferences.reminderType}`

    if (userPreferences.sleepScheduleNotes) {
      contextInfo += `\n- Sleep notes: ${userPreferences.sleepScheduleNotes}`
    }
    if (userPreferences.studyHabitsNotes) {
      contextInfo += `\n- Study notes: ${userPreferences.studyHabitsNotes}`
    }
  }

  if (schedule && Object.keys(schedule).length > 0) {
    contextInfo += `\nCurrent Schedule:`
    Object.entries(schedule).forEach(([day, tasks]) => {
      if (tasks && tasks.length > 0) {
        contextInfo += `\n${day}: ${tasks
          .map(
            (task) =>
              `${task.title} ${task.time ? `(${task.time})` : ''} ${
                task.completed ? '✓' : '○'
              }`
          )
          .join(', ')}`
      }
    })
  }

  const systemPrompt = `You are Butch the Cougar, Washington State University's official AI study companion! You embody the Cougar spirit with enthusiasm, pride, and determination.

Your personality:
- Energetic and encouraging, always say "Go Cougs!" or reference WSU
- Use Cougar-themed language and expressions naturally
- Supportive and understanding of student challenges
- Knowledgeable about study techniques, time management, and college life
- Occasionally reference WSU traditions, crimson and gray colors, or Palouse region
- Keep responses conversational and helpful, not too lengthy

Your role:
- Help students with scheduling, study planning, and productivity
- Provide motivation and encouragement during tough times  
- Give practical advice on time management and study techniques
- Help break down large tasks into manageable pieces
- Support healthy sleep and work-life balance

${contextInfo}

Always maintain your enthusiastic Cougar spirit while being genuinely helpful!`

  // Generate streaming response using Gemini Flash 2.5
  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: systemPrompt,
    messages: coreMessages,
  })

  return result.toUIMessageStreamResponse()
}
