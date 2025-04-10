"use client"

import type React from "react"

import { useState, useRef } from "react"
import {
  ArrowLeft,
  Upload,
  FileText,
  Check,
  X,
  ScanLine,
  Camera,
  Clipboard,
  Download,
  CheckCircle,
  List,
} from "lucide-react"
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

// Replace the existing QuestionAnswer interface with these new interfaces
interface Solution {
  question: string
  answer: string[]
}

interface Task {
  score: number
  solutions: Solution[]
}

interface TaskSection {
  Task: Task
}

interface TaskData {
  [section: string]: TaskSection[]
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
  const [isProcessingServer, setIsProcessingServer] = useState(false)

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

  // Add a new state variable for document type selection
  const [uploadDocType, setUploadDocType] = useState<"text" | "tasks" | null>(null)

  // Add a new state for the solution file
  const [solutionFile, setSolutionFile] = useState<UploadedFile[]>([])
  const [studentFile, setStudentFile] = useState<UploadedFile[]>([])
  const solutionFileInputRef = useRef<HTMLInputElement>(null)
  const studentFileInputRef = useRef<HTMLInputElement>(null)

  // Add state for processing solution file
  const [isProcessingSolution, setIsProcessingSolution] = useState(false)
  const [taskData, setTaskData] = useState<TaskData | null>(null)

  // Update the state variables to handle exam paper files
  // 1. Add a new state for the exam paper file:
  const [examPaperFile, setExamPaperFile] = useState<UploadedFile[]>([])
  const examPaperFileInputRef = useRef<HTMLInputElement>(null)

  // Add these state variables after the other state declarations
  const [examPaperFileObj, setExamPaperFileObj] = useState<File | null>(null)
  const [solutionFileObj, setSolutionFileObj] = useState<File | null>(null)

