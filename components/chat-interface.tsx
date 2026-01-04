"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Send, ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function ChatInterface() {
  const searchParams = useSearchParams()
  const initialQuestion = searchParams.get("q")

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (initialQuestion && messages.length === 0) {
      handleSendMessage(initialQuestion)
    }
  }, [initialQuestion])

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

    // TODO: Call API endpoint when backend is ready
    // For now, show a placeholder response
    setTimeout(() => {
      const assistantMessage: Message = {
        role: "assistant",
        content:
          "I'm ready to answer your questions about Yash! However, the story bank hasn't been uploaded yet. Please visit the Admin Dashboard to upload Yash's career stories first.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-3xl px-4 py-6 space-y-6">
          {messages.length === 0 && (
            <Card className="p-8 text-center border-dashed">
              <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Start a Conversation</h2>
              <p className="text-muted-foreground">Ask me anything about Yash's career, skills, and achievements!</p>
            </Card>
          )}

          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <Card
                className={`max-w-[80%] p-4 ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs opacity-70 mt-2 block">{message.timestamp.toLocaleTimeString()}</span>
              </Card>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <Card className="max-w-[80%] p-4 bg-muted">
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-100" />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce delay-200" />
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
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
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Messages are not stored. Your conversation is private.
          </p>
        </div>
      </div>
    </div>
  )
}
