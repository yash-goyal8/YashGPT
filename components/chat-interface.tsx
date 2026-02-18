"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Send, ArrowLeft, Bot, User, Building2, Brain, Target, Users, Rocket, Code2, ChevronRight, Shuffle, FileText, Mail, Linkedin, Github, Book, HeartHandshake, Scale, TrendingUp } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"

// Animated background component
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-0 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute top-40 -right-40 w-96 h-96 bg-violet-500/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '0.5s' }} />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  )
}

// Question categories for the chat
const QUESTION_CATEGORIES = [
  {
    id: "personal-journey",
    label: "Personal Journey",
    icon: Book,
    color: "text-rose-400",
    bgColor: "bg-rose-500/10",
    questions: [
      "Tell me about Yash",
      "What is Yash currently doing professionally?",
      "What are Yash's Long term & short-term career goals?",
      "What motivates Yash professionally?",
      "What roles are Yash targeting?"
    ],
  },
  {
    id: "product-strategy",
    label: "Product Strategy & Sense",
    icon: Target,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    questions: [
      "How do Yash prioritize features or a product roadmap?",
      "Describe a time when Yash made a product decision with incomplete data",
      "How do Yash define and measure product success?",
      "Describe a product Yash took from 0 to 1",
      "How do Yash decide what not to build?"
    ],
  },
  {
    id: "leadership",
    label: "Leadership, Influnce & Stakeholders",
    icon: Users,
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    questions: [
      "Describe a time Yash influenced without authority",
      "How do Yash handle conflicts in a team or stakeholder?",
      "How do Yash manage up with senior leadership?",
      "How do Yash prioritize competing deadlines?",
    ],
  },
  {
    id: "technical-depth",
    label: "Technical Depth & AI Readiness",
    icon: Code2,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    questions: [
      "What technologies do Yash specialize in?",
      "Describe a complex technical problem you solved",
      "How do you approach AI-driven products as a PM?",
      "Tell me about your experience with AI/ML",
      "How do you balance technical debt with AI velocity?"
    ],
  },
  {
    id: "execution", //ready
    label: "Execution, Delivery & Ownership",
    icon: Rocket,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    questions: [
      "Describe a project Yash owned end-to-end",
      "Tell me about a time when Yash delivered under tight constraints",
      "Tell me about a time Yash had to pivot during execution",
      "How do Yash balance speed with long-term quality?",
    ],
  },
  {
    id: "empathy", //ready
    label: "Customer & Market Empathy ",
    icon: HeartHandshake,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    questions: [
      "Tell me about a time Yash deeply understood a user problem",
      "Describe a time customer feedback changed Yash's product direction",
      "How do Yash gather user insights?",
      "How do Yash balance customer needs with business constraints?",
    ],
  },
  {
    id: "adaptability", //ready
    label: "Adaptability, Ambiguity & Problem Solving",
    icon: Shuffle,
    color: "text-sky-400",
    bgColor: "bg-sky-500/10",
    questions: [
      "How do Yash handle ambiguity or incomplete information in projects?",
      "Tell me about a time when Yash learned something new quickly",
      "How do Yash approach problems he has never seen before?",
      "How do Yash make decisions when there’s no clear right answer",
    ],
  },
  {
    id: "judgement", //ready
    label: "Data, Metrics & Judgment",
    icon: Scale,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    questions: [
      "Describe a time Yash used data to make a decision",
      "How do Yash choose the right success metrics?",
      "Describe a time metrics or data contradicted Yash's intuition",
      "How do Yash decide when data is “good enough” to act?",
    ],
  },
  {
    id: "growth", //ready
    label: "Failure, Feedback & Growth ",
    icon: TrendingUp,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    questions: [
      "Tell me about a time when Yash failed",
      "Tell me about a time you took responsibility for a failure",
      "Describe critical feedback Yash has received and how he acted on it",
      "What’s the hardest lesson Yash has learned?",
    ],
  },
]

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
  const [showMenu, setShowMenu] = useState(true)

  const [visitorInfo, setVisitorInfo] = useState<VisitorInfo | null>(null)
  const [visitorForm, setVisitorForm] = useState({
    name: "",
    company: "",
  })
  const [formError, setFormError] = useState("")
  const [profileData, setProfileData] = useState<Record<string, string>>({})

  useEffect(() => {
    setSessionId(getSessionId())
    fetch("/api/profile").then(r => r.json()).then(d => setProfileData(d)).catch(() => { })
  }, [])

  const profileEmail = profileData.email || ""
  const profileLinkedin = profileData.linkedinUrl || ""
  const profileGithub = profileData.githubUrl || ""
  const profileResume = profileData.resumeUrl || ""

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion, visitorInfo, messages.length])

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
    setShowMenu(false) // Hide menu when sending a message
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
      if (data.debug) console.log("[v0] Chat debug error:", data.debug)
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
      <div className="flex flex-col h-full bg-[#0a0a0b] text-white">
        <AnimatedBackground />

        {/* Header */}
        <header className="relative z-10 px-4 py-4">
          <div className="max-w-6xl mx-auto">
            <div className="px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl bg-[#0a0a0b]/60 backdrop-blur-xl border border-white/10 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 lg:gap-3 group">
                <ArrowLeft className="h-4 w-4 lg:h-5 lg:w-5 text-[#a3a3a3] group-hover:text-white transition-colors" />
                <div>
                  <h1 className="font-semibold flex items-center gap-2 text-sm lg:text-base text-white">
                    <Bot className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-cyan-400" />
                    YashGPT
                  </h1>
                  <p className="text-[10px] lg:text-xs text-[#a3a3a3]">Your AI assistant</p>
                </div>
              </Link>

              {/* Quick Action Buttons */}
              <TooltipProvider delayDuration={100}>
                <div className="flex items-center gap-1 lg:gap-2">
                  {profileResume && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={profileResume}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 lg:p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#a3a3a3] hover:text-white transition-all"
                        >
                          <FileText className="h-4 w-4" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>View Resume</TooltipContent>
                    </Tooltip>
                  )}
                  {profileLinkedin && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={profileLinkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 lg:p-2.5 rounded-lg bg-white/5 hover:bg-[#0077B5]/20 text-[#a3a3a3] hover:text-[#0077B5] transition-all"
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>LinkedIn</TooltipContent>
                    </Tooltip>
                  )}
                  {profileEmail && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={`mailto:${profileEmail}`}
                          className="p-2 lg:p-2.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-[#a3a3a3] hover:text-emerald-400 transition-all"
                        >
                          <Mail className="h-4 w-4" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>Email</TooltipContent>
                    </Tooltip>
                  )}
                  {profileGithub && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={profileGithub}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 lg:p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#a3a3a3] hover:text-white transition-all"
                        >
                          <Github className="h-4 w-4" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>GitHub</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </TooltipProvider>
            </div>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4 relative z-10 overflow-auto">
          <div className="w-full max-w-md p-6 lg:p-8 rounded-xl lg:rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 my-4">
            <div className="text-center mb-6 lg:mb-8">
              <div className="h-12 w-12 lg:h-16 lg:w-16 rounded-xl lg:rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center mx-auto mb-3 lg:mb-4 border border-white/10">
                <Bot className="h-6 w-6 lg:h-8 lg:w-8 text-cyan-400" />
              </div>
              <h2 className="text-xl lg:text-2xl font-bold text-white">Welcome to YashGPT</h2>
              <p className="text-sm lg:text-base text-[#a3a3a3] mt-2">Before we start, I'd love to know who I'm speaking with.</p>
            </div>

            <form onSubmit={handleVisitorSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-[#a3a3a3]">
                  <User className="h-4 w-4" />
                  Your Name <span className="text-rose-400">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={visitorForm.name}
                  onChange={(e) => setVisitorForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white placeholder:text-[#a3a3a3]/50 focus:border-cyan-500/50 h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="flex items-center gap-2 text-[#a3a3a3]">
                  <Building2 className="h-4 w-4" />
                  Company <span className="text-rose-400">*</span>
                </Label>
                <Input
                  id="company"
                  placeholder="Acme Inc."
                  value={visitorForm.company}
                  onChange={(e) => setVisitorForm((prev) => ({ ...prev, company: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white placeholder:text-[#a3a3a3]/50 focus:border-cyan-500/50 h-12 rounded-xl"
                />
              </div>

              {formError && <p className="text-sm text-rose-400 text-center">{formError}</p>}

              <Button type="submit" className="w-full bg-white text-black hover:bg-white/90 font-medium h-12 rounded-xl" size="lg">
                Start Conversation
              </Button>

              <p className="text-xs text-[#a3a3a3] text-center">
                Your information helps personalize your experience and is kept private.
              </p>
            </form>
          </div>
        </div>
      </div>
    )
  }

  const showQuestionBank = (messages.length <= 1) || showMenu

  // Chat interface
  return (
    <div className="flex flex-col h-full bg-[#0a0a0b] text-white">
      <AnimatedBackground />

      {/* Header */}
      <header className="relative z-10 px-3 lg:px-4 py-3 lg:py-4 flex-shrink-0">
        <div className="max-w-5xl xl:max-w-6xl mx-auto">
          <div className="px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl bg-[#0a0a0b]/60 backdrop-blur-xl border border-white/10 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 lg:gap-3 group">
              <ArrowLeft className="h-4 w-4 lg:h-5 lg:w-5 text-[#a3a3a3] group-hover:text-white transition-colors" />
              <div>
                <h1 className="font-semibold flex items-center gap-2 text-sm lg:text-base text-white">
                  <Bot className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-cyan-400" />
                  YashGPT
                </h1>
                <p className="text-[10px] lg:text-xs text-[#a3a3a3]">
                  Chatting with {visitorInfo.name}
                  {visitorInfo.company && ` from ${visitorInfo.company}`}
                </p>
              </div>
            </Link>

            {/* Quick Action Buttons */}
            <TooltipProvider delayDuration={100}>
              <div className="flex items-center gap-1 lg:gap-2">
                {profileResume && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={profileResume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 lg:p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#a3a3a3] hover:text-white transition-all"
                      >
                        <FileText className="h-4 w-4" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>View Resume</TooltipContent>
                  </Tooltip>
                )}
                {profileLinkedin && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={profileLinkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 lg:p-2.5 rounded-lg bg-white/5 hover:bg-[#0077B5]/20 text-[#a3a3a3] hover:text-[#0077B5] transition-all"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>LinkedIn</TooltipContent>
                  </Tooltip>
                )}
                {profileEmail && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={`mailto:${profileEmail}`}
                        className="p-2 lg:p-2.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-[#a3a3a3] hover:text-emerald-400 transition-all"
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>Email</TooltipContent>
                  </Tooltip>
                )}
                {profileGithub && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={profileGithub}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 lg:p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#a3a3a3] hover:text-white transition-all"
                      >
                        <Github className="h-4 w-4" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>GitHub</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </TooltipProvider>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Messages */}
          {messages.length > 0 && (
            <div className="space-y-6 mb-8">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${message.role === "user"
                      ? "bg-white text-black"
                      : "bg-white/[0.03] border border-white/10 text-white"
                      }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.media && message.media.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.media.map((item) => (
                          <div key={item.id} className="rounded-xl overflow-hidden border border-white/10">
                            {item.type === "image" ? (
                              <a href={item.url} target="_blank" rel="noopener noreferrer">
                                <img
                                  src={item.url || "/placeholder.svg"}
                                  alt={item.title}
                                  className="w-full max-h-64 object-cover hover:opacity-90 transition-opacity"
                                />
                              </a>
                            ) : (
                              <video src={item.url} controls className="w-full max-h-64" poster={item.url} />
                            )}
                            <div className="p-2 bg-white/5">
                              <p className="text-xs font-medium">{item.title}</p>
                              {item.description && <p className="text-xs text-[#a3a3a3]">{item.description}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <span className={`text-xs mt-2 block ${message.role === "user" ? "opacity-50" : "text-[#a3a3a3]"}`}>
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0.2s" }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Show Menu Button */}
              {!showMenu && messages.length > 1 && !isLoading && (
                <div className="flex justify-center">
                  <Button
                    onClick={() => setShowMenu(true)}
                    className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl px-6 py-3 flex items-center gap-2"
                  >
                    <Brain className="h-4 w-4 text-cyan-400" />
                    Show Question Menu
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Question Bank - All categories visible with questions */}
          {showQuestionBank && !isLoading && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">What would you like to know?</h2>
                <p className="text-[#a3a3a3]">Click any question below or type your own</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {QUESTION_CATEGORIES.map((category) => (
                  <div
                    key={category.id}
                    className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden"
                  >
                    {/* Category Header */}
                    <div className="flex items-center gap-3 p-4 border-b border-white/5">
                      <div className={`p-2.5 rounded-lg ${category.bgColor} flex-shrink-0`}>
                        <category.icon className={`h-5 w-5 ${category.color}`} />
                      </div>
                      <span className="font-medium text-white text-sm">{category.label}</span>
                    </div>

                    {/* Questions */}
                    <div className="p-2">
                      {category.questions.map((question, qIndex) => (
                        <button
                          key={`${category.id}-${qIndex}`}
                          onClick={() => handleSendMessage(question)}
                          className="w-full text-left p-3 rounded-xl text-sm text-[#a3a3a3] hover:text-white hover:bg-white/[0.04] transition-all group flex items-start gap-2"
                        >
                          <ChevronRight className={`h-4 w-4 mt-0.5 flex-shrink-0 ${category.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                          <span className="line-clamp-2">{question}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area - Fixed at bottom */}
      <div className="relative z-10 border-t border-white/5 bg-[#0a0a0b]/80 backdrop-blur-xl flex-shrink-0">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="flex gap-3"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Yash's experience, skills, achievements..."
              className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-[#a3a3a3]/50 focus:border-cyan-500/50 h-12 rounded-xl"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-white text-black hover:bg-white/90 h-12 px-6 rounded-xl"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
