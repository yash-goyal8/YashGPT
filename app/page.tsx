import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MessageSquare, Sparkles } from "lucide-react"

const exampleQuestions = [
  "What are Yash's greatest strengths?",
  "Tell me about a time Yash resolved a conflict",
  "What's Yash's most significant achievement?",
  "Show Yash's projects that he has built",
  "What makes Yash unique as a candidate?",
  "What are his hard skills and soft skills?",
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          {/* Hero Section */}
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              <span>AI-Powered Career Assistant</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
              Hey there! Want to know more about Yash?
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground text-balance max-w-2xl mx-auto">
              I'm Yash's AI assistant. Ask me anything about his career journey, achievements, and what makes him an
              exceptional candidate.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" className="text-lg">
                <Link href="/chat">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Start Chatting
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg bg-transparent">
                <Link href="/admin">Admin Dashboard</Link>
              </Button>
            </div>
          </div>

          {/* Example Questions */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center">Try asking questions like:</h2>

            <div className="grid gap-4 md:grid-cols-2">
              {exampleQuestions.map((question, index) => (
                <Link href={`/chat?q=${encodeURIComponent(question)}`} key={index}>
                  <Card className="p-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer border-2 hover:border-primary/50">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <p className="text-base font-medium text-foreground">{question}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-16 text-center">
            <p className="text-sm text-muted-foreground">
              This chatbot uses AI to share Yash's career stories and experiences.
              <br />
              Responses are based on real experiences and achievements.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
