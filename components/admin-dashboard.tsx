"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Database, MessageSquare, BarChart3, AlertCircle, FileText, X, Loader2 } from "lucide-react"
import Link from "next/link"

interface UploadedDocument {
  id: string
  name: string
  size: number
  uploadedAt: string
  url: string
}

export function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedDocument[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})

  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true)
    setUploadError(null)
    const newProgress: { [key: string]: number } = {}

    try {
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "text/plain",
      ]

      const validFiles: File[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        if (!allowedTypes.includes(file.type)) {
          throw new Error(`"${file.name}" is not a valid file type. Please upload PDF, Word, or text files.`)
        }

        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`"${file.name}" is too large. File size must be less than 10MB.`)
        }

        validFiles.push(file)
        newProgress[file.name] = 0
      }

      setUploadProgress(newProgress)

      const uploadPromises = validFiles.map(async (file) => {
        const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
          method: "POST",
          body: file,
        })

        if (!response.ok) {
          throw new Error(`Failed to upload "${file.name}"`)
        }

        const data = await response.json()

        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }))

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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center space-y-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto">
              <Database className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Admin Access Required</h1>
            <p className="text-muted-foreground">Authentication will be implemented in the next phase.</p>
            <Button onClick={() => setIsAuthenticated(true)} className="w-full">
              Continue to Dashboard (Temporary)
            </Button>
            <Button variant="ghost" asChild className="w-full">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
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
              <p className="text-sm text-muted-foreground">Manage your career chatbot</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/">View Chatbot</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Upload</span>
            </TabsTrigger>
            <TabsTrigger value="stories" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Stories</span>
            </TabsTrigger>
            <TabsTrigger value="review" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Review</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Upload Story Bank</h2>
                  <p className="text-muted-foreground">
                    Upload PDF, Word documents, or text files containing your career stories. You can upload multiple
                    files at once.
                  </p>
                </div>

                <label htmlFor="file-upload" onDragOver={handleDragOver} onDrop={handleDrop} className="block">
                  <Card className="border-dashed border-2 p-12 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                    {isUploading ? (
                      <>
                        <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                        <h3 className="font-semibold mb-2">Uploading...</h3>
                        <p className="text-sm text-muted-foreground mb-4">Please wait</p>
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
                          or click to browse (PDF, Word, or Text - max 10MB per file)
                        </p>
                        <Button type="button">Select Files</Button>
                      </>
                    )}
                  </Card>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
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
                    <h3 className="font-semibold mb-3">Uploaded Documents ({uploadedFiles.length})</h3>
                    <div className="space-y-2">
                      {uploadedFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{file.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteFile(file.id)}
                            className="flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100">Setup Required</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Before uploading, please add your environment variables in the Vars section:
                      </p>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 list-disc list-inside space-y-1 mt-2">
                        <li>
                          <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded">GEMINI_API_KEY</code> - Your
                          Google Gemini API key
                        </li>
                        <li>
                          <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded">UPSTASH_VECTOR_REST_URL</code>{" "}
                          - Upstash Vector database URL
                        </li>
                        <li>
                          <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded">
                            UPSTASH_VECTOR_REST_TOKEN
                          </code>{" "}
                          - Upstash Vector token
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="stories" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Story Bank</h2>
              <div className="text-center py-12 text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No stories uploaded yet. Upload your story bank to get started.</p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="review" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Pending Reviews</h2>
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pending reviews. AI-generated answers will appear here for your approval.</p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="p-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                  <p className="text-3xl font-bold">0</p>
                </div>
              </Card>
              <Card className="p-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Questions Asked</p>
                  <p className="text-3xl font-bold">0</p>
                </div>
              </Card>
              <Card className="p-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Stories in Bank</p>
                  <p className="text-3xl font-bold">0</p>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Most Asked Questions</h2>
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Analytics will appear here once users start chatting.</p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
