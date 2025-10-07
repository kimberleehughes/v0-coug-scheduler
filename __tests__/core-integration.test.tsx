import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

type TaskItem = {
  id: number
  title: string
  time: string
  priority: 'high' | 'medium' | 'low'
  completed: boolean
}

type Message = {
  id: number
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
}

// Mock the core functions we'll be using
const mockScheduleItems: Record<string, TaskItem[]> = {
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
      completed: true,
    },
  ],
}

// Simple test component that represents our core functionality
const CoreAppTest = () => {
  const [showSurvey, setShowSurvey] = React.useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0)
  const [surveyAnswers, setSurveyAnswers] = React.useState<string[]>([])
  const [scheduleItems, setScheduleItems] = React.useState(mockScheduleItems)
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm Butch, ready to help!",
      sender: 'ai',
      timestamp: new Date(),
    },
  ])
  const [inputText, setInputText] = React.useState('')

  const surveyQuestions = [
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
  ]

  const handleSurveyAnswer = (answer: string) => {
    const newAnswers = [...surveyAnswers, answer]
    setSurveyAnswers(newAnswers)

    if (currentQuestionIndex < surveyQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      setShowSurvey(false)
    }
  }

  const handleTaskCompletion = (taskId: number, dayKey: string) => {
    setScheduleItems((prev) => ({
      ...prev,
      [dayKey]: prev[dayKey].map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      ),
    }))
  }

  const handleSendMessage = () => {
    if (!inputText.trim()) return

    const userMessage: Message = {
      id: Date.now(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    }

    const aiMessage: Message = {
      id: Date.now() + 1,
      text: 'Thanks for your message!',
      sender: 'ai',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage, aiMessage])
    setInputText('')
  }

  if (showSurvey) {
    const currentQuestion = surveyQuestions[currentQuestionIndex]
    return (
      <div data-testid="survey">
        <h2>{currentQuestion.question}</h2>
        <div>
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSurveyAnswer(option)}
              data-testid={`survey-option-${index}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div data-testid="main-app">
      <h1>Schedule App</h1>

      {/* Task List */}
      <div data-testid="task-list">
        {scheduleItems.Mon.map((task) => (
          <div key={task.id} data-testid={`task-${task.id}`}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleTaskCompletion(task.id, 'Mon')}
              data-testid={`task-checkbox-${task.id}`}
            />
            <span>{task.title}</span>
          </div>
        ))}
      </div>

      {/* Chat */}
      <div data-testid="chat">
        <div data-testid="messages">
          {messages.map((message) => (
            <div key={message.id} data-testid={`message-${message.sender}`}>
              {message.text}
            </div>
          ))}
        </div>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          data-testid="chat-input"
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage} data-testid="send-button">
          Send
        </button>
      </div>
    </div>
  )
}

describe('Core App Integration', () => {
  it('should complete the survey flow', async () => {
    const user = userEvent.setup()
    render(<CoreAppTest />)

    // Should show survey initially
    expect(screen.getByTestId('survey')).toBeDefined()
    expect(
      screen.getByText("What's your preferred study schedule?")
    ).toBeDefined()

    // Answer first question
    await user.click(screen.getByTestId('survey-option-0'))

    // Should show second question
    await waitFor(() => {
      expect(
        screen.getByText('How many hours of sleep do you typically need?')
      ).toBeDefined()
    })

    // Answer second question
    await user.click(screen.getByTestId('survey-option-1'))

    // Should show main app after completing survey
    await waitFor(() => {
      expect(screen.getByTestId('main-app')).toBeDefined()
      expect(screen.queryByTestId('survey')).toBeNull()
    })
  })

  it('should toggle task completion', async () => {
    const user = userEvent.setup()
    render(<CoreAppTest />)

    // Complete survey first
    await user.click(screen.getByTestId('survey-option-0'))
    await user.click(screen.getByTestId('survey-option-1'))

    // Wait for main app
    await waitFor(() => {
      expect(screen.getByTestId('main-app')).toBeDefined()
    })

    // Check initial task states
    const task1Checkbox = screen.getByTestId(
      'task-checkbox-1'
    ) as HTMLInputElement
    const task2Checkbox = screen.getByTestId(
      'task-checkbox-2'
    ) as HTMLInputElement

    expect(task1Checkbox.checked).toBe(false) // Morning workout - initially false
    expect(task2Checkbox.checked).toBe(true) // Physics homework - initially true

    // Toggle first task
    await user.click(task1Checkbox)
    expect(task1Checkbox.checked).toBe(true)

    // Toggle second task
    await user.click(task2Checkbox)
    expect(task2Checkbox.checked).toBe(false)
  })

  it('should handle chat messages', async () => {
    const user = userEvent.setup()
    render(<CoreAppTest />)

    // Complete survey first
    await user.click(screen.getByTestId('survey-option-0'))
    await user.click(screen.getByTestId('survey-option-1'))

    await waitFor(() => {
      expect(screen.getByTestId('main-app')).toBeDefined()
    })

    // Should show initial AI message
    expect(screen.getByText("Hello! I'm Butch, ready to help!")).toBeDefined()

    // Type and send a message
    const chatInput = screen.getByTestId('chat-input') as HTMLInputElement
    const sendButton = screen.getByTestId('send-button')

    await user.type(chatInput, 'Hello Butch!')
    await user.click(sendButton)

    // Should show user message and AI response
    await waitFor(() => {
      expect(screen.getByText('Hello Butch!')).toBeDefined()
      expect(screen.getByText('Thanks for your message!')).toBeDefined()
    })

    // Input should be cleared
    expect(chatInput.value).toBe('')
  })

  it('should not send empty messages', async () => {
    const user = userEvent.setup()
    render(<CoreAppTest />)

    // Complete survey
    await user.click(screen.getByTestId('survey-option-0'))
    await user.click(screen.getByTestId('survey-option-1'))

    await waitFor(() => {
      expect(screen.getByTestId('main-app')).toBeDefined()
    })

    const sendButton = screen.getByTestId('send-button')
    const initialMessageCount = screen.getAllByTestId(/^message-/).length

    // Try to send empty message
    await user.click(sendButton)

    // Message count should remain the same
    const finalMessageCount = screen.getAllByTestId(/^message-/).length
    expect(finalMessageCount).toBe(initialMessageCount)
  })
})
