"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { 
  FileText, 
  Mail, 
  Linkedin, 
  Github, 
  ExternalLink,
  Briefcase,
  GraduationCap,
  Code2,
  FolderKanban,
  Lightbulb,
  Zap,
  Info,
  Bot,
  ArrowUpRight,
  Phone,
  ChevronRight,
  Award,
  Sparkles,
  MessageSquare,
  Lock,
  X,
  ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { MatrixBackground } from "@/components/matrix-background"

// Types for card data
interface ExperienceCard {
  slug: string
  period: string
  role: string
  company: string
  description: string
  skills: string[]
}

interface EducationCard {
  slug: string
  period: string
  degree: string
  school: string
  focus: string
}

interface ProjectCard {
  slug: string
  title: string
  description: string
  tech: string[]
  image: string | null
}

interface CaseStudyCard {
  slug: string
  title: string
  problem: string
  solution: string
  impact: string
}

interface CertificationCard {
  slug: string
  title: string
  issuer: string
  date: string
  credentialId: string
}

interface ImpactCard {
  slug: string
  value: string
  prefix: string
  suffix: string
  decimals: string
  label: string
  type: "counter" | "text"
}

interface CardsData {
  experience: ExperienceCard[]
  education: EducationCard[]
  project: ProjectCard[]
  "case-study": CaseStudyCard[]
  certification: CertificationCard[]
  skills: Record<string, string[]>
  impact: ImpactCard[]
}

// Animated background grid component
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient orbs */}
      <div className="absolute top-0 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute top-40 -right-40 w-96 h-96 bg-violet-500/15 rounded-full blur-[120px] animate-pulse delay-1000" />
      <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px] animate-pulse delay-500" />
      
      {/* Animated grid */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* Floating particles */}
      <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white/40 rounded-full animate-float" />
      <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-cyan-400/40 rounded-full animate-float-delayed" />
      <div className="absolute top-2/3 left-1/2 w-1 h-1 bg-violet-400/40 rounded-full animate-float" />
      <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-white/20 rounded-full animate-float-slow" />
      <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-emerald-400/40 rounded-full animate-float-delayed" />
    </div>
  )
}

// Placeholder data - to be replaced with real content
const IMPACT: ImpactCard[] = [
  { slug: "cloud-infra-deals", value: "1.4", prefix: "$", suffix: "B+", decimals: "1", label: "Cloud Infra Deals Handled", type: "counter" },
  { slug: "growth-achieved", value: "133", prefix: "", suffix: "%", decimals: "0", label: "Growth Achieved", type: "counter" },
  { slug: "founder", value: "Founder", prefix: "", suffix: "", decimals: "0", label: "Entrepreneur \u00b7 Built & Sold Startup", type: "text" },
  { slug: "serial-negotiator", value: "Serial", prefix: "", suffix: "", decimals: "0", label: "Negotiator \u00b7 Enterprise Deals", type: "text" },
  { slug: "products-launched", value: "5", prefix: "", suffix: "+", decimals: "0", label: "Products Launched to Market", type: "counter" },
]

const EXPERIENCE = [
  {
    slug: "senior-pm-tech-company",
    period: "2022 - Present",
    role: "Senior Product Manager",
    company: "Tech Company",
    description: "Leading product strategy for enterprise solutions, driving 40% revenue growth through data-driven decisions.",
    skills: ["Product Strategy", "Data Analytics", "Cross-functional Leadership"]
  },
  {
    slug: "pm-startup-inc",
    period: "2020 - 2022",
    role: "Product Manager",
    company: "Startup Inc",
    description: "Built and launched 3 products from 0 to 1, managing a team of 8 engineers and designers.",
    skills: ["Agile", "User Research", "Go-to-Market"]
  },
  {
    slug: "software-engineer-enterprise",
    period: "2018 - 2020",
    role: "Software Engineer",
    company: "Enterprise Corp",
    description: "Full-stack development for customer-facing applications serving 2M+ users.",
    skills: ["React", "Node.js", "AWS", "System Design"]
  },
]

const EDUCATION = [
  {
    slug: "mba-business-school",
    period: "2023 - 2025",
    degree: "MBA",
    school: "Business School",
    focus: "Technology & Strategy"
  },
  {
    slug: "btech-computer-science",
    period: "2014 - 2018",
    degree: "B.Tech Computer Science",
    school: "University",
    focus: "Software Engineering"
  },
]

const SKILLS = {
  "Product": ["Strategy", "Roadmapping", "Analytics", "User Research", "A/B Testing"],
  "Technical": ["Python", "JavaScript", "React", "SQL", "AWS", "System Design"],
  "Leadership": ["Team Building", "Stakeholder Management", "Mentoring", "Agile"],
}

const PROJECTS = [
  {
    slug: "ai-analytics-platform",
    title: "AI-Powered Analytics Platform",
    description: "Built a real-time analytics dashboard with predictive insights, reducing decision time by 60%.",
    tech: ["Python", "React", "TensorFlow", "AWS"],
    image: null
  },
  {
    slug: "ecommerce-personalization",
    title: "E-commerce Personalization Engine",
    description: "Developed recommendation system increasing conversion by 25% through personalized experiences.",
    tech: ["ML", "Node.js", "Redis", "PostgreSQL"],
    image: null
  },
  {
    slug: "developer-platform",
    title: "Developer Platform",
    description: "Led the creation of internal developer tools used by 500+ engineers daily.",
    tech: ["TypeScript", "GraphQL", "Kubernetes"],
    image: null
  },
]

