import { Suspense } from "react"
import { ChatInterface } from "@/components/chat-interface"

function ChatLoader() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-background">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-primary/20" />
        <div className="h-4 w-32 bg-muted rounded" />
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <main className="h-screen flex flex-col">
      <Suspense fallback={<ChatLoader />}>
        <ChatInterface />
      </Suspense>
    </main>
  )
}
