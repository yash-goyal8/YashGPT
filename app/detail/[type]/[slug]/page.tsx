"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Briefcase, GraduationCap, FolderKanban, Lightbulb, Award, Calendar, ExternalLink, Play, FileText, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DetailContent {
  // Base fields (from card data)
  title: string
  subtitle?: string
  period?: string
  description?: string
  tags?: string[]
  
  // Extended content (from admin)
  overview?: string
  highlights?: string[]
  achievements?: string[]
  subjects?: string[]
  metrics?: { label: string; value: string }[]
  links?: { label: string; url: string }[]
  media?: { 
    id: string
    type: "image" | "video" | "pdf"
    url: string
    title: string
    description?: string
  }[]
  relatedItems?: { type: string; slug: string; title: string }[]
}

interface DetailData {
  type: string
  slug: string
  content: DetailContent
}

const TYPE_CONFIG = {
  experience: {
    label: "Experience",
    icon: Briefcase,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
  },
  education: {
    label: "Education",
    icon: GraduationCap,
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
  },
  project: {
    label: "Project",
    icon: FolderKanban,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  "case-study": {
    label: "Case Study",
    icon: Lightbulb,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  certification: {
    label: "Certification",
    icon: Award,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
  },
}

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-violet-500/5 rounded-full blur-3xl" />
    </div>
  )
}

