"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  MessageSquare, 
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
  ChevronRight,
  X,
  Target,
  Users,
  Brain,
  Rocket,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"

// Question categories for the chat modal
const QUESTION_CATEGORIES = [
  {
    id: "behavioral",
    label: "Behavioral",
    icon: Brain,
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    questions: [
      "Tell me about a time you failed and what you learned",
      "How do you handle pressure and tight deadlines?",
      "Describe a situation where you went above and beyond",
      "How do you handle conflicts in a team?",
    ]
  },
  {
    id: "product-strategy",
    label: "Product Strategy",
    icon: Target,
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
    questions: [
      "How do you prioritize features in a product roadmap?",
      "Walk me through your product discovery process",
      "How do you measure product success?",
      "Tell me about a product decision that didn't go as planned",
    ]
  },
  {
    id: "leadership",
    label: "Leadership",
    icon: Users,
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10",
    questions: [
      "Describe your leadership style",
      "How do you mentor and develop team members?",
      "Tell me about a time you led through ambiguity",
      "How do you build alignment across stakeholders?",
    ]
  },
  {
    id: "technical",
    label: "Technical",
    icon: Code2,
    color: "text-rose-400",
    bgColor: "bg-rose-400/10",
    questions: [
      "What technologies do you specialize in?",
      "How do you approach system design?",
      "Tell me about your experience with AI/ML",
      "Describe a complex technical problem you solved",
    ]
  },
  {
    id: "career",
    label: "Career & Goals",
    icon: Rocket,
    color: "text-violet-400",
    bgColor: "bg-violet-400/10",
    questions: [
      "What motivates you professionally?",
      "Where do you see yourself in 5 years?",
      "Why MBA after your technical background?",
      "What kind of role are you looking for?",
    ]
  },
]

// Placeholder data - to be replaced with real content
const EXPERIENCE = [
  {
    period: "2022 - Present",
    role: "Senior Product Manager",
    company: "Tech Company",
    description: "Leading product strategy for enterprise solutions, driving 40% revenue growth through data-driven decisions.",
    skills: ["Product Strategy", "Data Analytics", "Cross-functional Leadership"]
  },
  {
    period: "2020 - 2022",
    role: "Product Manager",
    company: "Startup Inc",
    description: "Built and launched 3 products from 0 to 1, managing a team of 8 engineers and designers.",
    skills: ["Agile", "User Research", "Go-to-Market"]
  },
  {
    period: "2018 - 2020",
    role: "Software Engineer",
    company: "Enterprise Corp",
    description: "Full-stack development for customer-facing applications serving 2M+ users.",
    skills: ["React", "Node.js", "AWS", "System Design"]
  },
]

const EDUCATION = [
  {
    period: "2023 - 2025",
    degree: "MBA",
    school: "Business School",
    focus: "Technology & Strategy"
  },
  {
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
    title: "AI-Powered Analytics Platform",
    description: "Built a real-time analytics dashboard with predictive insights, reducing decision time by 60%.",
    tech: ["Python", "React", "TensorFlow", "AWS"],
    image: null
  },
  {
    title: "E-commerce Personalization Engine",
    description: "Developed recommendation system increasing conversion by 25% through personalized experiences.",
    tech: ["ML", "Node.js", "Redis", "PostgreSQL"],
    image: null
  },
  {
    title: "Developer Platform",
    description: "Led the creation of internal developer tools used by 500+ engineers daily.",
    tech: ["TypeScript", "GraphQL", "Kubernetes"],
    image: null
  },
]

const CASE_STUDIES = [
  {
    title: "Scaling a B2B SaaS Product",
    problem: "Low enterprise adoption despite strong SMB traction",
    solution: "Redesigned onboarding, added SSO, built admin dashboard",
    impact: "3x enterprise deals in 6 months"
  },
  {
    title: "Reducing Customer Churn",
    problem: "15% monthly churn in first 90 days",
    solution: "Implemented proactive health scoring and intervention triggers",
    impact: "Reduced churn to 5%, saved $2M ARR"
  },
]

