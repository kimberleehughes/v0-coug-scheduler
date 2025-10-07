import { z } from 'zod'

// Schema version for data migration
export const SCHEMA_VERSION = '1.0.0'

// Basic enums and constants
export const PrioritySchema = z.enum(['high', 'medium', 'low'])
export const MessageSenderSchema = z.enum(['user', 'ai'])
export const ViewSchema = z.enum(['main', 'chat', 'task-editor'])

// User preferences from survey
export const UserPreferencesSchema = z.object({
  studySchedule: z.string(),
  sleepHours: z.string(),
  scheduleView: z.string(),
  taskBreakdown: z.string(),
  reminderType: z.string(),
})

// Task form for creating/editing tasks
export const TaskFormSchema = z.object({
  name: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  dueDate: z.string(),
  priority: z.string(),
})

// Schedule item (individual task/event)
export const ScheduleItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  time: z.string(),
  priority: PrioritySchema,
  completed: z.boolean(),
})

// Chat message
export const MessageSchema = z.object({
  id: z.number(),
  text: z.string(),
  sender: MessageSenderSchema,
  timestamp: z.union([z.string().transform((str) => new Date(str)), z.date()]), // Handle both stored ISO strings and Date objects
})

// Schedule items grouped by day
export const ScheduleItemsSchema = z.record(
  z.string(), // day key (Mon, Tue, etc.)
  z.array(ScheduleItemSchema)
)

// Application state that should be persisted
export const AppStateSchema = z.object({
  version: z.string(),

  // Survey and preferences
  showSurvey: z.boolean(),
  currentQuestionIndex: z.number(),
  surveyAnswers: z.array(z.string()),
  userPreferences: UserPreferencesSchema.nullable(),

  // Calendar and navigation
  currentDate: z.union([
    z.string().transform((str) => new Date(str)),
    z.date(),
  ]), // Handle both stored ISO strings and Date objects
  selectedDay: z.number(),

  // Task management
  scheduleItems: ScheduleItemsSchema,
  nextTaskId: z.number(),

  // Chat
  messages: z.array(MessageSchema),

  // UI state (optional to persist)
  currentView: ViewSchema,
})

// Individual storage schemas for granular updates
export const SurveyStateSchema = z.object({
  version: z.string(),
  showSurvey: z.boolean(),
  currentQuestionIndex: z.number(),
  surveyAnswers: z.array(z.string()),
  userPreferences: UserPreferencesSchema.nullable(),
})

export const ScheduleStateSchema = z.object({
  version: z.string(),
  scheduleItems: ScheduleItemsSchema,
  nextTaskId: z.number(),
})

export const ChatStateSchema = z.object({
  version: z.string(),
  messages: z.array(MessageSchema),
})

export const NavigationStateSchema = z.object({
  version: z.string(),
  currentDate: z.union([
    z.string().transform((str) => new Date(str)),
    z.date(),
  ]), // Handle both stored ISO strings and Date objects
  selectedDay: z.number(),
  currentView: ViewSchema,
})

// Type exports (inferred from schemas)
export type UserPreferences = z.infer<typeof UserPreferencesSchema>
export type TaskForm = z.infer<typeof TaskFormSchema>
export type ScheduleItem = z.infer<typeof ScheduleItemSchema>
export type Message = z.infer<typeof MessageSchema>
export type ScheduleItems = z.infer<typeof ScheduleItemsSchema>
export type AppState = z.infer<typeof AppStateSchema>
export type SurveyState = z.infer<typeof SurveyStateSchema>
export type ScheduleState = z.infer<typeof ScheduleStateSchema>
export type ChatState = z.infer<typeof ChatStateSchema>
export type NavigationState = z.infer<typeof NavigationStateSchema>
export type Priority = z.infer<typeof PrioritySchema>
export type MessageSender = z.infer<typeof MessageSenderSchema>
export type View = z.infer<typeof ViewSchema>

// Default values
export const DEFAULT_MESSAGES: Message[] = [
  {
    id: 1,
    text: "Go Cougs! I'm Butch, your WSU study companion! Ready to optimize your schedule and achieve your goals? Let me know how I can help!",
    sender: 'ai',
    timestamp: new Date(),
  },
]

export const DEFAULT_SCHEDULE_ITEMS: ScheduleItems = {
  Mon: [
    {
      id: 1,
      title: 'Morning workout',
      time: '7:00 AM - 8:00 AM',
      priority: 'high',
      completed: false,
    },
    {
      id: 2,
      title: 'Physics homework',
      time: '2:00 PM - 4:00 PM',
      priority: 'medium',
      completed: false,
    },
  ],
  Tue: [
    {
      id: 4,
      title: 'Lab report',
      time: '10:00 AM - 12:00 PM',
      priority: 'high',
      completed: false,
    },
    {
      id: 5,
      title: 'Study group',
      time: '4:00 PM - 6:00 PM',
      priority: 'medium',
      completed: false,
    },
  ],
  Wed: [
    {
      id: 6,
      title: 'Calculus quiz',
      time: '9:00 AM - 10:00 AM',
      priority: 'high',
      completed: false,
    },
    {
      id: 7,
      title: 'Gym session',
      time: '5:00 PM - 6:30 PM',
      priority: 'medium',
      completed: false,
    },
  ],
  Thu: [
    {
      id: 8,
      title: 'Project meeting',
      time: '11:00 AM - 12:00 PM',
      priority: 'medium',
      completed: false,
    },
    {
      id: 9,
      title: 'Grocery shopping',
      time: '3:00 PM - 4:00 PM',
      priority: 'low',
      completed: false,
    },
  ],
  Fri: [
    {
      id: 10,
      title: 'Engineering exam',
      time: '1:00 PM - 3:00 PM',
      priority: 'high',
      completed: false,
    },
    {
      id: 11,
      title: 'Social event',
      time: '7:00 PM - 9:00 PM',
      priority: 'low',
      completed: false,
    },
  ],
  Sat: [
    {
      id: 12,
      title: 'Laundry',
      time: '10:00 AM - 11:00 AM',
      priority: 'low',
      completed: false,
    },
    {
      id: 13,
      title: 'Call family',
      time: '2:00 PM - 3:00 PM',
      priority: 'medium',
      completed: false,
    },
  ],
  Sun: [
    {
      id: 14,
      title: 'Weekly planning',
      time: '9:00 AM - 10:00 AM',
      priority: 'medium',
      completed: false,
    },
    {
      id: 15,
      title: 'Meal prep',
      time: '4:00 PM - 6:00 PM',
      priority: 'low',
      completed: false,
    },
  ],
}