  // Update the handleFiles function to handle both solution and student files
  // 2. Add a new file type option to the handleFiles function:
  const handleFiles = (files: File[], fileType: "text" | "solution" | "student" | "exam_paper") => {
    try {
      if (fileType === "text") {
        setUploadedFiles([])
        setExtractedText("")
        setExcelFilePath(undefined)
        setIsProcessingServer(false) // Reset server processing state
      } else if (fileType === "solution") {
        setSolutionFile([])
        // Reset question-answers when uploading a new solution file
        setTaskData(null)
      } else if (fileType === "student") {
        setStudentFile([])
      } else if (fileType === "exam_paper") {
        setExamPaperFile([])
      }

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

      if (fileType === "text") {
        setUploadedFiles(newFiles)
      } else if (fileType === "solution") {
        setSolutionFile(newFiles)
      } else if (fileType === "student") {
        setStudentFile(newFiles)
      } else if (fileType === "exam_paper") {
        setExamPaperFile(newFiles)
      }

      // Simulate upload progress
      newFiles.forEach((file, index) => {
        const totalFiles = newFiles.length
        simulateFileUpload(index, totalFiles, fileType)
      })

      // After upload completes, send files to the server (only for text type)
      if (fileType === "text") {
        setTimeout(() => {
          setIsProcessingServer(true) // Set server processing state to true

          files.forEach(async (file) => {
            try {
              const formData = new FormData()
              formData.append("file", file)

              const response = await axios.post("https://backend.thankfulcoast-9ba238de.westus2.azurecontainerapps.io/upload", formData, {
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
      }
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

  // Update the simulateFileUpload function to handle different file types
  // 3. Add exam_paper handling to the simulateFileUpload function:
  const simulateFileUpload = (
    fileIndex: number,
    totalFiles: number,
    fileType: "text" | "solution" | "student" | "exam_paper",
  ) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += 10

      if (fileType === "text") {
        setUploadedFiles((prevFiles) => {
          const updatedFiles = [...prevFiles]
          if (updatedFiles[fileIndex]) {
            updatedFiles[fileIndex] = { ...updatedFiles[fileIndex], progress }
          }
          return updatedFiles
        })
      } else if (fileType === "solution") {
        setSolutionFile((prevFiles) => {
          const updatedFiles = [...prevFiles]
          if (updatedFiles[fileIndex]) {
            updatedFiles[fileIndex] = { ...updatedFiles[fileIndex], progress }
          }
          return updatedFiles
        })
      } else if (fileType === "student") {
        setStudentFile((prevFiles) => {
          const updatedFiles = [...prevFiles]
          if (updatedFiles[fileIndex]) {
            updatedFiles[fileIndex] = { ...updatedFiles[fileIndex], progress }
          }
          return updatedFiles
        })
      } else if (fileType === "exam_paper") {
        setExamPaperFile((prevFiles) => {
          const updatedFiles = [...prevFiles]
          if (updatedFiles[fileIndex]) {
            updatedFiles[fileIndex] = { ...updatedFiles[fileIndex], progress }
          }
          return updatedFiles
        })
      }

      if (progress >= 100) {
        clearInterval(interval)

        if (fileType === "text") {
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
        } else if (fileType === "solution") {
          setSolutionFile((prevFiles) => {
            const updatedFiles = [...prevFiles]
            if (updatedFiles[fileIndex]) {
              updatedFiles[fileIndex] = {
                ...updatedFiles[fileIndex],
                status: "success" as const,
              }
            }
            return updatedFiles
          })
        } else if (fileType === "student") {
          setStudentFile((prevFiles) => {
            const updatedFiles = [...prevFiles]
            if (updatedFiles[fileIndex]) {
              updatedFiles[fileIndex] = {
                ...updatedFiles[fileIndex],
                status: "success" as const,
              }
            }
            return updatedFiles
          })
        } else if (fileType === "exam_paper") {
          setExamPaperFile((prevFiles) => {
            const updatedFiles = [...prevFiles]
            if (updatedFiles[fileIndex]) {
              updatedFiles[fileIndex] = {
                ...updatedFiles[fileIndex],
                status: "success" as const,
              }
            }
            return updatedFiles
          })
        }

        toast({
          title: "Upload complete",
          description: `${totalFiles} file(s) uploaded successfully.`,
        })
      }
    }, 200)
  }

  // Update the handleDrop function to use the new file type parameter
  // 4. Add exam_paper handling to the handleDrop function:
  const handleDrop = (e: React.DragEvent, fileType: "text" | "solution" | "student" | "exam_paper") => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files, fileType)
  }

  const handleFileInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: "text" | "solution" | "student" | "exam_paper",
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)

      // Store the actual File objects in state
      if (fileType === "exam_paper" && files[0]) {
        setExamPaperFileObj(files[0])
      } else if (fileType === "solution" && files[0]) {
        setSolutionFileObj(files[0])
      }

      handleFiles(files, fileType)

      // Clear the file input value so the same file can be selected again
      if (fileType === "text" && fileInputRef.current) {
        fileInputRef.current.value = ""
      } else if (fileType === "solution" && solutionFileInputRef.current) {
        solutionFileInputRef.current.value = ""
      } else if (fileType === "student" && studentFileInputRef.current) {
        studentFileInputRef.current.value = ""
      } else if (fileType === "exam_paper" && examPaperFileInputRef.current) {
        examPaperFileInputRef.current.value = ""
      }
    }
  }

  // Add a function to remove files based on type
  // 6. Add exam_paper handling to the removeFile function:
  const removeFile = (index: number, fileType: "text" | "solution" | "student" | "exam_paper") => {
    if (fileType === "text") {
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
    } else if (fileType === "solution") {
      setSolutionFile((prev) => {
        const updated = [...prev]
        updated.splice(index, 1)
        // Reset question-answers when removing the solution file
        setTaskData(null)
        setSolutionFileObj(null) // Clear the stored File object
        return updated
      })
    } else if (fileType === "student") {
      setStudentFile((prev) => {
        const updated = [...prev]
        updated.splice(index, 1)
        return updated
      })
    } else if (fileType === "exam_paper") {
      setExamPaperFile((prev) => {
        const updated = [...prev]
        updated.splice(index, 1)
        setExamPaperFileObj(null) // Clear the stored File object
        return updated
      })
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(extractedText)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "The extracted text has been copied to your clipboard.",
        })
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err)
        toast({
          title: "Error",
          description: "Failed to copy text to clipboard.",
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
      const fileUrl = `https://backend.thankfulcoast-9ba238de.westus2.azurecontainerapps.io/download/${encodeURIComponent(excelFilePath)}`

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

  // Update the processSolutionFile function to handle the new JSON structure

  // Find the processSolutionFile function and replace it with this updated version:
  const processSolutionFile = async () => {
    if (solutionFile.length === 0 || examPaperFile.length === 0) {
      toast({
        title: "Error",
        description: "Please upload both exam paper and solution files first.",
        variant: "destructive",
      })
      return
    }

    // Check if we have the actual File objects
    if (!examPaperFileObj || !solutionFileObj) {
      toast({
        title: "Error",
        description: "File data is missing. Please try uploading the files again.",
        variant: "destructive",
      })
      return
    }

    setIsProcessingSolution(true)

    try {
      // Create a FormData object to send the files
      const formData = new FormData()

      // Use the stored File objects instead of trying to access them from refs
      formData.append("exam_paper", examPaperFileObj)
      console.log("Appended exam paper file:", examPaperFileObj.name)

      formData.append("solution", solutionFileObj)
      console.log("Appended solution file:", solutionFileObj.name)

      // Log the FormData contents for debugging
      console.log("Sending FormData to server with files")

      // Send the request to the server
      const response = await axios.post("https://backend.thankfulcoast-9ba238de.westus2.azurecontainerapps.io/solution", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: "json", // Ensure axios treats the response as JSON
      })

      console.log("Server response:", response.data)

      // Check if the response data is a string (JSON string)
      let parsedData = response.data
      if (typeof response.data === "string") {
        try {
          parsedData = JSON.parse(response.data)
          console.log("Parsed JSON data:", parsedData)
        } catch (parseError) {
          console.error("Error parsing JSON response:", parseError)
          toast({
            title: "Error",
            description: "Failed to parse server response.",
            variant: "destructive",
          })
          setIsProcessingSolution(false)
          return
        }
      }

      // Check if the request was successful
      if (parsedData.success !== false) {
        // Handle the case where the response might be directly the solution data
        // or nested under examPaper or solution keys
        let solutionData = parsedData

        if (parsedData.examPaper) {
          solutionData = parsedData.examPaper
        } else if (parsedData.solution && parsedData.solution.examPaper) {
          solutionData = parsedData.solution.examPaper
        } else if (parsedData.solution) {
          solutionData = parsedData.solution
        }

        setTaskData(solutionData)

        toast({
          title: "Processing complete",
          description: "Successfully extracted questions and answers from the files.",
        })
      } else {
        toast({
          title: "Error",
          description: parsedData.error || "Failed to process files.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error processing files:", error instanceof Error ? error.message : String(error))
      toast({
        title: "Error",
        description: "There was a problem processing your files.",
        variant: "destructive",
      })
    } finally {
      setIsProcessingSolution(false)
    }
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
                    {!uploadDocType ? (
                      <div className="space-y-6">
                        <h3 className="text-lg font-medium mb-4">Select Document Type</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card
                            className="cursor-pointer hover:border-blue-500 transition-colors"
                            onClick={() => {
                              setUploadDocType("text")
                              setDocType("text")
                            }}
                          >
                            <CardContent className="flex flex-col items-center justify-center p-6">
                              <FileText className="h-12 w-12 text-blue-500 mb-4" />
                              <h3 className="text-lg font-medium">Text</h3>
                              <p className="text-sm text-gray-500 text-center mt-2">
                                Upload a document for text extraction and analysis
                              </p>
                            </CardContent>
                          </Card>

                          <Card
                            className="cursor-pointer hover:border-blue-500 transition-colors"
                            onClick={() => {
                              setUploadDocType("tasks")
                              setDocType("task")
                            }}
                          >
                            <CardContent className="flex flex-col items-center justify-center p-6">
                              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                              <h3 className="text-lg font-medium">Tasks</h3>
                              <p className="text-sm text-gray-500 text-center mt-2">
                                Upload solution and student's exam for comparison
                              </p>
                            </CardContent>
                          </Card>
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => {
                            setUploadDocType(null)
                            // Don't reset docType here to preserve the user's selection
                          }}
                          className="mt-4"
                          size="sm"
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Back to Selection
                        </Button>
                      </div>
                    ) : uploadDocType === "text" ? (
                      <div className="space-y-6">
                        <div
                          className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${
                            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
                          }`}
                          onDragOver={(e) => {
                            e.preventDefault()
                            setIsDragging(true)
                          }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={(e) => handleDrop(e, "text")}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <div className="flex flex-col items-center">
                            <div className="bg-blue-50 p-4 rounded-full mb-4">
                              <Upload className="h-10 w-10 text-blue-500" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">Upload Document</h3>
                            <p className="text-sm text-gray-500 mb-4">
                              Drag and drop your files here, or click to browse
                            </p>
                            <input
                              id="file-upload"
                              type="file"
                              ref={fileInputRef}
                              accept=".pdf"
                              multiple
                              className="hidden"
                              onChange={(e) => handleFileInput(e, "text")}
                            />
                            <p className="text-xs text-gray-400 mt-2 text-center">
                              Supported format: PDF (Max size: 10MB)
                            </p>
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
                                      onClick={() => removeFile(index, "text")}
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

                        <Button
                          variant="outline"
                          onClick={() => {
                            setUploadDocType(null)
                            // Don't reset docType here to preserve the user's selection
                          }}
                          className="mt-4"
                          size="sm"
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Back to Selection
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <h3 className="text-lg font-medium mb-4">Upload Task Files</h3>

                        {/* Exam Paper File Upload */}
                        <div className="space-y-2">
                          <Label htmlFor="exam-paper-upload">Exam Paper File (without answers)</Label>
                          <div
                            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                              isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
                            }`}
                            onDragOver={(e) => {
                              e.preventDefault()
                              setIsDragging(true)
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => handleDrop(e, "exam_paper")}
                            onClick={() => examPaperFileInputRef.current?.click()}
                          >
                            <div className="flex flex-col items-center">
                              <div className="bg-blue-50 p-3 rounded-full mb-3">
                                <FileText className="h-8 w-8 text-blue-500" />
                              </div>
                              <h3 className="text-base font-medium mb-1">Upload Exam Paper</h3>
                              <p className="text-sm text-gray-500 mb-2">
                                Drag and drop exam paper file here, or click to browse
                              </p>
                              <input
                                id="exam-paper-upload"
                                type="file"
                                ref={examPaperFileInputRef}
                                accept=".pdf"
                                className="hidden"
                                onChange={(e) => handleFileInput(e, "exam_paper")}
                              />
                            </div>
                          </div>
                        </div>

                        {examPaperFile.length > 0 && (
                          <div className="mt-4">
                            <div className="space-y-3">
                              {examPaperFile.map((file, index) => (
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
                                      onClick={() => removeFile(index, "exam_paper")}
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

                        {/* Solution File Upload */}
                        <div className="space-y-2 mt-6">
                          <Label htmlFor="solution-upload">Solution File (with answers)</Label>
                          <div
                            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                              isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
                            }`}
                            onDragOver={(e) => {
                              e.preventDefault()
                              setIsDragging(true)
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => handleDrop(e, "solution")}
                            onClick={() => solutionFileInputRef.current?.click()}
                          >
                            <div className="flex flex-col items-center">
                              <div className="bg-green-50 p-3 rounded-full mb-3">
                                <CheckCircle className="h-8 w-8 text-green-500" />
                              </div>
                              <h3 className="text-base font-medium mb-1">Upload Solution</h3>
                              <p className="text-sm text-gray-500 mb-2">
                                Drag and drop solution file here, or click to browse
                              </p>
                              <input
                                id="solution-upload"
                                type="file"
                                ref={solutionFileInputRef}
                                accept=".pdf"
                                className="hidden"
                                onChange={(e) => handleFileInput(e, "solution")}
                              />
                            </div>
                          </div>
                        </div>

                        {solutionFile.length > 0 && (
                          <div className="mt-4">
                            <div className="space-y-3">
                              {solutionFile.map((file, index) => (
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
                                      onClick={() => removeFile(index, "solution")}
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

                        {examPaperFile.length > 0 && solutionFile.length > 0 && (
                          <Button className="w-full mt-4" onClick={processSolutionFile} disabled={isProcessingSolution}>
                            {isProcessingSolution ? (
                              <>
                                <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                                Processing Files...
                              </>
                            ) : (
                              <>
                                <List className="mr-2 h-4 w-4" />
                                Process Exam & Solution
                              </>
                            )}
                          </Button>
                        )}

                        {/* Display extracted task data */}
                        {taskData && (
                          <div className="mt-6 bg-white border rounded-lg p-4">
                            <h4 className="text-base font-medium mb-3 flex items-center">
                              <List className="mr-2 h-5 w-5 text-green-600" />
                              Extracted Tasks & Solutions
                            </h4>
                            <div className="max-h-[400px] overflow-y-auto">
                              {Object.entries(taskData).map(([sectionName, sectionData]) => (
                                <div key={sectionName} className="mb-6">
                                  <h5 className="text-sm font-semibold bg-blue-50 p-2 rounded mb-3">{sectionName}</h5>

                                  {Array.isArray(sectionData) ? (
                                    sectionData.map((item, itemIndex) => {
                                      // Get the first key in the item object
                                      const itemKey = Object.keys(item)[0]
                                      const taskSection = item[itemKey]

                                      return (
                                        <div key={itemIndex} className="mb-4">
                                          <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium">{itemKey}</span>
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                              Total Score: {taskSection.score}
                                            </span>
                                          </div>

                                          <div className="space-y-4">
                                            {taskSection.solutions.map((solution, index) => (
                                              <div key={index} className="border-b pb-3">
                                                <p className="text-sm font-medium">{solution.question}</p>
                                                <div className="mt-2">
                                                  <span className="text-xs font-medium text-gray-500">Answer:</span>
                                                  <div className="mt-1">
                                                    {Array.isArray(solution.answer) ? (
                                                      solution.answer.map((ans, i) => (
                                                        <p key={i} className="text-sm bg-green-50 p-2 rounded mb-1">
                                                          {ans}
                                                        </p>
                                                      ))
                                                    ) : (
                                                      <p className="text-sm bg-green-50 p-2 rounded mb-1">
                                                        {String(solution.answer)}
                                                      </p>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )
                                    })
                                  ) : (
                                    <div className="text-sm text-gray-500 p-2">No data available for this section</div>
                                  )}
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 flex justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(JSON.stringify(taskData, null, 2))
                                  toast({
                                    title: "Copied to clipboard",
                                    description: "Tasks and solutions copied as JSON",
                                  })
                                }}
                              >
                                <Clipboard className="mr-2 h-4 w-4" />
                                Copy as JSON
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Student File Upload */}
                        <div className="space-y-2 mt-6">
                          <Label htmlFor="student-upload">Student's Exam</Label>
                          <div
                            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                              isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
                            }`}
                            onDragOver={(e) => {
                              e.preventDefault()
                              setIsDragging(true)
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => handleDrop(e, "student")}
                            onClick={() => studentFileInputRef.current?.click()}
                          >
                            <div className="flex flex-col items-center">
                              <div className="bg-blue-50 p-3 rounded-full mb-3">
                                <FileText className="h-8 w-8 text-blue-500" />
                              </div>
                              <h3 className="text-base font-medium mb-1">Upload Student's Exam</h3>
                              <p className="text-sm text-gray-500 mb-2">
                                Drag and drop student file here, or click to browse
                              </p>
                              <input
                                id="student-upload"
                                type="file"
                                ref={studentFileInputRef}
                                accept=".pdf"
                                className="hidden"
                                onChange={(e) => handleFileInput(e, "student")}
                              />
                            </div>
                          </div>
                        </div>

                        {studentFile.length > 0 && (
                          <div className="mt-4">
                            <div className="space-y-3">
                              {studentFile.map((file, index) => (
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
                                      onClick={() => removeFile(index, "student")}
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

                        <Button
                          variant="outline"
                          onClick={() => {
                            setUploadDocType(null)
                            // Don't reset docType here to preserve the user's selection
                          }}
                          className="mt-4"
                          size="sm"
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Back to Selection
                        </Button>
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
                    <RadioGroup
                      value={docType}
                      onValueChange={(value) => {
                        setDocType(value)
                        // Update uploadDocType when radio buttons change
                        if (value === "task") {
                          setUploadDocType("tasks")
                        } else if (value === "text") {
                          setUploadDocType("text")
                        }
                      }}
                      id="doc-type"
                      disabled={!selectedExam}
                    >
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