const CASE_STUDIES = [
  {
    slug: "scaling-b2b-saas",
    title: "Scaling a B2B SaaS Product",
    problem: "Low enterprise adoption despite strong SMB traction",
    solution: "Redesigned onboarding, added SSO, built admin dashboard",
    impact: "3x enterprise deals in 6 months"
  },
  {
    slug: "reducing-customer-churn",
    title: "Reducing Customer Churn",
    problem: "15% monthly churn in first 90 days",
    solution: "Implemented proactive health scoring and intervention triggers",
    impact: "Reduced churn to 5%, saved $2M ARR"
  },
]

const CERTIFICATIONS = [
  {
    slug: "aws-solutions-architect",
    title: "AWS Solutions Architect",
    issuer: "Amazon Web Services",
    date: "2023",
    credentialId: "AWS-SAA-123456"
  },
  {
    slug: "product-management-certificate",
    title: "Product Management Certificate",
    issuer: "Product School",
    date: "2022",
    credentialId: "PS-PM-789012"
  },
  {
    slug: "google-analytics",
    title: "Google Analytics Certified",
    issuer: "Google",
    date: "2021",
    credentialId: "GA-345678"
  },
  {
    slug: "scrum-master",
    title: "Scrum Master Certified",
    issuer: "Scrum Alliance",
    date: "2020",
    credentialId: "CSM-901234"
  },
]

// Typing animation for chat preview
function TypingDots() {
  return (
    <span className="inline-flex gap-0.5 ml-1">
      <span className="w-1 h-1 rounded-full bg-cyan-400 animate-[bounce_1.4s_infinite_0ms]" />
      <span className="w-1 h-1 rounded-full bg-cyan-400 animate-[bounce_1.4s_infinite_200ms]" />
      <span className="w-1 h-1 rounded-full bg-cyan-400 animate-[bounce_1.4s_infinite_400ms]" />
    </span>
  )
}