export default function DetailPage() {
  const params = useParams()
  const type = params.type as string
  const slug = params.slug as string
  
  const [data, setData] = useState<DetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const config = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG]
  const Icon = config?.icon || Briefcase

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await fetch(`/api/detail/${type}/${slug}`)
        if (!res.ok) {
          if (res.status === 404) {
            setError("not-found")
          } else {
            throw new Error("Failed to fetch")
          }
          return
        }
        const json = await res.json()
        setData(json)
      } catch {
        setError("error")
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [type, slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10" />
          <div className="h-4 w-32 bg-white/10 rounded" />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#a3a3a3] mb-4">Content not available yet</p>
          <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/5">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Portfolio
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const { content } = data

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white relative">
      <AnimatedBackground />
      
      {/* Header */}
      <header className="relative z-10 px-3 lg:px-4 py-3 lg:py-4">
        <div className="mx-3 lg:mx-4">
          <div className="max-w-5xl xl:max-w-6xl mx-auto px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl bg-[#0a0a0b]/60 backdrop-blur-xl border border-white/10 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 lg:gap-3 group">
              <ArrowLeft className="h-4 w-4 lg:h-5 lg:w-5 text-[#a3a3a3] group-hover:text-white transition-colors" />
              <span className="text-sm lg:text-base text-[#a3a3a3] group-hover:text-white transition-colors">Back to Portfolio</span>
            </Link>
            
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config?.bgColor || 'bg-white/5'}`}>
              <Icon className={`h-4 w-4 ${config?.color || 'text-white'}`} />
              <span className={`text-xs font-medium ${config?.color || 'text-white'}`}>{config?.label || type}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-3 lg:px-4 py-8 lg:py-12">
        <div className="mx-3 lg:mx-4">
          <div className="max-w-5xl xl:max-w-6xl mx-auto px-4 lg:px-6">
            
            {/* Title Section */}
            <div className="mb-8 lg:mb-12">
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 lg:p-4 rounded-xl lg:rounded-2xl ${config?.bgColor || 'bg-white/5'}`}>
                  <Icon className={`h-6 w-6 lg:h-8 lg:w-8 ${config?.color || 'text-white'}`} />
                </div>
                {content.period && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 text-[#a3a3a3]">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="text-xs lg:text-sm">{content.period}</span>
                  </div>
                )}
              </div>
              
              <h1 className="text-2xl lg:text-4xl font-bold text-white mb-2">{content.title}</h1>
              
              {content.subtitle && (
                <p className={`text-lg lg:text-xl ${config?.color || 'text-cyan-400'}`}>{content.subtitle}</p>
              )}
              
              {content.description && (
                <p className="text-sm lg:text-base text-[#a3a3a3] mt-4 max-w-3xl leading-relaxed">{content.description}</p>
              )}
              
              {content.tags && content.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {content.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 text-xs rounded-full bg-white/5 text-[#a3a3a3]">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Overview Section */}
            {content.overview && (
              <section className="mb-8 lg:mb-12">
                <h2 className="text-sm font-medium text-[#a3a3a3] uppercase tracking-wider mb-4">Overview</h2>
                <div className="p-4 lg:p-6 rounded-xl lg:rounded-2xl bg-white/[0.02] border border-white/5">
                  <p className="text-sm lg:text-base text-[#e5e5e5] leading-relaxed whitespace-pre-wrap">{content.overview}</p>
                </div>
              </section>
            )}

            {/* Highlights Section */}
            {content.highlights && content.highlights.length > 0 && (
              <section className="mb-8 lg:mb-12">
                <h2 className="text-sm font-medium text-[#a3a3a3] uppercase tracking-wider mb-4">Key Highlights</h2>
                <div className="p-4 lg:p-6 rounded-xl lg:rounded-2xl bg-white/[0.02] border border-white/5">
                  <ul className="space-y-3">
                    {content.highlights.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full ${config?.color?.replace('text-', 'bg-') || 'bg-cyan-400'}`} />
                        <span className="text-sm lg:text-base text-[#e5e5e5]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* Achievements Section */}
            {content.achievements && content.achievements.length > 0 && (
              <section className="mb-8 lg:mb-12">
                <h2 className="text-sm font-medium text-[#a3a3a3] uppercase tracking-wider mb-4">Achievements</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {content.achievements.map((item, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
                      <Award className={`h-5 w-5 ${config?.color || 'text-cyan-400'}`} />
                      <span className="text-sm text-[#e5e5e5]">{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Subjects Section (for Education) */}
            {content.subjects && content.subjects.length > 0 && (
              <section className="mb-8 lg:mb-12">
                <h2 className="text-sm font-medium text-[#a3a3a3] uppercase tracking-wider mb-4">Subjects & Coursework</h2>
                <div className="flex flex-wrap gap-2">
                  {content.subjects.map((subject) => (
                    <span key={subject} className="px-4 py-2 text-sm rounded-lg bg-white/[0.03] border border-white/5 text-[#e5e5e5]">
                      {subject}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Metrics Section */}
            {content.metrics && content.metrics.length > 0 && (
              <section className="mb-8 lg:mb-12">
                <h2 className="text-sm font-medium text-[#a3a3a3] uppercase tracking-wider mb-4">Key Metrics</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {content.metrics.map((metric, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                      <p className={`text-2xl lg:text-3xl font-bold ${config?.color || 'text-cyan-400'}`}>{metric.value}</p>
                      <p className="text-xs text-[#a3a3a3] mt-1">{metric.label}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Media Section */}
            {content.media && content.media.length > 0 && (
              <section className="mb-8 lg:mb-12">
                <h2 className="text-sm font-medium text-[#a3a3a3] uppercase tracking-wider mb-4">Media & Documents</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {content.media.map((item) => (
                    <a 
                      key={item.id} 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all"
                    >
                      <div className="aspect-video rounded-lg bg-white/5 mb-3 flex items-center justify-center overflow-hidden">
                        {item.type === "video" && <Play className="h-8 w-8 text-[#a3a3a3] group-hover:text-white transition-colors" />}
                        {item.type === "pdf" && <FileText className="h-8 w-8 text-[#a3a3a3] group-hover:text-white transition-colors" />}
                        {item.type === "image" && <ImageIcon className="h-8 w-8 text-[#a3a3a3] group-hover:text-white transition-colors" />}
                      </div>
                      <p className="text-sm font-medium text-white">{item.title}</p>
                      {item.description && (
                        <p className="text-xs text-[#a3a3a3] mt-1">{item.description}</p>
                      )}
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Links Section */}
            {content.links && content.links.length > 0 && (
              <section className="mb-8 lg:mb-12">
                <h2 className="text-sm font-medium text-[#a3a3a3] uppercase tracking-wider mb-4">Links</h2>
                <div className="flex flex-wrap gap-3">
                  {content.links.map((link, i) => (
                    <a 
                      key={i}
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.03] border border-white/5 hover:border-white/10 hover:bg-white/[0.06] transition-all text-sm text-white"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {link.label}
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Related Items Section */}
            {content.relatedItems && content.relatedItems.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-[#a3a3a3] uppercase tracking-wider mb-4">Related</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {content.relatedItems.map((item, i) => (
                    <Link 
                      key={i}
                      href={`/detail/${item.type}/${item.slug}`}
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all"
                    >
                      <p className="text-xs text-[#a3a3a3] uppercase tracking-wider mb-1">{item.type.replace('-', ' ')}</p>
                      <p className="text-sm font-medium text-white">{item.title}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

          </div>
        </div>
      </main>
    </div>
  )
}
