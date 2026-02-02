import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  FileText, 
  MessageSquare, 
  Sparkles, 
  Code, 
  Users, 
  Brain, 
  Target,
  ExternalLink,
  ChevronRight
} from "lucide-react"

// Placeholder data - you'll replace these
const PLACEHOLDER_BIO = {
  name: "Yash Goyal",
  title: "Product & Tech Leader",
  tagline: "Building products that matter",
  paragraphs: [
    "I'm a product and technology leader with experience spanning startups to enterprise. My work lies at the intersection of business strategy and technical execution, creating products that solve real problems and drive measurable impact.",
    "Currently focused on [Your Current Role/Focus]. Previously, I've led teams at [Previous Companies], shipping products used by millions. I hold an MBA from [University] and a technical background in [Your Tech Background].",
    "When I'm not building products, you'll find me [Personal Interest 1], [Personal Interest 2], or exploring the latest in AI and emerging technologies."
  ]
}

const PLACEHOLDER_STATS = [
  { label: "Years Experience", value: "X+" },
  { label: "Products Shipped", value: "XX" },
  { label: "Teams Led", value: "X-XX" },
  { label: "Industries", value: "X" },
]

const PLACEHOLDER_PROJECTS = [
  {
    title: "Project Alpha",
    description: "Brief description of the project and its impact. What problem did it solve?",
    tech: ["React", "Node.js", "AWS"],
    image: null,
    chatPrompt: "Tell me about Project Alpha"
  },
  {
    title: "Project Beta",
    description: "Another significant project showcasing your skills and leadership.",
    tech: ["Python", "ML", "GCP"],
    image: null,
    chatPrompt: "What was Project Beta about?"
  },
  {
    title: "Project Gamma",
    description: "A third project that demonstrates different capabilities or domain expertise.",
    tech: ["Product Strategy", "User Research", "Agile"],
    image: null,
    chatPrompt: "Tell me about Project Gamma"
  },
]

// Question categories with clickable questions
const QUESTION_CATEGORIES = [
  {
    id: "intro",
    label: "Getting Started",
    icon: Sparkles,
    color: "text-emerald-500",
    questions: [
      "Tell me about yourself",
      "What are your key strengths?",
      "What makes you unique as a candidate?",
    ]
  },
  {
    id: "technical",
    label: "Technical",
    icon: Code,
    color: "text-blue-500",
    questions: [
      "What technologies do you specialize in?",
      "Describe your system design approach",
      "Tell me about a complex technical challenge",
    ]
  },
  {
    id: "leadership",
    label: "Leadership",
    icon: Users,
    color: "text-amber-500",
    questions: [
      "What's your leadership style?",
      "How do you handle team conflicts?",
      "Tell me about a team you built",
    ]
  },
  {
    id: "behavioral",
    label: "Behavioral",
    icon: Brain,
    color: "text-rose-500",
    questions: [
      "Tell me about a time you failed",
      "How do you handle pressure?",
      "Describe a difficult decision you made",
    ]
  },
  {
    id: "career",
    label: "Career Goals",
    icon: Target,
    color: "text-cyan-500",
    questions: [
      "What motivates you?",
      "Where do you see yourself in 5 years?",
      "Why are you looking for new opportunities?",
    ]
  },
]

export default function MockupPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section - Introduction */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-16 md:py-24 max-w-5xl">
          <div className="grid md:grid-cols-[1fr,2fr] gap-12 items-start">
            {/* Left Column - Name & Quick Links */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  {PLACEHOLDER_BIO.name}
                </h1>
                <p className="text-lg text-primary mt-1 font-medium">
                  {PLACEHOLDER_BIO.title}
                </p>
                <p className="text-muted-foreground mt-2">
                  {PLACEHOLDER_BIO.tagline}
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col gap-3">
                <Button asChild className="justify-start">
                  <Link href="/chat">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Start Chatting
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <FileText className="h-4 w-4 mr-2" />
                    View Resume
                    <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
                  </a>
                </Button>
              </div>

              {/* Social Links Placeholder */}
              <div className="flex gap-4 text-muted-foreground">
                <span className="text-sm">[LinkedIn]</span>
                <span className="text-sm">[GitHub]</span>
                <span className="text-sm">[Twitter]</span>
              </div>
            </div>

            {/* Right Column - Bio */}
            <div className="space-y-4">
              {PLACEHOLDER_BIO.paragraphs.map((para, i) => (
                <p key={i} className="text-foreground/90 leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {PLACEHOLDER_STATS.map((stat, i) => (
              <div key={i} className="text-center md:text-left">
                <div className="text-2xl md:text-3xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-16 max-w-5xl">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-8">
            Selected Work
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {PLACEHOLDER_PROJECTS.map((project, i) => (
              <Card key={i} className="group overflow-hidden hover:border-primary/50 transition-colors">
                {/* Project Image Placeholder */}
                <div className="aspect-video bg-muted flex items-center justify-center text-muted-foreground text-sm">
                  [Project Image]
                </div>
                
                <div className="p-5 space-y-3">
                  <h3 className="font-semibold text-lg">{project.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                  
                  {/* Tech Tags */}
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((t, j) => (
                      <span 
                        key={j} 
                        className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Ask About This */}
                  <Link 
                    href={`/chat?q=${encodeURIComponent(project.chatPrompt)}`}
                    className="inline-flex items-center text-sm text-primary hover:underline pt-2"
                  >
                    Ask about this
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Question Menu Section */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-16 max-w-5xl">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Ask Me Anything
          </h2>
          <p className="text-muted-foreground mb-8">
            Click any question below to start a conversation - no typing required.
          </p>

          <div className="space-y-8">
            {QUESTION_CATEGORIES.map((category) => {
              const Icon = category.icon
              return (
                <div key={category.id}>
                  {/* Category Header */}
                  <div className="flex items-center gap-2 mb-4">
                    <Icon className={`h-5 w-5 ${category.color}`} />
                    <h3 className="font-medium">{category.label}</h3>
                  </div>
                  
                  {/* Question Pills */}
                  <div className="flex flex-wrap gap-2">
                    {category.questions.map((question, i) => (
                      <Link
                        key={i}
                        href={`/chat?q=${encodeURIComponent(question)}`}
                        className="px-4 py-2 rounded-full border border-border bg-card hover:bg-accent hover:border-primary/50 transition-colors text-sm"
                      >
                        {question}
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-muted/30">
        <div className="container mx-auto px-4 py-16 max-w-5xl text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Ready to learn more?
          </h2>
          <p className="text-muted-foreground mb-6">
            Have a specific question? Start a conversation.
          </p>
          <Button asChild size="lg">
            <Link href="/chat">
              <MessageSquare className="h-5 w-5 mr-2" />
              Start Chatting
            </Link>
          </Button>
        </div>
      </section>

      {/* Mockup Notice */}
      <div className="fixed bottom-4 right-4 bg-amber-500/90 text-amber-950 px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
        MOCKUP - For Review Only
      </div>
    </main>
  )
}
