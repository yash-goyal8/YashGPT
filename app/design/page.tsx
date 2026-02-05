"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
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
  Info,
  Bot,
  ArrowUpRight,
  Phone,
  ChevronRight,
  Award
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

interface CardsData {
  experience: ExperienceCard[]
  education: EducationCard[]
  project: ProjectCard[]
  "case-study": CaseStudyCard[]
  certification: CertificationCard[]
  skills: Record<string, string[]>
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

export default function PortfolioDesign() {
  const [cards, setCards] = useState<CardsData | null>(null)
  
  useEffect(() => {
    fetch("/api/cards")
      .then(res => res.json())
      .then(data => setCards(data))
      .catch(() => setCards(null))
  }, [])
  
  // Use fetched data or fallback to defaults
  const experienceData = cards?.experience || EXPERIENCE
  const educationData = cards?.education || EDUCATION
  const projectsData = cards?.project || PROJECTS
  const caseStudiesData = cards?.["case-study"] || CASE_STUDIES
  const certificationsData = cards?.certification || CERTIFICATIONS
  const skillsData = cards?.skills || SKILLS
  
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e5e5e5] relative overflow-hidden">
      {/* Interactive Matrix Background */}
      <MatrixBackground />
      
      {/* Subtle ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[150px]" />
      </div>
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40">
        <div className="mx-2 sm:mx-3 lg:mx-4 2xl:mx-8 mt-2 sm:mt-3 lg:mt-4">
          <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl lg:rounded-2xl bg-[#0a0a0b]/60 backdrop-blur-xl border border-white/10 flex items-center justify-between">
            <a href="#about" className="font-semibold text-base lg:text-lg text-white hover:text-cyan-400 transition-colors">
              YG
            </a>
            <div className="hidden md:flex items-center gap-0.5 lg:gap-1 text-xs lg:text-sm">
              <a href="#about" className="px-2 lg:px-3 xl:px-4 py-1.5 lg:py-2 rounded-lg text-[#a3a3a3] hover:text-white hover:bg-white/5 transition-all">About</a>
              <a href="#experience" className="px-2 lg:px-3 xl:px-4 py-1.5 lg:py-2 rounded-lg text-[#a3a3a3] hover:text-white hover:bg-white/5 transition-all">Experience</a>
              <a href="#education" className="px-2 lg:px-3 xl:px-4 py-1.5 lg:py-2 rounded-lg text-[#a3a3a3] hover:text-white hover:bg-white/5 transition-all">Education</a>
              <a href="#projects" className="px-2 lg:px-3 xl:px-4 py-1.5 lg:py-2 rounded-lg text-[#a3a3a3] hover:text-white hover:bg-white/5 transition-all">Projects</a>
              <a href="#case-studies" className="px-2 lg:px-3 xl:px-4 py-1.5 lg:py-2 rounded-lg text-[#a3a3a3] hover:text-white hover:bg-white/5 transition-all whitespace-nowrap">Case Studies</a>
              <a href="#contact" className="px-2 lg:px-3 xl:px-4 py-1.5 lg:py-2 rounded-lg text-[#a3a3a3] hover:text-white hover:bg-white/5 transition-all">Contact</a>
            </div>
            <Button 
              asChild
              className="bg-white text-black hover:bg-white/90 font-medium rounded-lg lg:rounded-xl h-8 sm:h-9 lg:h-10 text-xs sm:text-sm px-3 sm:px-4"
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
                  <span className="text-[10px] sm:text-xs lg:text-sm text-[#a3a3a3]">Available for opportunities</span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-white leading-[1.1] tracking-tight">
                  <span className="block">Hi, I'm</span>
                  <span className="block bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent animate-gradient">
                    Yash Goyal
                  </span>
                </h1>
                
                <p className="text-base sm:text-lg lg:text-xl 2xl:text-2xl text-[#a3a3a3] font-light">
                  Product & Technology Leader
                </p>
              </div>

              <p className="text-sm sm:text-base lg:text-lg 2xl:text-xl leading-relaxed text-[#a3a3a3] max-w-xl 2xl:max-w-2xl">
                Building products that matter. I combine deep technical expertise with strategic 
                product thinking to create impactful solutions at scale.
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
                  
                  {/* Photo placeholder */}
                  <div className="absolute inset-[1px] rounded-xl lg:rounded-2xl bg-gradient-to-br from-[#1a1a1b] to-[#0a0a0b] flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-2 lg:mb-3 rounded-full bg-white/5 flex items-center justify-center">
                        <span className="text-2xl lg:text-3xl text-white/30 font-bold">YG</span>
                      </div>
                      <span className="text-[#a3a3a3] text-xs lg:text-sm">Profile Photo</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Buttons - 5 buttons grid */}
              <div className="w-full max-w-xs lg:max-w-sm space-y-2 lg:space-y-3 mx-auto lg:mx-0">
                {/* Top row - 2 full width buttons */}
                <a 
                  href="#resume" 
                  className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 rounded-lg lg:rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all group backdrop-blur-sm"
                >
                  <div className="p-2 lg:p-2.5 rounded-lg bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
                    <FileText className="h-4 w-4 lg:h-5 lg:w-5 text-cyan-400" />
                  </div>
                  <span className="text-xs lg:text-sm font-medium text-white">View Resume</span>
                  <ArrowUpRight className="h-3.5 w-3.5 lg:h-4 lg:w-4 ml-auto text-[#a3a3a3] group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </a>

                <a 
                  href="mailto:yash@example.com" 
                  className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 rounded-lg lg:rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all group backdrop-blur-sm"
                >
                  <div className="p-2 lg:p-2.5 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                    <Mail className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-400" />
                  </div>
                  <span className="text-xs lg:text-sm font-medium text-white">yash@example.com</span>
                  <ArrowUpRight className="h-3.5 w-3.5 lg:h-4 lg:w-4 ml-auto text-[#a3a3a3] group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </a>

                {/* Bottom row - 3 icon buttons */}
                <div className="flex gap-2 lg:gap-3">
                  <a 
                    href="https://linkedin.com/in/yashgoyal" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 lg:gap-2 p-3 lg:p-4 rounded-lg lg:rounded-xl bg-white/[0.03] border border-white/10 hover:bg-[#0077B5]/20 hover:border-[#0077B5]/50 transition-all group backdrop-blur-sm"
                  >
                    <Linkedin className="h-4 w-4 lg:h-5 lg:w-5 text-[#a3a3a3] group-hover:text-[#0077B5] transition-colors" />
                    <span className="text-[10px] lg:text-xs font-medium text-[#a3a3a3] group-hover:text-white transition-colors">LinkedIn</span>
                  </a>
                  
                  <a 
                    href="https://github.com/yashgoyal" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 lg:gap-2 p-3 lg:p-4 rounded-lg lg:rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all group backdrop-blur-sm"
                  >
                    <Github className="h-4 w-4 lg:h-5 lg:w-5 text-[#a3a3a3] group-hover:text-white transition-colors" />
                    <span className="text-[10px] lg:text-xs font-medium text-[#a3a3a3] group-hover:text-white transition-colors">GitHub</span>
                  </a>
                  
                  <a 
                    href="tel:+1234567890" 
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

      {/* Experience Section */}
      <section id="experience" className="py-8 sm:py-12 lg:py-16 2xl:py-20 border-t border-white/5">
        <div className="mx-2 sm:mx-3 lg:mx-4 2xl:mx-8">
          <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 lg:mb-10">
            <Briefcase className="h-4 w-4 lg:h-5 lg:w-5 text-[#a3a3a3]" />
            <h2 className="text-xs lg:text-sm font-medium text-[#a3a3a3] uppercase tracking-wider">Experience</h2>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {experienceData.map((exp, index) => (
              <Link 
                key={index}
                href={`/detail/experience/${exp.slug}`}
                className="group p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl lg:rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300 cursor-pointer hover:scale-[1.02] sm:hover:scale-[1.03] hover:shadow-xl hover:shadow-cyan-500/5"
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
                  {exp.skills.slice(0, 4).map((skill) => (
                    <span 
                      key={skill}
                      className="px-1.5 sm:px-2 py-0.5 lg:py-1 text-[9px] sm:text-[10px] lg:text-xs rounded bg-white/5 text-[#a3a3a3]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section id="education" className="py-8 sm:py-12 lg:py-16 2xl:py-20 border-t border-white/5">
        <div className="mx-2 sm:mx-3 lg:mx-4 2xl:mx-8">
          <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 lg:mb-10">
            <GraduationCap className="h-4 w-4 lg:h-5 lg:w-5 text-[#a3a3a3]" />
            <h2 className="text-xs lg:text-sm font-medium text-[#a3a3a3] uppercase tracking-wider">Education</h2>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {educationData.map((edu, index) => (
              <Link 
                key={index}
                href={`/detail/education/${edu.slug}`}
                className="group p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl lg:rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300 cursor-pointer hover:scale-[1.02] sm:hover:scale-[1.03] hover:shadow-xl hover:shadow-cyan-500/5"
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
            ))}
          </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-8 sm:py-12 lg:py-16 2xl:py-20 border-t border-white/5">
        <div className="mx-2 sm:mx-3 lg:mx-4 2xl:mx-8">
          <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 lg:mb-10">
            <FolderKanban className="h-4 w-4 lg:h-5 lg:w-5 text-[#a3a3a3]" />
            <h2 className="text-xs lg:text-sm font-medium text-[#a3a3a3] uppercase tracking-wider">Projects</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {projectsData.map((project, index) => (
              <Link 
                key={index}
                href={`/detail/project/${project.slug}`}
                className="group p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl lg:rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300 cursor-pointer hover:scale-[1.02] sm:hover:scale-[1.03] hover:shadow-xl hover:shadow-cyan-500/5"
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
            ))}
          </div>
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section id="case-studies" className="py-8 sm:py-12 lg:py-16 2xl:py-20 border-t border-white/5">
        <div className="mx-2 sm:mx-3 lg:mx-4 2xl:mx-8">
          <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 lg:mb-10">
              <Lightbulb className="h-4 w-4 lg:h-5 lg:w-5 text-[#a3a3a3]" />
            <h2 className="text-xs lg:text-sm font-medium text-[#a3a3a3] uppercase tracking-wider">Case Studies</h2>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {caseStudiesData.map((study, index) => (
              <Link 
                key={index}
                href={`/detail/case-study/${study.slug}`}
                className="group p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/5 hover:border-white/10 transition-all duration-300 cursor-pointer hover:scale-[1.02] sm:hover:scale-[1.03] hover:shadow-xl hover:shadow-violet-500/5"
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
            ))}
          </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-8 sm:py-12 lg:py-16 2xl:py-20 border-t border-white/5">
        <div className="mx-2 sm:mx-3 lg:mx-4 2xl:mx-8">
          <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 lg:mb-10">
              <Code2 className="h-4 w-4 lg:h-5 lg:w-5 text-[#a3a3a3]" />
              <h2 className="text-xs lg:text-sm font-medium text-[#a3a3a3] uppercase tracking-wider">Skills</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
              {Object.entries(skillsData).map(([category, skills], index) => {
              const colors = [
                { bg: "bg-emerald-500/10", text: "text-emerald-400" },
                { bg: "bg-amber-500/10", text: "text-amber-400" },
                { bg: "bg-rose-500/10", text: "text-rose-400" },
              ]
              const color = colors[index % colors.length]
              return (
                <div 
                  key={category}
                  className="group p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl lg:rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300 hover:scale-[1.02] sm:hover:scale-[1.03] hover:shadow-xl hover:shadow-emerald-500/5"
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
            <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 lg:mb-10">
              <Award className="h-4 w-4 lg:h-5 lg:w-5 text-[#a3a3a3]" />
              <h2 className="text-xs lg:text-sm font-medium text-[#a3a3a3] uppercase tracking-wider">Certifications</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
            {certificationsData.map((cert, index) => (
              <Link 
                key={index}
                href={`/detail/certification/${cert.slug}`}
                className="group p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl lg:rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300 cursor-pointer hover:scale-[1.02] sm:hover:scale-[1.03] hover:shadow-xl hover:shadow-cyan-500/5"
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
            ))}
            </div>
          </div>
        </div>
      </section>

      {/* Additional Info Section */}
      <section className="py-8 sm:py-12 lg:py-16 2xl:py-20 border-t border-white/5">
        <div className="mx-2 sm:mx-3 lg:mx-4 2xl:mx-8">
          <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 lg:mb-10">
              <Info className="h-4 w-4 lg:h-5 lg:w-5 text-[#a3a3a3]" />
              <h2 className="text-xs lg:text-sm font-medium text-[#a3a3a3] uppercase tracking-wider">Additional Information</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 text-[10px] sm:text-xs lg:text-sm">
              <div>
                <h3 className="font-medium text-white mb-1.5 sm:mb-2 lg:mb-3">Interests</h3>
                <p className="text-[#a3a3a3] leading-relaxed">
                  AI/ML, Startups, Product-Led Growth, Building in Public, Open Source
                </p>
              </div>
              <div>
                <h3 className="font-medium text-white mb-1.5 sm:mb-2 lg:mb-3">Languages</h3>
                <p className="text-[#a3a3a3] leading-relaxed">
                  English (Native), Hindi (Native), Spanish (Basic)
                </p>
              </div>
              <div>
                <h3 className="font-medium text-white mb-1.5 sm:mb-2 lg:mb-3">Location</h3>
                <p className="text-[#a3a3a3] leading-relaxed">
                  San Francisco Bay Area · Open to Remote
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-8 sm:py-12 lg:py-16 2xl:py-20 border-t border-white/5">
        <div className="mx-2 sm:mx-3 lg:mx-4 2xl:mx-8">
          <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8 text-center">
            <h2 className="text-xl sm:text-2xl lg:text-3xl 2xl:text-4xl font-bold text-white mb-2 sm:mb-3 lg:mb-4">Let's Connect</h2>
            <p className="text-[#a3a3a3] text-xs sm:text-sm lg:text-base max-w-xl mx-auto mb-4 sm:mb-6 lg:mb-8">
              Whether you want to discuss opportunities, collaborate on a project, or just say hi - I'd love to hear from you.
            </p>
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
                <a href="mailto:yash@example.com">
                  <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1.5 sm:mr-2" />
                  <span className="hidden xs:inline">Send </span>Email
                </a>
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-white/20 bg-transparent hover:bg-white/5 text-white h-8 sm:h-9 lg:h-10 xl:h-11 text-xs sm:text-sm px-3 sm:px-4"
                asChild
              >
                <a href="tel:+1234567890">
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
                <a href="#resume" target="_blank" rel="noopener noreferrer">
                  <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1.5 sm:mr-2" />
                  Resume
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4 sm:py-6 lg:py-8 border-t border-white/5">
        <div className="mx-2 sm:mx-3 lg:mx-4 2xl:mx-8">
          <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-[10px] sm:text-xs lg:text-sm text-[#a3a3a3]">
          <span>2025 Yash Goyal</span>
            <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Chat Button (Mobile) */}
      <Link
        href="/chat"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:hidden p-3 sm:p-4 rounded-full bg-white text-black shadow-lg hover:scale-105 transition-transform"
      >
        <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
      </Link>
    </div>
  )
}