// Chat preview teaser - placed in hero section
function ChatPreviewTeaser() {
  const [phase, setPhase] = useState(0) // 0=typing-q, 1=show-q, 2=typing-a, 3=show-a, then repeat
  const [pairIndex, setPairIndex] = useState(0)
  
  const pairs = [
    { q: "What makes Yash stand out?", a: "Managed a $1.4B+ cloud portfolio, founded & sold a startup, and drove 133% growth." },
    { q: "Tell me about his PM skills", a: "Led cross-functional teams, defined product strategy for enterprise SaaS, drove 3x user adoption." },
    { q: "Why should we hire Yash?", a: "Rare blend of technical depth + business acumen. He builds products AND scales them." },
  ]
  
  useEffect(() => {
    const timings = [1500, 1800, 1200, 3000] // typing-q, show-q, typing-a, show-a (reading time)
    const timeout = setTimeout(() => {
      setPhase(prev => {
        if (prev === 3) {
          setPairIndex(p => (p + 1) % pairs.length)
          return 0
        }
        return prev + 1
      })
    }, timings[phase])
    return () => clearTimeout(timeout)
  }, [phase, pairs.length])
  
  const currentPair = pairs[pairIndex]
  
  return (
    <Link href="/chat" className="block group">
      <div className="relative mt-8 sm:mt-10 max-w-lg">
        {/* Outer glow */}
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-cyan-500/20 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
        
        {/* Chat Window */}
        <div className="relative rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm overflow-hidden group-hover:border-cyan-500/20 transition-all duration-500">
          {/* Chat header */}
          <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-2.5 bg-white/[0.02]">
            <div className="relative">
              <Bot className="h-4 w-4 text-cyan-400" />
              <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 ring-2 ring-[#0a0a0b]" />
            </div>
            <div className="flex-1">
              <span className="text-xs text-white font-medium">YashGPT</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-cyan-400/60" />
              <span className="text-[9px] text-cyan-400/80 font-medium uppercase tracking-wider">AI</span>
            </div>
          </div>
          
          {/* Chat messages */}
          <div className="p-4 space-y-3 min-h-[110px]">
            {/* User message */}
            <div className={`flex justify-end transition-all duration-500 ${phase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
              <div className="px-3 py-2 rounded-2xl rounded-br-md bg-white/10 max-w-[75%]">
                {phase === 0 ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-white/60">typing</span>
                    <TypingDots />
                  </div>
                ) : (
                  <p className="text-xs text-white leading-relaxed">{currentPair.q}</p>
                )}
              </div>
            </div>
            
            {/* AI response */}
            <div className={`flex justify-start transition-all duration-500 ${phase >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
              <div className="flex gap-2 max-w-[85%]">
                <div className="mt-1 shrink-0 w-5 h-5 rounded-full bg-cyan-500/10 flex items-center justify-center">
                  <Bot className="h-3 w-3 text-cyan-400" />
                </div>
                <div className="px-3 py-2 rounded-2xl rounded-bl-md bg-cyan-500/5 border border-cyan-500/10">
                  {phase === 2 ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-[#a3a3a3]">Thinking</span>
                      <TypingDots />
                    </div>
                  ) : phase >= 3 ? (
                    <p className="text-xs text-[#e5e5e5] leading-relaxed">{currentPair.a}</p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          
          {/* CTA bar */}
          <div className="px-4 py-2.5 border-t border-white/5 bg-gradient-to-r from-cyan-500/[0.03] to-transparent flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-3.5 w-3.5 text-[#a3a3a3]" />
              <span className="text-xs text-[#a3a3a3] group-hover:text-white transition-colors">Ask me anything about Yash...</span>
            </div>
            <div className="flex items-center gap-1 text-cyan-400">
              <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">Try it</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

// Scroll-triggered curiosity prompt
function CuriosityPrompt() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      if (isDismissed) return
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      setIsVisible(scrollPercent > 55)
    }
    
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isDismissed])
  
  if (isDismissed) return null
  
  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ${
      isVisible 
        ? "translate-y-0 opacity-100" 
        : "translate-y-8 opacity-0 pointer-events-none"
    }`}>
      <div className="relative max-w-xs">
        {/* Dismiss button */}
        <button 
          onClick={() => setIsDismissed(true)}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors z-10"
          aria-label="Dismiss"
        >
          <X className="h-3 w-3 text-[#a3a3a3]" />
        </button>
        
        <Link href="/chat" className="block group">
          <div className="p-4 rounded-2xl bg-[#0a0a0b]/90 backdrop-blur-xl border border-white/10 hover:border-cyan-500/30 shadow-2xl shadow-black/50 transition-all duration-300">
            {/* Top secret badge */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 animate-pulse">
                <Lock className="h-2.5 w-2.5 text-amber-400" />
                <span className="text-[9px] text-amber-400 font-bold uppercase tracking-widest">Classified</span>
              </div>
            </div>
            
            {/* Message */}
            <p className="text-sm font-medium text-white mb-1 leading-snug">
              Psst... YashGPT has intel
            </p>
            <p className="text-xs text-[#a3a3a3] mb-3 leading-relaxed">
              Things not on this page. The real stories behind the numbers. Care to ask?
            </p>
            
            {/* CTA */}
            <div className="flex items-center gap-2 text-cyan-400">
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold group-hover:underline">Unlock the conversation</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}

// Section heading component
function SectionHeading({ icon: Icon, title, accentColor = "cyan" }: { icon: React.ElementType; title: string; accentColor?: "cyan" | "amber" | "emerald" | "violet" | "rose" }) {
  const colorMap = {
    cyan: { bg: "bg-cyan-500/10", border: "border-cyan-500/20", icon: "text-cyan-400", line: "from-cyan-500/40" },
    amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", icon: "text-amber-400", line: "from-amber-500/40" },
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: "text-emerald-400", line: "from-emerald-500/40" },
    violet: { bg: "bg-violet-500/10", border: "border-violet-500/20", icon: "text-violet-400", line: "from-violet-500/40" },
    rose: { bg: "bg-rose-500/10", border: "border-rose-500/20", icon: "text-rose-400", line: "from-rose-500/40" },
  }
  const c = colorMap[accentColor]
  return (
    <div className="mb-8 sm:mb-10 lg:mb-12">
      <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
        <div className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl ${c.bg} border ${c.border}`}>
          <Icon className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ${c.icon}`} />
        </div>
        <h2 className="text-lg sm:text-xl lg:text-2xl 2xl:text-3xl font-bold text-white tracking-tight">{title}</h2>
      </div>
      <div className={`ml-[52px] sm:ml-[60px] h-px bg-gradient-to-r ${c.line} via-white/10 to-transparent`} />
    </div>
  )
}

// Animated counter component
function AnimatedCounter({ 
  target, 
  prefix = "", 
  suffix = "", 
  duration = 2000, 
  decimals = 0 
}: { 
  target: number; 
  prefix?: string; 
  suffix?: string; 
  duration?: number; 
  decimals?: number;
}) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [hasStarted])
  
  useEffect(() => {
    if (!hasStarted) return
    
    const startTime = performance.now()
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic for a satisfying deceleration
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(eased * target)
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [hasStarted, target, duration])
  
  return (
    <span ref={ref}>
      {prefix}{decimals > 0 ? count.toFixed(decimals) : Math.floor(count)}{suffix}
    </span>
  )
}

// Section reveal animation component
function RevealOnScroll({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [delay])
  
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out h-full ${
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  )
}

// Hook for tracking active section and scroll progress
function useScrollSpy(sectionIds: string[]) {
  const [activeSection, setActiveSection] = useState(sectionIds[0])
  const [scrollProgress, setScrollProgress] = useState(0)
  
  useEffect(() => {
    const handleScroll = () => {
      // Scroll progress
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0)
      
      // Active section detection
      const scrollPosition = scrollTop + 120
      
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const section = document.getElementById(sectionIds[i])
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sectionIds[i])
          break
        }
      }
    }
    
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [sectionIds])
  
  return { activeSection, scrollProgress }
}

const NAV_SECTIONS = ["about", "experience", "education", "projects", "case-studies", "skills", "contact"]

export default function PortfolioDesign() {
  const [cards, setCards] = useState<CardsData | null>(null)
  const [profile, setProfile] = useState<Record<string, string>>({})
  const { activeSection, scrollProgress } = useScrollSpy(NAV_SECTIONS)
  
  useEffect(() => {
    fetch("/api/cards")
      .then(res => res.json())
      .then(data => setCards(data))
      .catch(() => setCards(null))
    fetch("/api/profile")
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(() => setProfile({}))
  }, [])
  
  // Use fetched data or fallback to defaults
  const impactData = cards?.impact || IMPACT
  const experienceData = cards?.experience || EXPERIENCE
  const educationData = cards?.education || EDUCATION
  const projectsData = cards?.project || PROJECTS
  const caseStudiesData = cards?.["case-study"] || CASE_STUDIES
  const certificationsData = cards?.certification || CERTIFICATIONS
  const skillsData = cards?.skills || SKILLS

  // Profile data
  const pName = profile.name || "Yash Goyal"
  const pTitle = profile.title || "Product & Technology Leader"
  const pTagline = profile.tagline || "Available for opportunities"
  const pBio = profile.bio || "Building products that matter. I combine deep technical expertise with strategic product thinking to create impactful solutions at scale."
  const pEmail = profile.email || "yash@example.com"
  const pPhone = profile.phone || "+1234567890"
  const pLinkedin = profile.linkedinUrl || "https://linkedin.com/in/yashgoyal"
  const pGithub = profile.githubUrl || "https://github.com/yashgoyal"
  const pResume = profile.resumeUrl || "#resume"
  const pPhoto = profile.profilePhotoUrl || ""
  const pFooter = profile.footerText || "2025 Yash Goyal"
  
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e5e5e5] relative overflow-hidden">
      {/* Interactive Matrix Background */}
      <MatrixBackground />
      
      {/* Subtle ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[150px]" />
      </div>
      
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-transparent">
        <div 
          className="h-full bg-gradient-to-r from-cyan-400 via-violet-400 to-cyan-400 transition-all duration-150 ease-out shadow-[0_0_10px_rgba(6,182,212,0.5)]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40">
        <div className="mx-2 sm:mx-3 lg:mx-4 2xl:mx-8 mt-2 sm:mt-3 lg:mt-4">
          <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl lg:rounded-2xl bg-[#0a0a0b]/60 backdrop-blur-xl border border-white/10 flex items-center justify-between">
            <a href="#about" className="font-semibold text-base lg:text-lg text-white hover:text-cyan-400 transition-colors">
              YG
            </a>
            <div className="hidden md:flex items-center gap-0.5 lg:gap-1 text-xs lg:text-sm relative">
              {[
                { id: "about", label: "About" },
                { id: "experience", label: "Experience" },
                { id: "education", label: "Education" },
                { id: "projects", label: "Projects" },
                { id: "case-studies", label: "Case Studies" },
                { id: "skills", label: "Skills" },
                { id: "contact", label: "Contact" },
              ].map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`relative px-2 lg:px-3 xl:px-4 py-1.5 lg:py-2 rounded-lg whitespace-nowrap transition-all duration-300 group
                    ${activeSection === item.id
                      ? "text-white"
                      : "text-[#a3a3a3] hover:text-white"
                    }`}
                >
                  {/* Active indicator pill */}
                  {activeSection === item.id && (
                    <span className="absolute inset-0 rounded-lg bg-white/10 animate-nav-pill" />
                  )}
                  {/* Hover glow effect */}
                  <span className="absolute inset-0 rounded-lg bg-white/0 group-hover:bg-white/5 transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.08)] group-hover:scale-105" />
                  <span className="relative z-10">{item.label}</span>
                  {/* Active dot indicator */}
                  {activeSection === item.id && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)] animate-pulse" />
                  )}
                </a>
              ))}
            </div>
            <Button 
              asChild
              className="bg-white text-black hover:bg-white/90 font-medium rounded-lg lg:rounded-xl h-8 sm:h-9 lg:h-10 text-xs sm:text-sm px-3 sm:px-4 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300 hover:scale-[1.02]"
            >
              <Link href="/chat">
                <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 lg:mr-2" />
                YashGPT
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero / About Section */}
      <section id="about" className="relative pt-20 sm:pt-24 lg:pt-28 pb-12 sm:pb-16 lg:pb-20 min-h-[100dvh] flex items-center overflow-hidden">
        <AnimatedBackground />
        
        <div className="mx-2 sm:mx-3 lg:mx-4 2xl:mx-8 w-full relative z-10">
          <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8">
          {/* Main Hero Content */}
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 xl:gap-16 2xl:gap-24 items-center">
            {/* Left Column - Text Content */}
            <div className="space-y-4 sm:space-y-5 lg:space-y-6 order-2 lg:order-1">
              <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] sm:text-xs lg:text-sm text-[#a3a3a3]">{pTagline}</span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-white leading-[1.1] tracking-tight">
                  <span className="block">Hi, I'm</span>
                  <span className="block bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent animate-gradient">
                    {pName}
                  </span>
                </h1>
                
                <p className="text-base sm:text-lg lg:text-xl 2xl:text-2xl text-[#a3a3a3] font-light">
                  {pTitle}
                </p>
              </div>

              <p className="text-sm sm:text-base lg:text-lg 2xl:text-xl leading-relaxed text-[#a3a3a3] max-w-xl 2xl:max-w-2xl">
                {pBio}
              </p>

              {/* Primary CTA */}
              <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4">
                <Button 
                  size="lg"
                  asChild
                  className="bg-white text-black hover:bg-white/90 font-semibold text-xs sm:text-sm lg:text-base h-9 sm:h-10 lg:h-11 xl:h-12 px-4 sm:px-5 lg:px-6 rounded-lg sm:rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all group"
                >
                  <Link href="/chat">
                    <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1.5 sm:mr-2 group-hover:animate-pulse" />
                    YashGPT
                  </Link>
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 text-white font-medium text-xs sm:text-sm lg:text-base h-9 sm:h-10 lg:h-11 xl:h-12 px-4 sm:px-5 lg:px-6 rounded-lg sm:rounded-xl"
                  asChild
                >
                  <a href="#experience">
                    Explore My Work
                    <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1.5 sm:ml-2" />
                  </a>
                </Button>
              </div>

              {/* Chat Preview Teaser */}
              <ChatPreviewTeaser />
            </div>

            {/* Right Column - Photo & Contact Cards */}
            <div className="order-1 lg:order-2 flex flex-col items-center w-full lg:w-auto">
              {/* Profile Photo with Glow */}
              <div className="relative mb-4 sm:mb-6 lg:mb-8">
                {/* Glow effect */}
                <div className="absolute -inset-2 sm:-inset-3 lg:-inset-4 bg-gradient-to-r from-cyan-500/20 via-violet-500/20 to-cyan-500/20 rounded-xl sm:rounded-2xl lg:rounded-3xl blur-2xl animate-pulse-glow" />
                
                {/* Photo container */}
                <div className="relative w-40 h-40 sm:w-52 sm:h-52 lg:w-60 lg:h-60 xl:w-72 xl:h-72 2xl:w-80 2xl:h-80 rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm">
                  {/* Animated border */}
                  <div className="absolute inset-0 rounded-xl lg:rounded-2xl bg-gradient-to-r from-cyan-500/50 via-violet-500/50 to-cyan-500/50 animate-border-flow opacity-50" style={{ padding: '1px' }}>
                    <div className="w-full h-full rounded-xl lg:rounded-2xl bg-[#0a0a0b]" />
                  </div>
                  
                  {/* Photo or placeholder */}
                  <div className="absolute inset-[1px] rounded-xl lg:rounded-2xl bg-gradient-to-br from-[#1a1a1b] to-[#0a0a0b] flex items-center justify-center overflow-hidden">
                    {pPhoto ? (
                      <img src={pPhoto} alt={pName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-2 lg:mb-3 rounded-full bg-white/5 flex items-center justify-center">
                          <span className="text-2xl lg:text-3xl text-white/30 font-bold">{pName.split(" ").map(n => n[0]).join("")}</span>
                        </div>
                        <span className="text-[#a3a3a3] text-xs lg:text-sm">Profile Photo</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Buttons - 5 buttons grid */}
              <div className="w-full max-w-xs lg:max-w-sm space-y-2 lg:space-y-3 mx-auto lg:mx-0">
                {/* Top row - 2 full width buttons */}
                <a 
                  href={pResume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 rounded-lg lg:rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all group backdrop-blur-sm"
                >
                  <div className="p-2 lg:p-2.5 rounded-lg bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
                    <FileText className="h-4 w-4 lg:h-5 lg:w-5 text-cyan-400" />
                  </div>
                  <span className="text-xs lg:text-sm font-medium text-white">View Resume</span>
                  <ArrowUpRight className="h-3.5 w-3.5 lg:h-4 lg:w-4 ml-auto text-[#a3a3a3] group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </a>

                <div className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 rounded-lg lg:rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
                  <div className="p-2 lg:p-2.5 rounded-lg bg-emerald-500/10">
                    <Mail className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-400" />
                  </div>
                  <span className="text-xs lg:text-sm font-medium text-white">{pEmail}</span>
                </div>

                {/* Bottom row - 3 icon buttons */}
                <div className="flex gap-2 lg:gap-3">
                  <a 
                    href={pLinkedin} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 lg:gap-2 p-3 lg:p-4 rounded-lg lg:rounded-xl bg-white/[0.03] border border-white/10 hover:bg-[#0077B5]/20 hover:border-[#0077B5]/50 transition-all group backdrop-blur-sm"
                  >
                    <Linkedin className="h-4 w-4 lg:h-5 lg:w-5 text-[#a3a3a3] group-hover:text-[#0077B5] transition-colors" />
                    <span className="text-[10px] lg:text-xs font-medium text-[#a3a3a3] group-hover:text-white transition-colors">LinkedIn</span>
                  </a>
                  
                  <a 
                    href={pGithub} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 lg:gap-2 p-3 lg:p-4 rounded-lg lg:rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all group backdrop-blur-sm"
                  >
                    <Github className="h-4 w-4 lg:h-5 lg:w-5 text-[#a3a3a3] group-hover:text-white transition-colors" />
                    <span className="text-[10px] lg:text-xs font-medium text-[#a3a3a3] group-hover:text-white transition-colors">GitHub</span>
                  </a>
                  
                  <a 
                    href={`tel:${pPhone}`} 
                    className="flex-1 flex items-center justify-center gap-1.5 lg:gap-2 p-3 lg:p-4 rounded-lg lg:rounded-xl bg-white/[0.03] border border-white/10 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all group backdrop-blur-sm"
                  >
                    <Phone className="h-4 w-4 lg:h-5 lg:w-5 text-[#a3a3a3] group-hover:text-emerald-400 transition-colors" />
                    <span className="text-[10px] lg:text-xs font-medium text-[#a3a3a3] group-hover:text-white transition-colors">Phone</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-4 lg:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#a3a3a3]">
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1">
              <div className="w-1 h-2 bg-white/50 rounded-full animate-bounce" />
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* Impact Stats Section */}
      <section className="py-8 sm:py-12 lg:py-16 2xl:py-20 border-t border-white/5 overflow-hidden">
        <div className="mx-2 sm:mx-3 lg:mx-4 2xl:mx-8">
          <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8">
            <RevealOnScroll>
              <SectionHeading icon={Zap} title="Impact" accentColor="amber" />
            </RevealOnScroll>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-10">
              {impactData.map((stat, index) => (
                <RevealOnScroll key={stat.slug} delay={index * 120}>
                <div className="group">
                  <div className="text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl font-bold text-white mb-2 sm:mb-3 tracking-tight">
                    {stat.type === "counter" ? (
                      <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                        {stat.prefix}<AnimatedCounter target={parseFloat(stat.value)} suffix={stat.suffix} duration={2200 + index * 200} decimals={parseInt(stat.decimals) || 0} />
                      </span>
                    ) : (
                      <span className="bg-gradient-to-r from-cyan-300 to-cyan-500 bg-clip-text text-transparent">
                        {stat.prefix}{stat.value}{stat.suffix}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs lg:text-sm text-[#a3a3a3] uppercase tracking-wider leading-relaxed">{stat.label}</p>
                </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-8 sm:py-12 lg:py-16 2xl:py-20 border-t border-white/5">
        <div className="mx-2 sm:mx-3 lg:mx-4 2xl:mx-8">
          <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8">
          <RevealOnScroll>
            <SectionHeading icon={Briefcase} title="Experience" accentColor="cyan" />
          </RevealOnScroll>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 auto-rows-fr">
            {experienceData.map((exp, index) => (
              <RevealOnScroll key={index} delay={index * 100}>
              <Link 
                href={`/detail/experience/${exp.slug}`}
                className="group block h-full p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl lg:rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300 cursor-pointer hover:scale-[1.03]"
              >
                <div className="flex items-center gap-2 lg:gap-3 mb-2 sm:mb-3 lg:mb-4">
                  <div className="p-1.5 sm:p-2 lg:p-2.5 rounded-md sm:rounded-lg bg-cyan-500/10">
                    <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-cyan-400" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] lg:text-xs font-medium text-[#a3a3a3] px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 rounded-full bg-white/5">{exp.period}</span>
                </div>
                <h3 className="text-sm sm:text-base lg:text-lg font-medium text-white mb-0.5 sm:mb-1 group-hover:text-cyan-400 transition-colors">{exp.role}</h3>
                <p className="text-[10px] sm:text-xs lg:text-sm text-cyan-400 mb-1.5 sm:mb-2 lg:mb-3">{exp.company}</p>
                <p className="text-[10px] sm:text-xs lg:text-sm text-[#a3a3a3] mb-2 sm:mb-3 lg:mb-4 leading-relaxed line-clamp-3">{exp.description}</p>
                <div className="flex flex-wrap gap-1 sm:gap-1.5 lg:gap-2">
                  {(exp.skills || []).slice(0, 4).map((skill) => (
                    <span 
                      key={skill}
                      className="px-1.5 sm:px-2 py-0.5 lg:py-1 text-[9px] sm:text-[10px] lg:text-xs rounded bg-white/5 text-[#a3a3a3]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </Link>
              </RevealOnScroll>
            ))}
          </div>
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section id="education" className="py-8 sm:py-12 lg:py-16 2xl:py-20 border-t border-white/5">
        <div className="mx-2 sm:mx-3 lg:mx-4 2xl:mx-8">
          <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8">
          <RevealOnScroll>
            <SectionHeading icon={GraduationCap} title="Education" accentColor="violet" />
          </RevealOnScroll>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 auto-rows-fr">
            {educationData.map((edu, index) => (
              <RevealOnScroll key={index} delay={index * 100}>
              <Link 
                href={`/detail/education/${edu.slug}`}
                className="group block h-full p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl lg:rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300 cursor-pointer hover:scale-[1.03]"
              >
                <div className="flex items-center gap-2 lg:gap-3 mb-2 sm:mb-3 lg:mb-4">
                  <div className="p-1.5 sm:p-2 lg:p-2.5 rounded-md sm:rounded-lg bg-violet-500/10">
                    <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-violet-400" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] lg:text-xs font-medium text-[#a3a3a3] px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 rounded-full bg-white/5">{edu.period}</span>
                </div>
                <h3 className="text-sm sm:text-base lg:text-lg font-medium text-white mb-0.5 sm:mb-1 group-hover:text-violet-400 transition-colors">{edu.degree}</h3>
                <p className="text-[10px] sm:text-xs lg:text-sm text-violet-400 mb-1.5 sm:mb-2 lg:mb-3">{edu.school}</p>
                <p className="text-[10px] sm:text-xs lg:text-sm text-[#a3a3a3] leading-relaxed">{edu.focus}</p>
              </Link>
              </RevealOnScroll>
            ))}
          </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-8 sm:py-12 lg:py-16 2xl:py-20 border-t border-white/5">
        <div className="mx-2 sm:mx-3 lg:mx-4 2xl:mx-8">
          <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8">
          <RevealOnScroll>
            <SectionHeading icon={FolderKanban} title="Projects" accentColor="emerald" />
          </RevealOnScroll>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 auto-rows-fr">
            {projectsData.map((project, index) => (
              <RevealOnScroll key={index} delay={index * 100}>
              <Link 
                href={`/detail/project/${project.slug}`}
                className="group block h-full p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl lg:rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300 cursor-pointer hover:scale-[1.03]"
              >
                {/* Project Image Placeholder */}
                <div className="aspect-video rounded-md sm:rounded-lg bg-gradient-to-br from-white/10 to-white/5 mb-2 sm:mb-3 lg:mb-4 flex items-center justify-center">
                  <span className="text-[10px] sm:text-xs text-[#a3a3a3]">Project Image</span>
                </div>
                <h3 className="text-sm sm:text-base lg:text-lg font-medium text-white mb-1 sm:mb-1.5 lg:mb-2 group-hover:text-emerald-400 transition-colors line-clamp-1">{project.title}</h3>
                <p className="text-[10px] sm:text-xs lg:text-sm text-[#a3a3a3] mb-2 sm:mb-3 lg:mb-4 leading-relaxed line-clamp-2">{project.description}</p>
                <div className="flex flex-wrap gap-1 sm:gap-1.5 lg:gap-2">
                  {project.tech.slice(0, 4).map((t) => (
                    <span key={t} className="px-1.5 sm:px-2 py-0.5 lg:py-1 text-[9px] sm:text-[10px] lg:text-xs rounded bg-white/5 text-[#a3a3a3]">
                      {t}
                    </span>
                  ))}
                </div>
              </Link>
              </RevealOnScroll>
            ))}
          </div>
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section id="case-studies" className="py-8 sm:py-12 lg:py-16 2xl:py-20 border-t border-white/5">
        <div className="mx-2 sm:mx-3 lg:mx-4 2xl:mx-8">
          <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8">
            <RevealOnScroll>
              <SectionHeading icon={Lightbulb} title="Case Studies" accentColor="rose" />
            </RevealOnScroll>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 auto-rows-fr">
            {caseStudiesData.map((study, index) => (
              <RevealOnScroll key={index} delay={index * 100}>
              <Link 
                href={`/detail/case-study/${study.slug}`}
                className="group block h-full p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/5 hover:border-white/10 transition-all duration-300 cursor-pointer hover:scale-[1.03]"
              >
                <h3 className="text-base sm:text-lg lg:text-xl font-medium text-white mb-3 sm:mb-4 lg:mb-6 group-hover:text-amber-400 transition-colors line-clamp-2">{study.title}</h3>
                <div className="space-y-2 sm:space-y-3 lg:space-y-4 text-[10px] sm:text-xs lg:text-sm">
                  <div>
                    <span className="text-[#a3a3a3] uppercase tracking-wider text-[9px] sm:text-[10px] lg:text-xs">Problem</span>
                    <p className="text-[#e5e5e5] mt-0.5 sm:mt-1 line-clamp-2">{study.problem}</p>
                  </div>
                  <div>
                    <span className="text-[#a3a3a3] uppercase tracking-wider text-[9px] sm:text-[10px] lg:text-xs">Solution</span>
                    <p className="text-[#e5e5e5] mt-0.5 sm:mt-1 line-clamp-2">{study.solution}</p>
                  </div>
                  <div>
                    <span className="text-emerald-400 uppercase tracking-wider text-[9px] sm:text-[10px] lg:text-xs">Impact</span>
                    <p className="text-white font-medium mt-0.5 sm:mt-1">{study.impact}</p>
                  </div>
                </div>
              </Link>
              </RevealOnScroll>
            ))}
          </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-8 sm:py-12 lg:py-16 2xl:py-20 border-t border-white/5">
        <div className="mx-2 sm:mx-3 lg:mx-4 2xl:mx-8">
          <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8">
            <RevealOnScroll>
              <SectionHeading icon={Code2} title="Skills" accentColor="cyan" />
            </RevealOnScroll>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 auto-rows-fr">
            {Object.entries(skillsData).map(([category, skills], index) => {
              const colors = [
                { bg: "bg-emerald-500/10", text: "text-emerald-400" },
                { bg: "bg-amber-500/10", text: "text-amber-400" },
                { bg: "bg-rose-500/10", text: "text-rose-400" },
              ]
              const color = colors[index % colors.length]
              return (
                <RevealOnScroll key={category} delay={index * 80}>
                <div
                  className="group p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl lg:rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300 hover:scale-[1.03] h-full"
                >
                  <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 mb-2 sm:mb-3 lg:mb-4">
                    <div className={`p-1.5 sm:p-2 lg:p-2.5 rounded-md sm:rounded-lg ${color.bg}`}>
                      <Code2 className={`h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 ${color.text}`} />
                    </div>
                    <h3 className="text-xs sm:text-sm lg:text-base font-medium text-white">{category}</h3>
                  </div>
                  <div className="flex flex-wrap gap-1 sm:gap-1.5 lg:gap-2">
                    {skills.map((skill) => (
                      <span 
                        key={skill}
                        className="px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 lg:py-1.5 text-[9px] sm:text-xs lg:text-sm rounded-md sm:rounded-lg bg-white/5 text-[#a3a3a3] hover:bg-white/10 hover:text-white transition-colors cursor-default"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                </RevealOnScroll>
              )
            })}
            </div>
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="py-8 sm:py-12 lg:py-16 2xl:py-20 border-t border-white/5">
        <div className="mx-2 sm:mx-3 lg:mx-4 2xl:mx-8">
          <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8">
            <RevealOnScroll>
              <SectionHeading icon={Award} title="Certifications" accentColor="amber" />
            </RevealOnScroll>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5 auto-rows-fr">
            {certificationsData.map((cert, index) => (
              <RevealOnScroll key={index} delay={index * 80}>
              <Link 
                href={`/detail/certification/${cert.slug}`}
                className="group block h-full p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl lg:rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300 cursor-pointer hover:scale-[1.03]"
              >
                <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 mb-2 sm:mb-3 lg:mb-4">
                  <div className="p-1.5 sm:p-2 lg:p-2.5 rounded-md sm:rounded-lg bg-cyan-500/10">
                    <Award className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-cyan-400" />
                  </div>
                  <span className="text-[8px] sm:text-[10px] lg:text-xs font-medium text-[#a3a3a3] px-1.5 sm:px-2 lg:px-3 py-0.5 sm:py-1 rounded-full bg-white/5">{cert.date}</span>
                </div>
                <h3 className="text-[11px] sm:text-sm lg:text-base font-medium text-white mb-0.5 sm:mb-1 group-hover:text-cyan-400 transition-colors line-clamp-2">{cert.title}</h3>
                <p className="text-[10px] sm:text-xs lg:text-sm text-cyan-400 mb-1 sm:mb-1.5 lg:mb-2 line-clamp-1">{cert.issuer}</p>
                <p className="text-[8px] sm:text-[10px] lg:text-xs text-[#a3a3a3] truncate">ID: {cert.credentialId}</p>
              </Link>
              </RevealOnScroll>
            ))}
            </div>
          </div>
        </div>
      </section>

      {/* Additional Info Section */}
      <section className="py-8 sm:py-12 lg:py-16 2xl:py-20 border-t border-white/5">
        <div className="mx-2 sm:mx-3 lg:mx-4 2xl:mx-8">
          <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8">
            <RevealOnScroll>
              <SectionHeading icon={Info} title="Additional Information" accentColor="emerald" />
            </RevealOnScroll>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 text-[10px] sm:text-xs lg:text-sm">
              <RevealOnScroll delay={0}>
              <div>
                <h3 className="font-medium text-white mb-1.5 sm:mb-2 lg:mb-3">Interests</h3>
                <p className="text-[#a3a3a3] leading-relaxed">
                  AI/ML, Startups, Product-Led Growth, Building in Public, Open Source
                </p>
              </div>
              </RevealOnScroll>
              <RevealOnScroll delay={100}>
              <div>
                <h3 className="font-medium text-white mb-1.5 sm:mb-2 lg:mb-3">Languages</h3>
                <p className="text-[#a3a3a3] leading-relaxed">
                  English (Native), Hindi (Native), Spanish (Basic)
                </p>
              </div>
              </RevealOnScroll>
              <RevealOnScroll delay={200}>
              <div>
                <h3 className="font-medium text-white mb-1.5 sm:mb-2 lg:mb-3">Location</h3>
                <p className="text-[#a3a3a3] leading-relaxed">
                  San Francisco Bay Area · Open to Remote
                </p>
              </div>
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-8 sm:py-12 lg:py-16 2xl:py-20 border-t border-white/5">
        <div className="mx-2 sm:mx-3 lg:mx-4 2xl:mx-8">
          <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8 text-center">
            <RevealOnScroll>
            <h2 className="text-xl sm:text-2xl lg:text-3xl 2xl:text-4xl font-bold text-white mb-2 sm:mb-3 lg:mb-4">Let's Connect</h2>
            <p className="text-[#a3a3a3] text-xs sm:text-sm lg:text-base max-w-xl mx-auto mb-4 sm:mb-6 lg:mb-8">
              Whether you want to discuss opportunities, collaborate on a project, or just say hi - I'd love to hear from you.
            </p>
            </RevealOnScroll>
            <RevealOnScroll delay={200}>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:gap-4">
              <Button 
                size="lg"
                asChild
                className="bg-white text-black hover:bg-white/90 font-medium h-8 sm:h-9 lg:h-10 xl:h-11 text-xs sm:text-sm px-3 sm:px-4"
              >
                <Link href="/chat">
                  <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1.5 sm:mr-2" />
                  YashGPT
                </Link>
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-white/20 bg-transparent hover:bg-white/5 text-white h-8 sm:h-9 lg:h-10 xl:h-11 text-xs sm:text-sm px-3 sm:px-4"
                asChild
              >
                <button onClick={() => { navigator.clipboard.writeText(pEmail); window.open(`mailto:${pEmail}`, "_self") }}>
                  <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1.5 sm:mr-2" />
                  <span className="hidden xs:inline">Send </span>Email
                </button>
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-white/20 bg-transparent hover:bg-white/5 text-white h-8 sm:h-9 lg:h-10 xl:h-11 text-xs sm:text-sm px-3 sm:px-4"
                asChild
              >
                <a href={`tel:${pPhone}`}>
                  <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1.5 sm:mr-2" />
                  <span className="hidden xs:inline">Call </span>Me
                </a>
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-white/20 bg-transparent hover:bg-white/5 text-white h-8 sm:h-9 lg:h-10 xl:h-11 text-xs sm:text-sm px-3 sm:px-4"
                asChild
              >
                <a href={pResume} target="_blank" rel="noopener noreferrer">
                  <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1.5 sm:mr-2" />
                  Resume
                </a>
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-white/20 bg-transparent hover:bg-white/5 text-white h-8 sm:h-9 lg:h-10 xl:h-11 text-xs sm:text-sm px-3 sm:px-4"
                asChild
              >
                <a href={pLinkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1.5 sm:mr-2" />
                  LinkedIn
                </a>
              </Button>
            </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4 sm:py-6 lg:py-8 border-t border-white/5">
        <div className="mx-2 sm:mx-3 lg:mx-4 2xl:mx-8">
          <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8 flex justify-center items-center text-[10px] sm:text-xs lg:text-sm text-[#a3a3a3]">
            <span>{pFooter}</span>
          </div>
        </div>
      </footer>

      {/* Floating Chat Button (Mobile) */}
      <Link
        href="/chat"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:hidden p-3 sm:p-4 rounded-full bg-white text-black shadow-lg hover:scale-105 transition-transform z-40"
      >
        <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
      </Link>

      {/* Scroll-triggered Curiosity Prompt (Desktop) */}
      <div className="hidden md:block">
        <CuriosityPrompt />
      </div>
    </div>
  )
}
