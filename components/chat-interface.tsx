"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Send, ArrowLeft, Sparkles, User, Building2, Play } from "lucide-react"
import Link from "next/link"

interface MediaItem {
  id: string
  url: string
  type: "image" | "video"
  title: string
  description: string
}

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
  media?: MediaItem[]
}

interface VisitorInfo {
  name: string
  company: string
}

// Question bank organized by category
const QUESTION_BANK = {
  initial: [
    "Tell me about yourself",
    "What are your key strengths?",
    "Walk me through your most impactful project",
    "Why are you looking for new opportunities?",
  ],
  technical: [
    "What technologies do you specialize in?",
    "Describe a complex technical problem you solved",
    "How do you approach system design?",
    "Tell me about your experience with AI/ML",
  ],
  leadership: [
    "Describe your leadership style",
    "How do you handle conflicts in a team?",
    "Tell me about a time you mentored someone",
    "How do you prioritize competing deadlines?",
  ],
  behavioral: [
    "Tell me about a time you failed and what you learned",
    "How do you handle pressure and tight deadlines?",
    "Describe a situation where you went above and beyond",
    "How do you stay updated with industry trends?",
  ],
  career: [
    "What motivates you professionally?",
    "Where do you see yourself in 5 years?",
    "Why MBA after your technical background?",
    "What kind of role are you looking for?",
  ],
}

// Get suggested questions based on conversation context
function getSuggestedQuestions(messages: Message[]): string[] {
  const messageCount = messages.filter(m => m.role === "user").length
  const lastUserMessage = [...messages].reverse().find(m => m.role === "user")?.content.toLowerCase() || ""
  const lastAssistantMessage = [...messages].reverse().find(m => m.role === "assistant")?.content.toLowerCase() || ""
  
  // Initial state - show intro questions
  if (messageCount === 0) {
    return QUESTION_BANK.initial
  }
  
  // Analyze context and suggest relevant follow-ups
  const allText = lastUserMessage + " " + lastAssistantMessage
  
  if (allText.includes("technical") || allText.includes("code") || allText.includes("project") || allText.includes("technology")) {
    return QUESTION_BANK.technical
  }
  
  if (allText.includes("team") || allText.includes("lead") || allText.includes("manage") || allText.includes("mentor")) {
    return QUESTION_BANK.leadership
  }
  
  if (allText.includes("challenge") || allText.includes("difficult") || allText.includes("problem") || allText.includes("conflict")) {
    return QUESTION_BANK.behavioral
  }
  
  if (allText.includes("career") || allText.includes("goal") || allText.includes("future") || allText.includes("mba")) {
    return QUESTION_BANK.career
  }
  
  // Rotate through categories based on message count
  const categories = Object.keys(QUESTION_BANK) as (keyof typeof QUESTION_BANK)[]
  const categoryIndex = messageCount % categories.length
  return QUESTION_BANK[categories[categoryIndex]]
}

// Generate persistent session ID
function getSessionId(): string {
  if (typeof window === "undefined") return ""
  let sessionId = sessionStorage.getItem("chat_session_id")
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    sessionStorage.setItem("chat_session_id", sessionId)
  }
  return sessionId
}

export function ChatInterface() {
  const searchParams = useSearchParams()
  const initialQuestion = searchParams.get("q")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState("")

  const [visitorInfo, setVisitorInfo] = useState<VisitorInfo | null>(null)
  const [visitorForm, setVisitorForm] = useState({
    name: "",
    company: "",
  })
  const [formError, setFormError] = useState("")

  useEffect(() => {
    setSessionId(getSessionId())
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleVisitorSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    if (!visitorForm.name.trim()) {
      setFormError("Please enter your name")
      return
    }

    if (!visitorForm.company.trim()) {
      setFormError("Please enter your company name")
      return
    }

    setVisitorInfo({
      name: visitorForm.name.trim(),
      company: visitorForm.company.trim(),
    })

    const welcomeMessage: Message = {
      role: "assistant",
      content: `Hi ${visitorForm.name.trim()}! Great to meet you. I'm here to tell you all about Yash's professional journey, skills, and achievements. Feel free to ask me anything about his experience, projects, or career highlights!`,
      timestamp: new Date(),
    }
    setMessages([welcomeMessage])
  }

  useEffect(() => {
    if (initialQuestion && visitorInfo && messages.length === 1) {
      handleSendMessage(initialQuestion)
    }
  }, [initialQuestion, visitorInfo])

  const handleSendMessage = async (question?: string) => {
    const messageText = question || input
    if (!messageText.trim() || isLoading) return

    const userMessage: Message = {
      role: "user",
      content: messageText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: messageText,
          visitorName: visitorInfo?.name,
          visitorCompany: visitorInfo?.company,
          sessionId,
        }),
      })

      const data = await response.json()

const assistantMessage: Message = {
  role: "assistant",
  content: data.response || data.error || "I couldn't process that question. Please try again.",
  timestamp: new Date(),
  media: data.media,
  }
  setMessages((prev) => [...prev, assistantMessage])
    } catch {
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Visitor info form
  if (!visitorInfo) {
    return (
      <div className="flex flex-col h-full bg-background">
        <header className="border-b bg-card px-4 py-3">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Yash's Career Assistant
                </h1>
                <p className="text-xs text-muted-foreground">Ask me anything about Yash</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Welcome!</h2>
              <p className="text-muted-foreground mt-2">Before we start, I'd love to know who I'm speaking with.</p>
            </div>

            <form onSubmit={handleVisitorSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Your Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={visitorForm.name}
                  onChange={(e) => setVisitorForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Company <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="company"
                  placeholder="Acme Inc."
                  value={visitorForm.company}
                  onChange={(e) => setVisitorForm((prev) => ({ ...prev, company: e.target.value }))}
                />
              </div>

              {formError && <p className="text-sm text-destructive text-center">{formError}</p>}

              <Button type="submit" className="w-full" size="lg">
                Start Conversation
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Your information helps personalize your experience and is kept private.
              </p>
            </form>
          </Card>
        </div>
      </div>
    )
  }

  // Chat interface
  return (
    <div className="flex flex-col h-full bg-background">
      <header className="border-b bg-card px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Yash's Career Assistant
              </h1>
              <p className="text-xs text-muted-foreground">
                Chatting with {visitorInfo.name}
                {visitorInfo.company && ` from ${visitorInfo.company}`}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-3xl px-4 py-6 space-y-6">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <Card
                className={`max-w-[80%] p-4 ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
<p className="text-sm whitespace-pre-wrap">{message.content}</p>
  {message.media && message.media.length > 0 && (
    <div className="mt-3 space-y-2">
      {message.media.map((item) => (
        <div key={item.id} className="rounded-lg overflow-hidden border">
          {item.type === "image" ? (
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              <img
                src={item.url || "/placeholder.svg"}
                alt={item.title}
                className="w-full max-h-64 object-cover hover:opacity-90 transition-opacity"
              />
            </a>
          ) : (
            <div className="relative">
              <video
                src={item.url}
                controls
                className="w-full max-h-64"
                poster={item.url}
              />
            </div>
          )}
          <div className="p-2 bg-background/80">
            <p className="text-xs font-medium">{item.title}</p>
            {item.description && (
              <p className="text-xs text-muted-foreground">{item.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )}
  <span className="text-xs opacity-70 mt-2 block">{message.timestamp.toLocaleTimeString()}</span>
  </Card>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <Card className="max-w-[80%] p-4 bg-muted">
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                  <div
                    className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t bg-card">
        <div className="container mx-auto max-w-3xl px-4 py-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Yash's experience, skills, achievements..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
