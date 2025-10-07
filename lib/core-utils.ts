export type UserPreferences = {
  studySchedule: string
  sleepHours: string
  scheduleView: string
  taskBreakdown: string
  reminderType: string
}

export type TaskForm = {
  name: string
  startTime: string
  endTime: string
  dueDate: string
  priority: string
}

export type ScheduleItem = {
  id: number
  title: string
  time: string
  priority: 'high' | 'medium' | 'low'
  completed: boolean
}

export type Message = {
  id: number
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
}

// Survey questions for onboarding
export const SURVEY_QUESTIONS = [
  {
    id: 1,
    question: "What's your preferred study schedule?",
    options: [
      'Morning (6-10 AM)',
      'Afternoon (12-4 PM)',
      'Evening (6-10 PM)',
      'Late Night (10 PM-2 AM)',
    ],
  },
  {
    id: 2,
    question: 'How many hours of sleep do you typically need?',
    options: ['6-7 hours', '7-8 hours', '8-9 hours', '9+ hours'],
  },
  {
    id: 3,
    question: "What's your preferred schedule view?",
    options: ['Daily Schedule', 'Weekly Schedule', 'Monthly Schedule'],
  },
  {
    id: 4,
    question: 'How do you prefer to break down large tasks?',
    options: [
      'Keep tasks whole',
      'Break into 30-min chunks',
      'Break into 1-hour chunks',
      'Let AI decide',
    ],
  },
  {
    id: 5,
    question: 'What type of reminders work best for you?',
    options: [
      'Visual notifications',
      'Sound alerts',
      'Gentle nudges',
      'No reminders',
    ],
  },
]

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Utility functions
export function getCurrentDayIndex(): number {
  const today = new Date()
  return (today.getDay() + 6) % 7
}

export function calculateSuccessPercentage(scheduleItems: {
  [key: string]: ScheduleItem[]
}): number {
  const allTasks = Object.values(scheduleItems).flat()
  const completedTasks = allTasks.filter((task) => task.completed)
  const totalTasks = allTasks

  if (totalTasks.length === 0) return 0
  return Math.round((completedTasks.length / totalTasks.length) * 100)
}

export function processUserPreferences(
  surveyAnswers: string[]
): UserPreferences {
  return {
    studySchedule: surveyAnswers[0],
    sleepHours: surveyAnswers[1],
    scheduleView: surveyAnswers[2],
    taskBreakdown: surveyAnswers[3],
    reminderType: surveyAnswers[4],
  }
}

export function createNewTask(
  taskForm: TaskForm,
  nextTaskId: number
): ScheduleItem {
  return {
    id: nextTaskId,
    title: taskForm.name,
    time: `${taskForm.startTime} - ${taskForm.endTime}`,
    priority: taskForm.priority as 'high' | 'medium' | 'low',
    completed: false,
  }
}

export function updateTaskCompletion(
  scheduleItems: { [key: string]: ScheduleItem[] },
  taskId: number,
  dayKey: string
): { [key: string]: ScheduleItem[] } {
  return {
    ...scheduleItems,
    [dayKey]: scheduleItems[dayKey].map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ),
  }
}

export function validateTaskForm(taskForm: TaskForm): string[] {
  const errors: string[] = []

  if (!taskForm.name.trim()) {
    errors.push('Task name is required')
  }

  if (!taskForm.startTime) {
    errors.push('Start time is required')
  }

  if (!taskForm.endTime) {
    errors.push('End time is required')
  }

  if (
    taskForm.startTime &&
    taskForm.endTime &&
    taskForm.startTime >= taskForm.endTime
  ) {
    errors.push('End time must be after start time')
  }

  if (!['high', 'medium', 'low'].includes(taskForm.priority)) {
    errors.push('Priority must be high, medium, or low')
  }

  return errors
}

export function createChatMessage(
  text: string,
  sender: 'user' | 'ai'
): Message {
  return {
    id: Date.now(),
    text: text.trim(),
    sender,
    timestamp: new Date(),
  }
}
