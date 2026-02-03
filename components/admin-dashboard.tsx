"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Upload,
  Database,
  BarChart3,
  AlertCircle,
  FileText,
  X,
  Loader2,
  Eye,
  EyeOff,
  LogOut,
  Settings,
  Trash2,
  ImageIcon,
  Video,
  Play,
  Layers,
  Plus,
  Save,
  Briefcase,
  GraduationCap,
  FolderKanban,
  Lightbulb,
  Award,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Link from "next/link"

interface UploadedDocument {
  id: string
  name: string
  size: number
  uploadedAt: string
  url: string
}

interface StoredChunk {
  id: string
  content: string
  sourceFile: string
  chunkIndex: number
  tokenCount: number
  createdAt: string
}

interface MediaItem {
  id: string
  url: string
  filename: string
  type: "image" | "video"
  mimeType: string
  title: string
  description: string
  tags: string[]
  size: number
  uploadedAt: string
}

interface DetailPageContent {
  overview?: string
  highlights?: string[]
  achievements?: string[]
  subjects?: string[]
  metrics?: { label: string; value: string }[]
  links?: { label: string; url: string }[]
}

export function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedDocument[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false)
  const [processError, setProcessError] = useState<string | null>(null)
  const [processSuccess, setProcessSuccess] = useState<string | null>(null)
  const [storedChunks, setStoredChunks] = useState<StoredChunk[]>([])
  const [totalChunks, setTotalChunks] = useState(0)
  const [isLoadingChunks, setIsLoadingChunks] = useState(false)

  // Analytics state
  const [analytics, setAnalytics] = useState<any>({
    summary: { totalQueries: 0, todayQueries: 0, chunksStored: 0 },
    topQuestions: [],
    recentInteractions: [],
  })
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)

  // Settings state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Media state
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [isLoadingMedia, setIsLoadingMedia] = useState(false)
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)
  const [mediaTitle, setMediaTitle] = useState("")
  const [mediaDescription, setMediaDescription] = useState("")
  const [mediaTags, setMediaTags] = useState("")

  // Detail Pages state
  const [selectedDetailType, setSelectedDetailType] = useState<string>("experience")
  const [selectedDetailSlug, setSelectedDetailSlug] = useState<string>("")
  const [detailContent, setDetailContent] = useState<DetailPageContent>({})
  const [isSavingDetail, setIsSavingDetail] = useState(false)
  const [detailSaveSuccess, setDetailSaveSuccess] = useState(false)

  // Available cards for each type (must match slugs in /app/design/page.tsx)
  const DETAIL_CARDS: Record<string, { slug: string; title: string }[]> = {
    experience: [
      { slug: "senior-pm-tech-company", title: "Senior Product Manager - Tech Company" },
      { slug: "pm-startup-inc", title: "Product Manager - Startup Inc" },
      { slug: "software-engineer-enterprise", title: "Software Engineer - Enterprise Corp" },
    ],
    education: [
      { slug: "mba-business-school", title: "MBA - Business School" },
      { slug: "btech-computer-science", title: "B.Tech Computer Science - University" },
    ],
    project: [
      { slug: "ai-analytics-platform", title: "AI-Powered Analytics Platform" },
      { slug: "ecommerce-personalization", title: "E-commerce Personalization Engine" },
      { slug: "developer-platform", title: "Developer Platform" },
    ],
    "case-study": [
      { slug: "scaling-b2b-saas", title: "Scaling a B2B SaaS Product" },
      { slug: "reducing-customer-churn", title: "Reducing Customer Churn" },
    ],
    certification: [
      { slug: "aws-solutions-architect", title: "AWS Solutions Architect" },
      { slug: "product-management-certificate", title: "Product Management Certificate" },
      { slug: "google-analytics", title: "Google Analytics Certified" },
      { slug: "scrum-master", title: "Scrum Master Certified" },
    ],
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError("")

    try {
      const response = await fetch("/api/auth/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        setIsAuthenticated(true)
        setPassword("")
      } else {
        setAuthError("Invalid password. Please try again.")
      }
    } catch {
      setAuthError("Authentication failed. Please try again.")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setPassword("")
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")
    setPasswordSuccess("")

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match")
      return
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      return
    }

    setIsChangingPassword(true)

    try {
      const response = await fetch("/api/auth/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      if (response.ok) {
        setPasswordSuccess("Password changed successfully!")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        const data = await response.json()
        setPasswordError(data.error || "Failed to change password")
      }
    } catch {
      setPasswordError("Failed to change password. Please try again.")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true)
    setUploadError(null)
    const newProgress: { [key: string]: number } = {}

    try {
      const allowedTypes = [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "text/plain",
      ]

      const validFiles: File[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        if (!allowedTypes.includes(file.type) && !file.name.endsWith(".txt") && !file.name.endsWith(".docx")) {
          throw new Error(`"${file.name}" is not a valid file type. Please upload Word or text files.`)
        }

        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`"${file.name}" is too large. File size must be less than 10MB.`)
        }

        validFiles.push(file)
        newProgress[file.name] = 0
      }

      setUploadProgress(newProgress)

      const uploadPromises = validFiles.map(async (file) => {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Failed to upload "${file.name}"`)
        }

        const data = await response.json()
        
        console.log("[v0] Upload response:", JSON.stringify(data))

        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }))

        if (!data.url) {
          throw new Error(`Upload succeeded but no URL returned for "${file.name}"`)
        }

        return {
          id: data.id || Date.now().toString() + Math.random().toString(),
          name: file.name,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          url: data.url,
        }
      })

      const uploadedDocs = await Promise.all(uploadPromises)
      setUploadedFiles((prev) => [...prev, ...uploadedDocs])
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setIsUploading(false)
      setUploadProgress({})
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files)
    }
    e.target.value = ""
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileUpload(files)
    }
  }

  const handleDeleteFile = async (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const handleProcessDocuments = async () => {
    if (uploadedFiles.length === 0) {
      setProcessError("No documents to process. Please upload files first.")
      return
    }

    setIsProcessing(true)
    setProcessError(null)
    setProcessSuccess(null)

    try {
      const documentsPayload = uploadedFiles.map((f) => ({ name: f.name, url: f.url }))
      console.log("[v0] Processing documents:", JSON.stringify(documentsPayload))
      
      const response = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documents: documentsPayload,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Processing failed")
      }

      const errors = data.errors?.length > 0 ? `\nWarnings: ${data.errors.join(", ")}` : ""
      setProcessSuccess(
        `Processed ${data.processed} document(s) into ${data.chunks} chunks in ${data.processingTime}ms.${errors}`
      )
      setUploadedFiles([])
      fetchStoredChunks()
    } catch (error) {
      setProcessError(error instanceof Error ? error.message : "Processing failed")
    } finally {
      setIsProcessing(false)
    }
  }

  const fetchStoredChunks = async () => {
    setIsLoadingChunks(true)
    try {
      const response = await fetch("/api/process")
      const data = await response.json()
      if (data.chunks) {
        setStoredChunks(data.chunks)
        setTotalChunks(data.totalCount || data.chunks.length)
      }
    } catch {
      // Ignore errors
    } finally {
      setIsLoadingChunks(false)
    }
  }

  const handleDeleteChunk = async (chunkId: string) => {
    if (!confirm("Are you sure you want to delete this chunk?")) return
    
    try {
      const response = await fetch(`/api/chunks?id=${encodeURIComponent(chunkId)}`, {
        method: "DELETE",
      })
      const data = await response.json()
      if (data.success) {
        setStoredChunks((prev) => prev.filter((c) => c.id !== chunkId))
        setTotalChunks((prev) => prev - 1)
      } else {
        alert("Failed to delete chunk: " + (data.error || "Unknown error"))
      }
    } catch {
      alert("Failed to delete chunk")
    }
  }

  const handleDeleteChunksBySource = async (sourceFile: string) => {
    if (!confirm(`Delete all chunks from "${sourceFile}"?`)) return
    
    try {
      const response = await fetch(`/api/chunks?source=${encodeURIComponent(sourceFile)}`, {
        method: "DELETE",
      })
      const data = await response.json()
      if (data.success) {
        setStoredChunks((prev) => prev.filter((c) => c.sourceFile !== sourceFile))
        setTotalChunks((prev) => prev - data.deleted)
        alert(`Deleted ${data.deleted} chunks from ${sourceFile}`)
      } else {
        alert("Failed to delete chunks: " + (data.error || "Unknown error"))
      }
    } catch {
      alert("Failed to delete chunks")
    }
  }

  const fetchAnalytics = async () => {
    setIsLoadingAnalytics(true)
    try {
      const response = await fetch("/api/analytics")
      const data = await response.json()
      if (data) {
        setAnalytics(data)
      }
    } catch {
      // Ignore errors
    } finally {
      setIsLoadingAnalytics(false)
    }
  }

  const handleDeleteAllData = async () => {
    if (!confirm("Are you sure you want to delete ALL data? This cannot be undone.")) {
      return
    }

    try {
      const response = await fetch("/api/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "DELETE_ALL_DATA" }),
      })
      const data = await response.json()
      if (data.success) {
        alert(
          `Cleanup complete!\nChunks deleted: ${data.results.vector.deleted}\nCache keys deleted: ${data.results.redis.deleted}\nBlobs deleted: ${data.results.blob.deleted}`
        )
        fetchStoredChunks()
        fetchAnalytics()
        fetchMedia()
      } else {
        alert("Cleanup failed: " + (data.error || "Unknown error"))
      }
    } catch {
      alert("Cleanup failed")
    }
  }

  // Media handlers
  const fetchMedia = async () => {
    setIsLoadingMedia(true)
    try {
      const response = await fetch("/api/media")
      const data = await response.json()
      if (data.media) {
        setMediaItems(data.media)
      }
    } catch {
      // Ignore errors
    } finally {
      setIsLoadingMedia(false)
    }
  }

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploadingMedia(true)

    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("title", mediaTitle || file.name)
      formData.append("description", mediaDescription)
      formData.append("tags", mediaTags)

      try {
        const response = await fetch("/api/media", {
          method: "POST",
          body: formData,
        })
        const data = await response.json()
        if (data.success && data.media) {
          setMediaItems((prev) => [data.media, ...prev])
        } else {
          alert(`Failed to upload ${file.name}: ${data.error || "Unknown error"}`)
        }
      } catch {
        alert(`Failed to upload ${file.name}`)
      }
    }

    setIsUploadingMedia(false)
    setMediaTitle("")
    setMediaDescription("")
    setMediaTags("")
    e.target.value = ""
  }

  const handleDeleteMedia = async (id: string) => {
    if (!confirm("Delete this media item?")) return

    try {
      const response = await fetch(`/api/media?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      })
      const data = await response.json()
      if (data.success) {
        setMediaItems((prev) => prev.filter((m) => m.id !== id))
      } else {
        alert("Failed to delete: " + (data.error || "Unknown error"))
      }
    } catch {
      alert("Failed to delete media")
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchStoredChunks()
      fetchAnalytics()
      fetchMedia()
    }
  }, [isAuthenticated])

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
        <Card className="w-full max-w-md p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="text-center space-y-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto">
                <Database className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Admin Access</h1>
              <p className="text-muted-foreground">Enter your admin password to continue</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{authError}</p>
              </div>
            )}

            <Button type="submit" className="w-full">
              Login to Dashboard
            </Button>

            <Button variant="ghost" asChild className="w-full">
              <Link href="/">Back to Home</Link>
            </Button>
          </form>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">RAG Chatbot Management</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/">View Chatbot</Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Upload</span>
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Media</span>
            </TabsTrigger>
            <TabsTrigger value="detail-pages" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Detail Pages</span>
            </TabsTrigger>
            <TabsTrigger value="chunks" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Chunks</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Upload Documents</h2>
                  <p className="text-muted-foreground">
                    Upload Word documents or text files containing your career stories. Documents will be chunked into
                    200-400 token segments for optimal retrieval.
                  </p>
                </div>

                <label htmlFor="file-upload" onDragOver={handleDragOver} onDrop={handleDrop} className="block">
                  <Card className="border-dashed border-2 p-12 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                    {isUploading ? (
                      <>
                        <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                        <h3 className="font-semibold mb-2">Uploading...</h3>
                        <div className="space-y-2 max-w-md mx-auto">
                          {Object.entries(uploadProgress).map(([filename, progress]) => (
                            <div key={filename} className="text-left">
                              <p className="text-xs text-muted-foreground mb-1 truncate">{filename}</p>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary transition-all duration-300"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-semibold mb-2">Drag and drop your files here</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          or click to browse (Word or Text files - max 10MB)
                        </p>
                        <Button type="button">Select Files</Button>
                      </>
                    )}
                  </Card>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".doc,.docx,.txt"
                    onChange={handleFileInputChange}
                    disabled={isUploading}
                    multiple
                    className="hidden"
                  />
                </label>

                {uploadError && (
                  <Card className="p-4 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-red-900 dark:text-red-100">Upload Error</h4>
                        <p className="text-sm text-red-800 dark:text-red-200">{uploadError}</p>
                      </div>
                    </div>
                  </Card>
                )}

                {uploadedFiles.length > 0 && (
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Uploaded Documents ({uploadedFiles.length})</h3>
                      <Button onClick={handleProcessDocuments} disabled={isProcessing} className="gap-2">
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Database className="h-4 w-4" />
                            Process & Create Embeddings
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {uploadedFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{file.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatFileSize(file.size)} - {new Date(file.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteFile(file.id)}
                            className="flex-shrink-0"
                            disabled={isProcessing}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {processError && (
                  <Card className="p-4 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-red-900 dark:text-red-100">Processing Error</h4>
                        <p className="text-sm text-red-800 dark:text-red-200">{processError}</p>
                      </div>
                    </div>
                  </Card>
                )}

                {processSuccess && (
                  <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                    <div className="flex gap-3">
                      <Database className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-green-900 dark:text-green-100">Processing Complete</h4>
                        <p className="text-sm text-green-800 dark:text-green-200 whitespace-pre-line">
                          {processSuccess}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media" className="space-y-6">
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Media Library</h2>
                  <p className="text-muted-foreground">
                    Upload images and videos of your projects, certificates, or work samples. These can be displayed in chat when recruiters ask relevant questions.
                  </p>
                </div>

                {/* Media Upload Form */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Title</label>
                    <Input
                      placeholder="e.g., Project Dashboard Screenshot"
                      value={mediaTitle}
                      onChange={(e) => setMediaTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Tags (comma separated)</label>
                    <Input
                      placeholder="e.g., project, dashboard, analytics"
                      value={mediaTags}
                      onChange={(e) => setMediaTags(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Description</label>
                  <Input
                    placeholder="Brief description of this media"
                    value={mediaDescription}
                    onChange={(e) => setMediaDescription(e.target.value)}
                  />
                </div>

                <label htmlFor="media-upload" className="block">
                  <Card className="border-dashed border-2 p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                    {isUploadingMedia ? (
                      <>
                        <Loader2 className="h-10 w-10 text-muted-foreground mx-auto mb-3 animate-spin" />
                        <p className="font-medium">Uploading media...</p>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-center gap-4 mb-3">
                          <ImageIcon className="h-10 w-10 text-muted-foreground" />
                          <Video className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <p className="font-medium mb-1">Click or drag to upload images/videos</p>
                        <p className="text-sm text-muted-foreground">
                          Images: JPG, PNG, GIF (max 10MB) | Videos: MP4, WebM (max 100MB)
                        </p>
                      </>
                    )}
                  </Card>
                  <input
                    id="media-upload"
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleMediaUpload}
                    className="hidden"
                    disabled={isUploadingMedia}
                  />
                </label>
              </div>
            </Card>

            {/* Media Gallery */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Uploaded Media</h2>
                  <p className="text-sm text-muted-foreground">{mediaItems.length} items</p>
                </div>
                <Button variant="outline" onClick={fetchMedia} disabled={isLoadingMedia}>
                  {isLoadingMedia ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
                </Button>
              </div>

              {isLoadingMedia ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Loading media...</p>
                </div>
              ) : mediaItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No media uploaded yet. Add images or videos of your work.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {mediaItems.map((item) => (
                    <Card key={item.id} className="overflow-hidden group relative">
                      {item.type === "image" ? (
                        <img
                          src={item.url || "/placeholder.svg"}
                          alt={item.title}
                          className="w-full h-40 object-cover"
                        />
                      ) : (
                        <div className="w-full h-40 bg-muted flex items-center justify-center relative">
                          <video
                            src={item.url}
                            className="w-full h-full object-cover"
                            muted
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Play className="h-10 w-10 text-white" />
                          </div>
                        </div>
                      )}
                      <div className="p-3">
                        <p className="font-medium text-sm truncate">{item.title}</p>
                        {item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.tags.slice(0, 3).map((tag, i) => (
                              <span key={i} className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMedia(item.id)}
                        className="absolute top-2 right-2 h-8 w-8 p-0 bg-black/50 text-white hover:bg-red-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Detail Pages Tab */}
          <TabsContent value="detail-pages" className="space-y-6">
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Detail Pages Content</h2>
                  <p className="text-muted-foreground">
                    Add detailed content for each card on your portfolio. Only filled sections will be displayed.
                  </p>
                </div>

                {/* Card Selection */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select
                      value={selectedDetailType}
                      onChange={(e) => {
                        setSelectedDetailType(e.target.value)
                        setSelectedDetailSlug("")
                        setDetailContent({})
                        setDetailSaveSuccess(false)
                      }}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="experience">Experience</option>
                      <option value="education">Education</option>
                      <option value="project">Projects</option>
                      <option value="case-study">Case Studies</option>
                      <option value="certification">Certifications</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Select Card</Label>
                    <select
                      value={selectedDetailSlug}
                      onChange={async (e) => {
                        const slug = e.target.value
                        setSelectedDetailSlug(slug)
                        setDetailSaveSuccess(false)
                        if (slug) {
                          // Fetch existing content
                          try {
                            const res = await fetch(`/api/detail/${selectedDetailType}/${slug}`)
                            if (res.ok) {
                              const data = await res.json()
                              setDetailContent(data.content || {})
                            } else {
                              setDetailContent({})
                            }
                          } catch {
                            setDetailContent({})
                          }
                        }
                      }}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select a card...</option>
                      {DETAIL_CARDS[selectedDetailType]?.map((card) => (
                        <option key={card.slug} value={card.slug}>
                          {card.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedDetailSlug && (
                  <div className="space-y-6 pt-4 border-t">
                    {/* Overview */}
                    <div className="space-y-2">
                      <Label>Overview</Label>
                      <Textarea
                        placeholder="Detailed description of this experience, project, or education..."
                        value={detailContent.overview || ""}
                        onChange={(e) => setDetailContent({ ...detailContent, overview: e.target.value })}
                        rows={4}
                      />
                    </div>

                    {/* Highlights */}
                    <div className="space-y-2">
                      <Label>Key Highlights (one per line)</Label>
                      <Textarea
                        placeholder="Led team of 8 engineers&#10;Increased revenue by 40%&#10;Launched 3 products"
                        value={detailContent.highlights?.join("\n") || ""}
                        onChange={(e) => setDetailContent({ 
                          ...detailContent, 
                          highlights: e.target.value.split("\n").filter(h => h.trim()) 
                        })}
                        rows={4}
                      />
                    </div>

                    {/* Achievements */}
                    <div className="space-y-2">
                      <Label>Achievements (one per line)</Label>
                      <Textarea
                        placeholder="Best Product Award 2023&#10;Dean's List&#10;Patent holder"
                        value={detailContent.achievements?.join("\n") || ""}
                        onChange={(e) => setDetailContent({ 
                          ...detailContent, 
                          achievements: e.target.value.split("\n").filter(a => a.trim()) 
                        })}
                        rows={3}
                      />
                    </div>

                    {/* Subjects (for Education) */}
                    {selectedDetailType === "education" && (
                      <div className="space-y-2">
                        <Label>Subjects/Coursework (comma-separated)</Label>
                        <Input
                          placeholder="Machine Learning, Product Strategy, Finance..."
                          value={detailContent.subjects?.join(", ") || ""}
                          onChange={(e) => setDetailContent({ 
                            ...detailContent, 
                            subjects: e.target.value.split(",").map(s => s.trim()).filter(s => s) 
                          })}
                        />
                      </div>
                    )}

                    {/* Metrics */}
                    <div className="space-y-2">
                      <Label>Metrics (format: Label|Value, one per line)</Label>
                      <Textarea
                        placeholder="Revenue Growth|40%&#10;Team Size|8 engineers&#10;Users|2M+"
                        value={detailContent.metrics?.map(m => `${m.label}|${m.value}`).join("\n") || ""}
                        onChange={(e) => setDetailContent({ 
                          ...detailContent, 
                          metrics: e.target.value.split("\n")
                            .filter(line => line.includes("|"))
                            .map(line => {
                              const [label, value] = line.split("|")
                              return { label: label?.trim() || "", value: value?.trim() || "" }
                            })
                        })}
                        rows={3}
                      />
                    </div>

                    {/* Links */}
                    <div className="space-y-2">
                      <Label>Links (format: Label|URL, one per line)</Label>
                      <Textarea
                        placeholder="GitHub|https://github.com/...&#10;Live Demo|https://..."
                        value={detailContent.links?.map(l => `${l.label}|${l.url}`).join("\n") || ""}
                        onChange={(e) => setDetailContent({ 
                          ...detailContent, 
                          links: e.target.value.split("\n")
                            .filter(line => line.includes("|"))
                            .map(line => {
                              const [label, url] = line.split("|")
                              return { label: label?.trim() || "", url: url?.trim() || "" }
                            })
                        })}
                        rows={3}
                      />
                    </div>

                    {/* Save Button */}
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={async () => {
                          setIsSavingDetail(true)
                          setDetailSaveSuccess(false)
                          try {
                            const res = await fetch(`/api/detail/${selectedDetailType}/${selectedDetailSlug}`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(detailContent)
                            })
                            if (res.ok) {
                              setDetailSaveSuccess(true)
                            }
                          } catch (error) {
                            console.error("Error saving detail:", error)
                          } finally {
                            setIsSavingDetail(false)
                          }
                        }}
                        disabled={isSavingDetail}
                      >
                        {isSavingDetail ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Content
                      </Button>
                      
                      {detailSaveSuccess && (
                        <span className="text-sm text-green-600">Content saved successfully!</span>
                      )}
                      
                      <Link
                        href={`/detail/${selectedDetailType}/${selectedDetailSlug}`}
                        target="_blank"
                        className="text-sm text-muted-foreground hover:text-foreground underline"
                      >
                        Preview Page
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Chunks Tab */}
          <TabsContent value="chunks" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Stored Chunks</h2>
                  <p className="text-sm text-muted-foreground">{totalChunks} chunks in vector database</p>
                </div>
                <Button variant="outline" onClick={fetchStoredChunks} disabled={isLoadingChunks}>
                  {isLoadingChunks ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
                </Button>
              </div>

              {isLoadingChunks ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Loading chunks...</p>
                </div>
              ) : storedChunks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No chunks stored yet. Upload and process documents to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {storedChunks.map((chunk) => (
                    <Card key={chunk.id} className="p-4 bg-muted/50">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleDeleteChunksBySource(chunk.sourceFile)}
                              className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 transition-colors"
                              title="Click to delete all chunks from this file"
                            >
                              {chunk.sourceFile}
                            </button>
                            <span className="text-xs text-muted-foreground">Chunk #{chunk.chunkIndex + 1}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{chunk.tokenCount} tokens</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteChunk(chunk.id)}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
                              title="Delete this chunk"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm line-clamp-3">{chunk.content}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
              <Button variant="outline" onClick={fetchAnalytics} disabled={isLoadingAnalytics}>
                {isLoadingAnalytics ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="p-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Queries</p>
                  <p className="text-3xl font-bold">{analytics.summary?.totalQueries || 0}</p>
                </div>
              </Card>
              <Card className="p-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Queries Today</p>
                  <p className="text-3xl font-bold">{analytics.summary?.todayQueries || 0}</p>
                </div>
              </Card>
              <Card className="p-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Chunks Stored</p>
                  <p className="text-3xl font-bold">{analytics.summary?.chunksStored || totalChunks}</p>
                </div>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Top Questions</h3>
                {analytics.topQuestions?.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.topQuestions.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm flex-1 truncate mr-4">{item.question}</p>
                        <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                          {item.count}x
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No questions asked yet</p>
                  </div>
                )}
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Interactions</h3>
                {analytics.recentInteractions?.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {analytics.recentInteractions.slice(0, 10).map((item: any, idx: number) => (
                      <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{item.visitorName || "Anonymous"}</p>
                            {item.visitorCompany && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                {item.visitorCompany}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : ""}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{item.question}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No interactions yet</p>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Change Admin Password</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Update your admin dashboard password. Make sure to use a strong password.
              </p>

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <label htmlFor="current-password" className="text-sm font-medium">
                    Current Password
                  </label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="new-password" className="text-sm font-medium">
                    New Password
                  </label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirm-password" className="text-sm font-medium">
                    Confirm New Password
                  </label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                {passwordError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{passwordError}</p>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400">{passwordSuccess}</p>
                  </div>
                )}

                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </form>
            </Card>

            <Card className="p-6 border-red-200 dark:border-red-900">
              <h2 className="text-xl font-semibold mb-2 text-red-600 dark:text-red-400">Danger Zone</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Clear all data including chunks, embeddings, cache, and uploaded files. This cannot be undone.
              </p>
              <Button variant="destructive" onClick={handleDeleteAllData} className="gap-2">
                <Trash2 className="h-4 w-4" />
                Delete All Data
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