export default function PortfolioDesign() {
  const [chatOpen, setChatOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e5e5e5]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-semibold text-lg text-white">Yash Goyal</span>
          <div className="hidden md:flex items-center gap-8 text-sm text-[#a3a3a3]">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#experience" className="hover:text-white transition-colors">Experience</a>
            <a href="#projects" className="hover:text-white transition-colors">Projects</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
          <Button 
            onClick={() => setChatOpen(true)}
            className="bg-white text-black hover:bg-white/90 font-medium"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Ask Me Anything
          </Button>
        </div>
      </nav>

      {/* Hero / About Section */}
      <section id="about" className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[300px_1fr] gap-16 items-start">
            {/* Left Column - Photo & Quick Info */}
            <div className="space-y-6">
              {/* Profile Photo Placeholder */}
              <div className="w-48 h-48 lg:w-full lg:h-auto lg:aspect-square rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center">
                <span className="text-[#a3a3a3] text-sm">Profile Photo</span>
              </div>
              
              {/* Quick Links */}
              <div className="flex flex-col gap-2">
                <a 
                  href="#resume" 
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                >
                  <FileText className="h-5 w-5 text-[#a3a3a3] group-hover:text-white transition-colors" />
                  <span className="text-sm">View Resume</span>
                  <ExternalLink className="h-4 w-4 ml-auto text-[#a3a3a3]" />
                </a>
                <a 
                  href="mailto:yash@example.com" 
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                >
                  <Mail className="h-5 w-5 text-[#a3a3a3] group-hover:text-white transition-colors" />
                  <span className="text-sm">yash@example.com</span>
                </a>
              </div>

              {/* Social Links */}
              <div className="flex gap-3">
                <a href="#" className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Right Column - Bio */}
            <div className="space-y-8">
              <div>
                <p className="text-[#a3a3a3] text-sm mb-2">Product & Technology Leader</p>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight text-balance">
                  Building products that matter
                </h1>
              </div>

              <div className="space-y-6 text-lg leading-relaxed text-[#a3a3a3]">
                <p>
                  I'm a <span className="text-white font-medium">Product Manager</span> with a strong technical foundation, 
                  passionate about building products that solve real problems. Currently pursuing my 
                  <span className="text-white font-medium"> MBA</span> while working on enterprise solutions.
                </p>
                <p>
                  With over <span className="text-white font-medium">5 years of experience</span> spanning 
                  software engineering and product management, I bring a unique perspective to building 
                  and scaling products from 0 to 1 and beyond.
                </p>
                <p>
                  I've led cross-functional teams, shipped products used by millions, and 
                  driven significant business impact through data-informed decisions.
                </p>
              </div>

              {/* CTA */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Button 
                  size="lg"
                  onClick={() => setChatOpen(true)}
                  className="bg-white text-black hover:bg-white/90 font-medium text-base"
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Chat with my AI
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-transparent hover:bg-white/5 text-white font-medium text-base"
                  asChild
                >
                  <a href="#contact">Get in Touch</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-20 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <Briefcase className="h-5 w-5 text-[#a3a3a3]" />
            <h2 className="text-sm font-medium text-[#a3a3a3] uppercase tracking-wider">Experience</h2>
          </div>

          <div className="space-y-1">
            {EXPERIENCE.map((exp, index) => (
              <div 
                key={index}
                className="group grid md:grid-cols-[180px_1fr] gap-4 md:gap-8 p-6 -mx-6 rounded-2xl hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-sm text-[#a3a3a3]">{exp.period}</span>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-medium text-white group-hover:text-white/90">
                      {exp.role}
                      <span className="text-[#a3a3a3] font-normal"> · {exp.company}</span>
                      <ExternalLink className="h-4 w-4 inline ml-2 opacity-0 group-hover:opacity-50 transition-opacity" />
                    </h3>
                    <p className="text-[#a3a3a3] mt-2 leading-relaxed">{exp.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {exp.skills.map((skill) => (
                      <span 
                        key={skill}
                        className="px-3 py-1 text-xs rounded-full bg-white/5 text-[#a3a3a3]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <GraduationCap className="h-5 w-5 text-[#a3a3a3]" />
            <h2 className="text-sm font-medium text-[#a3a3a3] uppercase tracking-wider">Education</h2>
          </div>

          <div className="space-y-1">
            {EDUCATION.map((edu, index) => (
              <div 
                key={index}
                className="grid md:grid-cols-[180px_1fr] gap-4 md:gap-8 p-6 -mx-6 rounded-2xl hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-sm text-[#a3a3a3]">{edu.period}</span>
                <div>
                  <h3 className="text-lg font-medium text-white">
                    {edu.degree}
                    <span className="text-[#a3a3a3] font-normal"> · {edu.school}</span>
                  </h3>
                  <p className="text-[#a3a3a3] mt-1">{edu.focus}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <Code2 className="h-5 w-5 text-[#a3a3a3]" />
            <h2 className="text-sm font-medium text-[#a3a3a3] uppercase tracking-wider">Skills</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {Object.entries(SKILLS).map(([category, skills]) => (
              <div key={category}>
                <h3 className="text-sm font-medium text-white mb-4">{category}</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span 
                      key={skill}
                      className="px-3 py-1.5 text-sm rounded-lg bg-white/5 text-[#a3a3a3] hover:bg-white/10 hover:text-white transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <FolderKanban className="h-5 w-5 text-[#a3a3a3]" />
            <h2 className="text-sm font-medium text-[#a3a3a3] uppercase tracking-wider">Projects</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROJECTS.map((project, index) => (
              <div 
                key={index}
                className="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all"
              >
                {/* Project Image Placeholder */}
                <div className="aspect-video rounded-lg bg-gradient-to-br from-white/10 to-white/5 mb-4 flex items-center justify-center">
                  <span className="text-xs text-[#a3a3a3]">Project Image</span>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">{project.title}</h3>
                <p className="text-sm text-[#a3a3a3] mb-4 leading-relaxed">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((t) => (
                    <span key={t} className="px-2 py-1 text-xs rounded bg-white/5 text-[#a3a3a3]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <Lightbulb className="h-5 w-5 text-[#a3a3a3]" />
            <h2 className="text-sm font-medium text-[#a3a3a3] uppercase tracking-wider">Case Studies</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {CASE_STUDIES.map((study, index) => (
              <div 
                key={index}
                className="group p-6 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/5 hover:border-white/10 transition-all"
              >
                <h3 className="text-xl font-medium text-white mb-6">{study.title}</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="text-[#a3a3a3] uppercase tracking-wider text-xs">Problem</span>
                    <p className="text-[#e5e5e5] mt-1">{study.problem}</p>
                  </div>
                  <div>
                    <span className="text-[#a3a3a3] uppercase tracking-wider text-xs">Solution</span>
                    <p className="text-[#e5e5e5] mt-1">{study.solution}</p>
                  </div>
                  <div>
                    <span className="text-emerald-400 uppercase tracking-wider text-xs">Impact</span>
                    <p className="text-white font-medium mt-1">{study.impact}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setChatOpen(true)}
                  className="mt-6 text-sm text-[#a3a3a3] hover:text-white flex items-center gap-2 group/btn"
                >
                  Ask about this case study
                  <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Info Section */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-12">
            <Info className="h-5 w-5 text-[#a3a3a3]" />
            <h2 className="text-sm font-medium text-[#a3a3a3] uppercase tracking-wider">Additional Information</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-sm">
            <div>
              <h3 className="font-medium text-white mb-3">Interests</h3>
              <p className="text-[#a3a3a3] leading-relaxed">
                AI/ML, Startups, Product-Led Growth, Building in Public, Open Source
              </p>
            </div>
            <div>
              <h3 className="font-medium text-white mb-3">Languages</h3>
              <p className="text-[#a3a3a3] leading-relaxed">
                English (Native), Hindi (Native), Spanish (Basic)
              </p>
            </div>
            <div>
              <h3 className="font-medium text-white mb-3">Location</h3>
              <p className="text-[#a3a3a3] leading-relaxed">
                San Francisco Bay Area · Open to Remote
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Let's Connect</h2>
          <p className="text-[#a3a3a3] text-lg max-w-xl mx-auto mb-8">
            Whether you want to discuss opportunities, collaborate on a project, or just say hi - I'd love to hear from you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg"
              onClick={() => setChatOpen(true)}
              className="bg-white text-black hover:bg-white/90 font-medium"
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              Chat with my AI
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-white/20 bg-transparent hover:bg-white/5 text-white"
              asChild
            >
              <a href="mailto:yash@example.com">
                <Mail className="h-5 w-5 mr-2" />
                Send Email
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#a3a3a3]">
          <span>2025 Yash Goyal</span>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
          </div>
        </div>
      </footer>

      {/* Chat Modal */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => {
              setChatOpen(false)
              setSelectedCategory(null)
            }}
          />
          
          {/* Modal */}
          <div className="relative w-full max-w-2xl bg-[#141415] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Ask me anything</h3>
                  <p className="text-xs text-[#a3a3a3]">Select a category or start chatting</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setChatOpen(false)
                  setSelectedCategory(null)
                }}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="h-5 w-5 text-[#a3a3a3]" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {!selectedCategory ? (
                /* Category Selection */
                <div className="space-y-3">
                  <p className="text-sm text-[#a3a3a3] mb-4">Choose a category to see relevant questions:</p>
                  {QUESTION_CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all text-left group"
                    >
                      <div className={`p-3 rounded-lg ${category.bgColor}`}>
                        <category.icon className={`h-5 w-5 ${category.color}`} />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-white">{category.label}</span>
                        <p className="text-xs text-[#a3a3a3] mt-0.5">{category.questions.length} questions</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-[#a3a3a3] group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              ) : (
                /* Questions List */
                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="flex items-center gap-2 text-sm text-[#a3a3a3] hover:text-white transition-colors mb-4"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                    Back to categories
                  </button>
                  
                  {QUESTION_CATEGORIES.find(c => c.id === selectedCategory)?.questions.map((question, index) => (
                    <Link
                      key={index}
                      href={`/chat?q=${encodeURIComponent(question)}`}
                      className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all group"
                    >
                      <MessageSquare className="h-4 w-4 text-[#a3a3a3] flex-shrink-0" />
                      <span className="text-sm text-[#e5e5e5]">{question}</span>
                      <ChevronRight className="h-4 w-4 text-[#a3a3a3] ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 bg-white/[0.02]">
              <Link
                href="/chat"
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                Start Free Chat
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Button (Mobile) */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 md:hidden p-4 rounded-full bg-white text-black shadow-lg hover:scale-105 transition-transform"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    </div>
  )
}
