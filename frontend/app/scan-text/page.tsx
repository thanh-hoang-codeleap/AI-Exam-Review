"use client"

import type React from "react"

import { useState, useRef } from "react"
import { ArrowLeft, Upload, FileText, Check, X, ScanLine, Camera, Clipboard, Download } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { useSearchParams } from "next/navigation"
import DocumentScanner from "@/components/exams/document-scanner"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import axios from "axios"

// Define our data structure types
interface Class {
  id: string
  title: string
  exams: {
    id: string
    title: string
    status: string
  }[]
}

interface Student {
  id: string
  name: string
}

interface UploadedFile {
  name: string
  size: string
  type: string
  progress: number
  status: "uploading" | "success" | "failed"
}

interface ServerResponse {
  success: boolean
  filename: string
  text: string
  excel: string
}

export default function ScanText() {
  const searchParams = useSearchParams()
  const classId = searchParams.get("classId")
  const studentId = searchParams.get("studentId")
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sample data
  const classes: Class[] = [
    {
      id: "class8a",
      title: "Class 8A",
      exams: [
        { id: "midterm", title: "Midterm Exam", status: "Completed" },
        { id: "final", title: "Final Exam", status: "In Progress" },
      ],
    },
    {
      id: "class7b",
      title: "Class 7B",
      exams: [
        { id: "midterm", title: "Midterm Exam", status: "Completed" },
        { id: "quiz", title: "Lab Quiz", status: "Completed" },
        { id: "final", title: "Final Exam", status: "Pending" },
      ],
    },
  ]

  // Sample student data
  const students: Student[] = [
    { id: "student1", name: "Emma Thompson" },
    { id: "student2", name: "Liam Johnson" },
    { id: "student3", name: "Olivia Davis" },
    { id: "student4", name: "Noah Wilson" },
    { id: "student5", name: "Ava Martinez" },
    { id: "student6", name: "Ethan Brown" },
    { id: "student7", name: "Sophia Lee" },
    { id: "student8", name: "Lucas Garcia" },
  ]

  const [docTitle, setDocTitle] = useState("")
  const [docType, setDocType] = useState("task")
  const [selectedClass, setSelectedClass] = useState(classId || "")
  const [selectedExam, setSelectedExam] = useState("")
  const [selectedStudent, setSelectedStudent] = useState(studentId || "")
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [recentScans, setRecentScans] = useState([
    {
      id: 1,
      title: "Grammar Test",
      student: "Emma Thompson",
      date: "Today, 10:23 AM",
      type: "task",
    },
    {
      id: 2,
      title: "Essay on Literature",
      student: "Liam Johnson",
      date: "Today, 09:45 AM",
      type: "text",
    },
    {
      id: 3,
      title: "Vocabulary Quiz",
      student: "Olivia Davis",
      date: "Yesterday",
      type: "task",
    },
  ])

  // Get the selected class object
  const currentClass = classes.find((c) => c.id === selectedClass)

  const [extractedText, setExtractedText] = useState<string>("")
  const [excelFilePath, setExcelFilePath] = useState<string | undefined>(undefined)

  // Get the selected exam
  const currentExam = currentClass?.exams.find((exam) => exam.id === selectedExam)

  // Handle file drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      handleFiles(files)

      // Clear the file input value so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Add a new state variable for tracking server processing state
  const [isProcessingServer, setIsProcessingServer] = useState(false)

  const copyToClipboard = () => {
    if (!extractedText) return

    navigator.clipboard
      .writeText(extractedText)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "The extracted text has been copied to your clipboard.",
          duration: 3000,
        })
      })
      .catch((error) => {
        console.error("Failed to copy text: ", error)
        toast({
          title: "Copy failed",
          description: "Could not copy text to clipboard. Please try again.",
          variant: "destructive",
        })
      })
  }

  const downloadExcelFile = () => {
    if (!excelFilePath) return

    try {
      // In a real application, you would make a request to download the file
      // For this example, we'll simulate downloading the file

      // Create a URL to the file on the server
      const fileUrl = `http://127.0.0.1:5000/download/${encodeURIComponent(excelFilePath)}`

      // Create a temporary link element to trigger the download
      const link = document.createElement("a")
      link.href = fileUrl
      link.setAttribute("download", excelFilePath.split("/").pop() || "analysis.xlsx")
      document.body.appendChild(link)

      // Trigger the download
      link.click()

      // Clean up
      document.body.removeChild(link)

      toast({
        title: "Download started",
        description: "Your Excel file is being downloaded.",
        duration: 3000,
      })
    } catch (error) {
      console.error("Failed to download Excel file: ", error)
      toast({
        title: "Download failed",
        description: "Could not download Excel file. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Update the handleFiles function to include server processing state
  const handleFiles = (files: File[]) => {
    try {
      setUploadedFiles([])
      setExtractedText("")
      setExcelFilePath(undefined)
      setIsProcessingServer(false) // Reset server processing state

      // Process each file
      const newFiles = files.map((file) => {
        // Format file size
        const size =
          file.size < 1024 * 1024
            ? `${(file.size / 1024).toFixed(2)} KB`
            : `${(file.size / (1024 * 1024)).toFixed(2)} MB`

        return {
          name: file.name,
          size,
          type: "document",
          progress: 0,
          status: "uploading" as const,
        }
      })

      setUploadedFiles(newFiles)

      // Simulate upload progress
      newFiles.forEach((file, index) => {
        const totalFiles = newFiles.length
        simulateFileUpload(index, totalFiles)
      })

      // After upload completes, send files to the server
      setTimeout(() => {
        setIsProcessingServer(true) // Set server processing state to true

        files.forEach(async (file) => {
          try {
            const formData = new FormData()
            formData.append("file", file)

            const response = await axios.post("http://127.0.0.1:5000/upload", formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            })

            setIsProcessingServer(false) // Set server processing state to false

            // Update to handle both text and excelFilePath in the response
            const serverResponse: ServerResponse = response.data
            setExtractedText(serverResponse.text)

            // Set the Excel file path if it exists in the response
            if (serverResponse.excel) {
              setExcelFilePath(serverResponse.excel)
            }

            toast({
              title: "Text extracted",
              description: "Successfully extracted text from document",
            })
          } catch (error) {
            setIsProcessingServer(false) // Set server processing state to false
            console.error("Error uploading file:", error instanceof Error ? error.message : String(error))
            toast({
              title: "Error",
              description: "There was a problem processing your file.",
              variant: "destructive",
            })
          }
        })
      }, 2000) // Wait for the upload simulation to complete
    } catch (error) {
      setIsProcessingServer(false) // Set server processing state to false
      console.error("Error processing files:", error instanceof Error ? error.message : String(error))
      toast({
        title: "Error",
        description: "There was a problem processing your files.",
        variant: "destructive",
      })
    }
  }

  const simulateFileUpload = (fileIndex: number, totalFiles: number) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setUploadedFiles((prevFiles) => {
        const updatedFiles = [...prevFiles]
        if (updatedFiles[fileIndex]) {
          updatedFiles[fileIndex] = { ...updatedFiles[fileIndex], progress }
        }
        return updatedFiles
      })

      if (progress >= 100) {
        clearInterval(interval)
        setUploadedFiles((prevFiles) => {
          const updatedFiles = [...prevFiles]
          if (updatedFiles[fileIndex]) {
            updatedFiles[fileIndex] = {
              ...updatedFiles[fileIndex],
              status: "success" as const,
            }
          }
          return updatedFiles
        })

        toast({
          title: "Upload complete",
          description: `${totalFiles} file(s) uploaded successfully.`,
        })
      }
    }, 200)
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => {
      const updated = [...prev]
      updated.splice(index, 1)

      // If no files remain, clear the extracted text
      if (updated.length === 0) {
        setExtractedText("")
        setExcelFilePath(undefined)
      }

      return updated
    })
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href={classId ? `/my-groups/${classId}` : "/"} className="mr-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Document Scanner</h1>
            <p className="text-gray-600">Scan or upload documents for your classes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main content area */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="scan" className="space-y-6">
              <div className="flex justify-between items-center">
                <TabsList>
                  <TabsTrigger value="scan" className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Scan Document
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload File
                  </TabsTrigger>
                </TabsList>

                <Button variant="outline" size="sm" asChild>
                  <Link href="/shelf">
                    <FileText className="mr-2 h-4 w-4" />
                    View Scanned Documents
                  </Link>
                </Button>
              </div>

              <TabsContent value="scan" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Camera Scanner</CardTitle>
                    <CardDescription>Use your device's camera to scan documents</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DocumentScanner />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Scans</CardTitle>
                    <CardDescription>Documents you've recently scanned</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentScans.map((scan) => (
                        <div
                          key={scan.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <ScanLine className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{scan.title}</p>
                              <p className="text-sm text-gray-500">{scan.student}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="outline"
                              className={
                                scan.type === "task" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"
                              }
                            >
                              {scan.type}
                            </Badge>
                            <span className="text-xs text-gray-500">{scan.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-center border-t pt-4">
                    <Button variant="outline" size="sm" className="w-full">
                      View All Scans
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="upload" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>File Uploader</CardTitle>
                    <CardDescription>Upload document files from your device</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${
                        isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="flex flex-col items-center">
                        <div className="bg-blue-50 p-4 rounded-full mb-4">
                          <Upload className="h-10 w-10 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">Upload Document</h3>
                        <p className="text-sm text-gray-500 mb-4">Drag and drop your files here, or click to browse</p>
                        <input
                          id="file-upload"
                          type="file"
                          ref={fileInputRef}
                          accept=".pdf"
                          multiple
                          className="hidden"
                          onChange={handleFileInput}
                        />
                        <p className="text-xs text-gray-400 mt-2 text-center">Supported format: PDF (Max size: 10MB)</p>
                      </div>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-medium mb-4">Uploaded Files</h3>
                        <div className="space-y-3">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="bg-white border rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <FileText className="h-6 w-6 text-gray-500" />
                                  <div className="ml-3">
                                    <p className="font-medium text-sm">{file.name}</p>
                                    <p className="text-xs text-gray-500">{file.size}</p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => removeFile(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="w-full">
                                <Progress value={file.progress} className="h-2" />
                                <div className="flex justify-between mt-1">
                                  <span className="text-xs text-gray-500">{file.progress}%</span>
                                  <span className="text-xs text-gray-500">
                                    {file.status === "success" ? (
                                      <span className="text-green-500 flex items-center">
                                        <Check className="h-3 w-3 mr-1" /> Complete
                                      </span>
                                    ) : file.status === "failed" ? (
                                      <span className="text-red-500">Failed</span>
                                    ) : (
                                      "Uploading..."
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {isProcessingServer && (
                      <div className="mt-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
                          <div className="mr-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-blue-800">Processing document</h3>
                            <p className="text-xs text-blue-600">
                              Please wait while we extract text from your document...
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {extractedText && !isProcessingServer && (
                      <div className="mt-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium">Extracted Text</h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={copyToClipboard}
                            className="flex items-center gap-1"
                          >
                            <Clipboard className="h-4 w-4" />
                            <span>Copy</span>
                          </Button>
                        </div>
                        <div className="bg-gray-50 border rounded-lg p-4 max-h-[300px] overflow-y-auto">
                          <pre className="whitespace-pre-wrap text-sm">{extractedText}</pre>
                        </div>
                        <div className="mt-4 flex justify-end">
                          {excelFilePath && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={downloadExcelFile}
                              className="flex items-center gap-1"
                            >
                              <Download className="h-4 w-4" />
                              <span>Download Analysis</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Details</CardTitle>
                <CardDescription>Provide information about the document</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Class Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="class-select">Class</Label>
                    <select
                      id="class-select"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={selectedClass}
                      onChange={(e) => {
                        setSelectedClass(e.target.value)
                        setSelectedExam("")
                        setSelectedStudent("")
                      }}
                    >
                      <option value="">Select a class</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Exam Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="exam-select">Exam</Label>
                    <select
                      id="exam-select"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={selectedExam}
                      onChange={(e) => {
                        setSelectedExam(e.target.value)
                        setSelectedStudent("")
                      }}
                      disabled={!selectedClass}
                    >
                      <option value="">Select an exam</option>
                      {currentClass?.exams.map((exam) => (
                        <option key={exam.id} value={exam.id}>
                          {exam.title} ({exam.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Student Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="student">Student</Label>
                    <select
                      id="student"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={selectedStudent}
                      onChange={(e) => setSelectedStudent(e.target.value)}
                      disabled={!selectedExam}
                    >
                      <option value="">Select a student</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Document Type Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="doc-type">Document Type</Label>
                    <RadioGroup value={docType} onValueChange={setDocType} id="doc-type" disabled={!selectedExam}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="task" id="task" />
                        <Label htmlFor="task">Task</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="text" id="text" />
                        <Label htmlFor="text">Text</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Document Title */}
                  <div className="space-y-2">
                    <Label htmlFor="doc-title">Document Title</Label>
                    <Input
                      id="doc-title"
                      placeholder="Enter document title"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      disabled={!selectedExam}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button className="w-full mt-2" disabled={!selectedExam || !docTitle || !selectedStudent}>
                    Save Document
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scanning Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-green-600 mt-0.5" />
                    <span>Ensure good lighting for best results</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-green-600 mt-0.5" />
                    <span>Keep the document flat and aligned</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 text-green-600 mt-0.5" />
                    <span>Capture the entire document in frame</span>
                  </li>
                  <li className="flex items-start">
                    <X className="h-4 w-4 mr-2 text-red-600 mt-0.5" />
                    <span>Avoid shadows or glare on the document</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

