"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
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
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
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
  answer:
    | string[]
    | {
        student: string[]
        solution: string[]
      }
  result?: "correct" | "incorrect"
  score?: number
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

// Interface for tracking score validation
interface ScoreValidation {
  [sectionKey: string]: {
    [itemIndex: number]: {
      totalScore: number
      currentSum: number
      isValid: boolean
    }
  }
}

const baseURL = "http://0.0.0.0:8000"

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

  // Add a new state variable for student exam data after the taskData state declaration
  const [studentExamData, setStudentExamData] = useState<TaskData | null>(null)
  const [isProcessingStudentExam, setIsProcessingStudentExam] = useState(false)
  const [studentFileObj, setStudentFileObj] = useState<File | null>(null)

  // Update the state variables to handle exam paper files
  // 1. Add a new state for the exam paper file:
  const [examPaperFile, setExamPaperFile] = useState<UploadedFile[]>([])
  const examPaperFileInputRef = useRef<HTMLInputElement>(null)

  // Add these state variables after the other state declarations
  const [examPaperFileObj, setExamPaperFileObj] = useState<File | null>(null)
  const [solutionFileObj, setSolutionFileObj] = useState<File | null>(null)

  // Add a new state to track teacher corrections
  // Add this after the other state declarations
  const [teacherCorrections, setTeacherCorrections] = useState<Record<string, boolean>>({})

  // Add state for editing solutions
  const [isEditingSolution, setIsEditingSolution] = useState(false)
  const [editedTaskData, setEditedTaskData] = useState<TaskData | null>(null)

  // Add state for score validation
  const [scoreValidation, setScoreValidation] = useState<ScoreValidation>({})
  const [hasScoreErrors, setHasScoreErrors] = useState(false)

  // Add state for tracking student grades
  const [studentGrades, setStudentGrades] = useState<{
    total: { earned: number; possible: number }
    sections: Record<string, { earned: number; possible: number }>
  }>({
    total: { earned: 0, possible: 0 },
    sections: {},
  })

  // Validate scores whenever editedTaskData changes
  useEffect(() => {
    if (isEditingSolution && editedTaskData) {
      validateScores(editedTaskData)
    }
  }, [isEditingSolution, editedTaskData])

  // Effect to handle tab switching when document type is selected from sidebar
  // useEffect(() => {
  //   if (uploadDocType !== null) {
  //     // Find and click the upload tab if it's not already active
  //     const uploadTabTrigger = document.querySelector('[data-state="inactive"][value="upload"]')
  //     if (uploadTabTrigger) {
  //       ;(uploadTabTrigger as HTMLElement).click()
  //     }
  //   }
  // }, [uploadDocType])

  // Function to validate scores
  const validateScores = (data: TaskData) => {
    const newValidation: ScoreValidation = {}
    let hasErrors = false

    Object.entries(data).forEach(([sectionName, sectionData]) => {
      newValidation[sectionName] = {}

      if (Array.isArray(sectionData)) {
        sectionData.forEach((item, itemIndex) => {
          const itemKey = Object.keys(item)[0]
          const taskSection = item[itemKey]

          // Calculate the sum of all question scores
          const currentSum = taskSection.solutions.reduce((sum, solution) => {
            return sum + (solution.score || 0)
          }, 0)

          // Check if the sum matches the total score
          const isValid = currentSum === taskSection.score

          newValidation[sectionName][itemIndex] = {
            totalScore: taskSection.score,
            currentSum,
            isValid,
          }

          if (!isValid) {
            hasErrors = true
          }
        })
      }
    })

    setScoreValidation(newValidation)
    setHasScoreErrors(hasErrors)

    return !hasErrors
  }

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
        // Add this line to clear student exam data when a new student file is uploaded
        setStudentExamData(null)
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

              const response = await axios.post(`${baseURL}/upload`, formData, {
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

  // Update the handleFileInput function to store the student file object
  // Find the handleFileInput function and modify it to store the student file object
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
      } else if (fileType === "student" && files[0]) {
        setStudentFileObj(files[0])
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
        setStudentExamData(null) // Reset student exam data
        setStudentFileObj(null) // Clear the stored File object
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
      const fileUrl = `${baseURL}/download/${encodeURIComponent(excelFilePath)}`

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
      const response = await axios.post(`${baseURL}/solution`, formData, {
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

        // Initialize scores for each question if they don't exist
        // and distribute the total score evenly among questions
        Object.entries(solutionData).forEach(([sectionName, sectionData]) => {
          if (Array.isArray(sectionData)) {
            sectionData.forEach((item) => {
              const itemKey = Object.keys(item)[0]
              const taskSection = item[itemKey]
              const totalScore = taskSection.score
              const questionCount = taskSection.solutions.length

              // If questions have no scores, distribute evenly
              const hasScores = taskSection.solutions.some((solution) => solution.score !== undefined)

              if (!hasScores && questionCount > 0) {
                // Calculate score per question (rounded to 2 decimal places)
                const scorePerQuestion = Math.round((totalScore / questionCount) * 100) / 100

                // Distribute scores evenly
                taskSection.solutions.forEach((solution, index) => {
                  // For the last question, adjust to ensure sum equals total
                  if (index === questionCount - 1) {
                    const currentSum = taskSection.solutions.slice(0, index).reduce((sum, s) => sum + (s.score || 0), 0)
                    solution.score = Math.round((totalScore - currentSum) * 100) / 100
                  } else {
                    solution.score = scorePerQuestion
                  }
                })
              }
            })
          }
        })

        setTaskData(solutionData)
        validateScores(solutionData)

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

  // Add a new function to process the student's exam file
  // Add this function after the processSolutionFile function
  const processStudentExam = async () => {
    if (!taskData || !examPaperFileObj || !solutionFileObj || !studentFileObj) {
      toast({
        title: "Error",
        description: "Please process the exam paper and solution files first, then upload a student exam file.",
        variant: "destructive",
      })
      return
    }

    setIsProcessingStudentExam(true)

    try {
      // Create a FormData object to send the files
      const formData = new FormData()

      // Use the stored File objects
      formData.append("exam_paper", examPaperFileObj)
      formData.append("solution", solutionFileObj)
      formData.append("student", studentFileObj)

      console.log("Sending student exam to server for processing")

      // Send the request to the server
      const response = await axios.post(`${baseURL}/answer`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: "json",
      })

      console.log("Server response for student exam:", response.data)

      // Check if the response data is a string (JSON string)
      let parsedData = response.data
      if (typeof response.data === "string") {
        try {
          parsedData = JSON.parse(response.data)
          console.log("Parsed JSON data for student exam:", parsedData)
        } catch (parseError) {
          console.error("Error parsing JSON response for student exam:", parseError)
          toast({
            title: "Error",
            description: "Failed to parse server response for student exam.",
            variant: "destructive",
          })
          setIsProcessingStudentExam(false)
          return
        }
      }

      // Check if the request was successful
      if (parsedData.examPaper) {
        setStudentExamData(parsedData.examPaper)

        toast({
          title: "Processing complete",
          description: "Successfully processed student's exam.",
        })
      } else {
        toast({
          title: "Error",
          description: parsedData.error || "Failed to process student's exam.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error processing student exam:", error instanceof Error ? error.message : String(error))
      toast({
        title: "Error",
        description: "There was a problem processing the student's exam.",
        variant: "destructive",
      })
    } finally {
      setIsProcessingStudentExam(false)
    }
  }

  // Add state for tracking student grades

  // Function to calculate student grades
  const calculateStudentGrades = useCallback(() => {
    if (!studentExamData || !taskData) return

    let totalEarned = 0
    let totalPossible = 0
    const sectionGrades: Record<string, { earned: number; possible: number }> = {}

    // Process each section
    Object.entries(studentExamData).forEach(([sectionName, sectionData]) => {
      if (!Array.isArray(sectionData)) return

      let sectionEarned = 0
      let sectionPossible = 0

      sectionData.forEach((item, itemIndex) => {
        const itemKey = Object.keys(item)[0]
        const studentTaskSection = item[itemKey]

        // Find corresponding task section in the solution data
        const solutionSectionData = taskData[sectionName]
        if (!Array.isArray(solutionSectionData)) return

        const solutionItem = solutionSectionData[itemIndex]
        if (!solutionItem) return

        const solutionItemKey = Object.keys(solutionItem)[0]
        const solutionTaskSection = solutionItem[solutionItemKey]

        // Add to section possible score
        sectionPossible += solutionTaskSection.score

        // Calculate earned score based on correct answers
        studentTaskSection.solutions.forEach((solution, solutionIndex) => {
          const questionId = `${sectionName}-${itemIndex}-${solutionIndex}`
          const solutionScore = solutionTaskSection.solutions[solutionIndex]?.score || 0

          // Check if the answer is correct (either by default or teacher correction)
          const isCorrect =
            solution.result === "correct" ||
            (solution.result === "incorrect" && teacherCorrections[questionId] === true)

          if (isCorrect) {
            sectionEarned += solutionScore
          }
        })
      })

      // Update section grades
      sectionGrades[sectionName] = { earned: sectionEarned, possible: sectionPossible }

      // Add to totals
      totalEarned += sectionEarned
      totalPossible += sectionPossible
    })

    // Update the grades state
    setStudentGrades({
      total: { earned: totalEarned, possible: totalPossible },
      sections: sectionGrades,
    })
  }, [studentExamData, taskData, teacherCorrections])

  // Recalculate grades when student data, task data, or teacher corrections change
  useEffect(() => {
    if (studentExamData) {
      calculateStudentGrades()
    }
  }, [studentExamData, taskData, teacherCorrections, calculateStudentGrades])

  // First, let's add a function to handle marking an answer as correct or incorrect
  // Add this function before the return statement

  const handleMarkAsCorrect = (questionId: string, isCorrect: boolean) => {
    setTeacherCorrections((prev) => ({
      ...prev,
      [questionId]: isCorrect,
    }))

    toast({
      title: isCorrect ? "Marked as correct" : "Marked as incorrect",
      description: isCorrect ? "The answer has been approved as correct" : "The answer has been marked as incorrect",
    })
  }

  // Function to handle entering edit mode for solutions
  const handleEditSolution = () => {
    // Create a deep copy of the taskData to edit
    setEditedTaskData(JSON.parse(JSON.stringify(taskData)))
    setIsEditingSolution(true)
  }

  // Function to handle updating a solution answer
  const handleUpdateSolutionAnswer = (
    sectionName: string,
    itemIndex: number,
    solutionIndex: number,
    answerIndex: number | null,
    newValue: string,
  ) => {
    if (!editedTaskData) return

    setEditedTaskData((prevData) => {
      if (!prevData) return null

      const newData = { ...prevData }
      const sectionData = [...newData[sectionName]]
      const item = { ...sectionData[itemIndex] }

      // Get the first key in the item object
      const itemKey = Object.keys(item)[0]
      const taskSection = { ...item[itemKey] }

      // Create a new solutions array
      const solutions = [...taskSection.solutions]
      const solution = { ...solutions[solutionIndex] }

      // Update the answer based on its type
      if (typeof solution.answer === "object" && "solution" in solution.answer) {
        // Handle object with solution property
        const answer = { ...solution.answer }
        if (answerIndex !== null && Array.isArray(answer.solution)) {
          // Update specific array item
          const newSolution = [...answer.solution]
          newSolution[answerIndex] = newValue
          answer.solution = newSolution
        } else {
          // Replace entire solution
          answer.solution = [newValue]
        }
        solution.answer = answer
      } else if (Array.isArray(solution.answer)) {
        // Handle array answer
        const newAnswer = [...solution.answer]
        if (answerIndex !== null) {
          newAnswer[answerIndex] = newValue
        } else {
          // If no index provided, replace the first item
          if (newAnswer.length > 0) {
            newAnswer[0] = newValue
          } else {
            newAnswer.push(newValue)
          }
        }
        solution.answer = newAnswer
      } else {
        // Handle string or other primitive answer
        solution.answer = [newValue]
      }

      // Update the solution in the solutions array
      solutions[solutionIndex] = solution

      // Update the task section
      taskSection.solutions = solutions

      // Update the item
      item[itemKey] = taskSection

      // Update the section data
      sectionData[itemIndex] = item

      // Update the section in the new data
      newData[sectionName] = sectionData

      return newData
    })
  }

  // Function to handle updating a solution score
  const handleUpdateSolutionScore = (
    sectionName: string,
    itemIndex: number,
    solutionIndex: number,
    newScore: number,
  ) => {
    if (!editedTaskData) return

    setEditedTaskData((prevData) => {
      if (!prevData) return null

      const newData = { ...prevData }
      const sectionData = [...newData[sectionName]]
      const item = { ...sectionData[itemIndex] }

      // Get the first key in the item object
      const itemKey = Object.keys(item)[0]
      const taskSection = { ...item[itemKey] }
      const totalSectionScore = taskSection.score

      // Create a new solutions array
      const solutions = [...taskSection.solutions]

      // Calculate current sum excluding the solution being edited
      const currentSumExcludingThis = solutions.reduce((sum, solution, idx) => {
        return idx === solutionIndex ? sum : sum + (solution.score || 0)
      }, 0)

      // If new score would make total exceed section total, adjust it
      if (currentSumExcludingThis + newScore > totalSectionScore) {
        newScore = Math.max(0, totalSectionScore - currentSumExcludingThis)
      }

      // Update the score (allow decimal values)
      const solution = { ...solutions[solutionIndex] }
      solution.score = newScore

      // Update the solution in the solutions array
      solutions[solutionIndex] = solution

      // Update the task section
      taskSection.solutions = solutions

      // Update the item
      item[itemKey] = taskSection

      // Update the section data
      sectionData[itemIndex] = item

      // Update the section in the new data
      newData[sectionName] = sectionData

      return newData
    })
  }

  // Function to distribute remaining points evenly
  const distributeRemainingPoints = (sectionName: string, itemIndex: number, excludeSolutionIndex: number) => {
    if (!editedTaskData) return

    setEditedTaskData((prevData) => {
      if (!prevData) return null

      const newData = { ...prevData }
      const sectionData = [...newData[sectionName]]
      const item = { ...sectionData[itemIndex] }

      // Get the first key in the item object
      const itemKey = Object.keys(item)[0]
      const taskSection = { ...item[itemKey] }

      const totalScore = taskSection.score
      const solutions = [...taskSection.solutions]

      // Calculate current sum excluding the solution being edited
      const currentSum = solutions.reduce((sum, solution, idx) => {
        return idx === excludeSolutionIndex ? sum : sum + (solution.score || 0)
      }, 0)

      // Calculate remaining points
      const remainingPoints = totalScore - currentSum

      // Update the excluded solution's score
      if (solutions[excludeSolutionIndex]) {
        solutions[excludeSolutionIndex] = {
          ...solutions[excludeSolutionIndex],
          score: Math.max(0, remainingPoints), // Ensure score is not negative
        }
      }

      // Update the task section
      taskSection.solutions = solutions

      // Update the item
      item[itemKey] = taskSection

      // Update the section data
      sectionData[itemIndex] = item

      // Update the section in the new data
      newData[sectionName] = sectionData

      return newData
    })
  }

  // Function to auto-distribute scores evenly
  const distributeScoresEvenly = (sectionName: string, itemIndex: number) => {
    if (!editedTaskData) return

    setEditedTaskData((prevData) => {
      if (!prevData) return null

      const newData = { ...prevData }
      const sectionData = [...newData[sectionName]]
      const item = { ...sectionData[itemIndex] }

      // Get the first key in the item object
      const itemKey = Object.keys(item)[0]
      const taskSection = { ...item[itemKey] }

      const totalScore = taskSection.score
      const solutions = [...taskSection.solutions]
      const questionCount = solutions.length

      if (questionCount > 0) {
        // Calculate score per question (rounded to 2 decimal places)
        const scorePerQuestion = Math.round((totalScore / questionCount) * 100) / 100

        // Distribute scores evenly
        solutions.forEach((solution, index) => {
          // For the last question, adjust to ensure sum equals total
          if (index === questionCount - 1) {
            const currentSum = solutions.slice(0, index).reduce((sum, s) => sum + (s.score || 0), 0)
            solutions[index] = {
              ...solution,
              score: Math.round((totalScore - currentSum) * 100) / 100,
            }
          } else {
            solutions[index] = {
              ...solution,
              score: scorePerQuestion,
            }
          }
        })
      }

      // Update the task section
      taskSection.solutions = solutions

      // Update the item
      item[itemKey] = taskSection

      // Update the section data
      sectionData[itemIndex] = item

      // Update the section in the new data
      newData[sectionName] = sectionData

      return newData
    })
  }

  // Find the handleSaveSolution function and replace it with this updated version:

  // Function to save the updated solution
  const handleSaveSolution = async () => {
    if (!editedTaskData) return

    // Validate scores before saving
    const isValid = validateScores(editedTaskData)

    if (!isValid) {
      toast({
        title: "Score Warning",
        description: "The sum of question scores doesn't equal the section total score. Saving anyway.",
        variant: "warning",
      })
    }

    try {
      // Show loading state
      toast({
        title: "Saving...",
        description: "Sending updated solution to server",
      })

      // Send the updated data to the server
      const response = await axios.post(`${baseURL}/update_solution`, {
        solution: editedTaskData,
      })

      // Check if the request was successful
      if (response.data.success) {
        // Update the local state with the edited data
        setTaskData(editedTaskData)
        setIsEditingSolution(false)
        setHasScoreErrors(false)

        toast({
          title: "Solution updated",
          description: "The solution has been successfully updated on the server.",
        })
      } else {
        // Handle server-side validation errors or other issues
        toast({
          title: "Update Warning",
          description: response.data.message || "Solution was saved with warnings.",
          variant: "warning",
        })

        // Still update local state if the server accepted the data
        setTaskData(editedTaskData)
        setIsEditingSolution(false)
        setHasScoreErrors(false)
      }
    } catch (error) {
      console.error("Error updating solution:", error)
      toast({
        title: "Error",
        description: "Failed to update solution on the server. Please try again.",
        variant: "destructive",
      })
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
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="text-base font-medium flex items-center">
                                <List className="mr-2 h-5 w-5 text-green-600" />
                                Extracted Tasks & Solutions
                              </h4>
                              <div className="flex gap-2">
                                {isEditingSolution && hasScoreErrors && (
                                  <div className="flex items-center text-amber-600 text-xs mr-2">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    Score totals don't match
                                  </div>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={isEditingSolution ? handleSaveSolution : handleEditSolution}
                                >
                                  {isEditingSolution ? "Update Solution" : "Edit"}
                                </Button>
                              </div>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto">
                              {Object.entries(isEditingSolution ? editedTaskData || {} : taskData).map(
                                ([sectionName, sectionData]) => (
                                  <div key={sectionName} className="mb-6">
                                    <h5 className="text-sm font-semibold bg-blue-50 p-2 rounded mb-3">{sectionName}</h5>

                                    {Array.isArray(sectionData) ? (
                                      sectionData.map((item, itemIndex) => {
                                        // Get the first key in the item object
                                        const itemKey = Object.keys(item)[0]
                                        const taskSection = item[itemKey]

                                        // Get validation info for this section
                                        const validation = scoreValidation[sectionName]?.[itemIndex]
                                        const isValid = validation?.isValid
                                        const currentSum = validation?.currentSum || 0
                                        const totalScore = validation?.totalScore || taskSection.score

                                        return (
                                          <div key={itemIndex} className="mb-4">
                                            <div className="flex justify-between items-center mb-2">
                                              <span className="text-sm font-medium">{itemKey}</span>
                                              <div className="flex items-center">
                                                {isEditingSolution && (
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 text-xs mr-2"
                                                    onClick={() => distributeScoresEvenly(sectionName, itemIndex)}
                                                  >
                                                    Distribute Evenly
                                                  </Button>
                                                )}
                                                <span
                                                  className={`text-xs px-2 py-1 rounded-full ${
                                                    isEditingSolution && !isValid
                                                      ? "bg-amber-100 text-amber-800"
                                                      : "bg-blue-100 text-blue-800"
                                                  }`}
                                                >
                                                  {isEditingSolution
                                                    ? `Score: ${currentSum}/${totalScore}`
                                                    : `Total Score: ${taskSection.score}`}
                                                </span>
                                              </div>
                                            </div>

                                            <div className="space-y-4">
                                              {taskSection.solutions.map((solution, solutionIndex) => (
                                                <div key={solutionIndex} className="border-b pb-3">
                                                  {/* Question and Score */}
                                                  <div className="flex justify-between items-start mb-2">
                                                    <p className="text-sm font-medium">{solution.question}</p>
                                                    <div className="flex items-center">
                                                      <span className="text-xs text-gray-500 mr-2">Score:</span>
                                                      {isEditingSolution ? (
                                                        <div className="flex items-center">
                                                          <Input
                                                            type="number"
                                                            value={solution.score || 0}
                                                            onChange={(e) =>
                                                              handleUpdateSolutionScore(
                                                                sectionName,
                                                                itemIndex,
                                                                solutionIndex,
                                                                Number.parseFloat(e.target.value) || 0,
                                                              )
                                                            }
                                                            className="w-16 h-7 text-sm p-1"
                                                            min="0"
                                                            step="0.1"
                                                          />
                                                          <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 w-7 p-0 ml-1"
                                                            onClick={() =>
                                                              distributeRemainingPoints(
                                                                sectionName,
                                                                itemIndex,
                                                                solutionIndex,
                                                              )
                                                            }
                                                            title="Auto-adjust this score to balance the total"
                                                          >
                                                            <Check className="h-3 w-3" />
                                                          </Button>
                                                        </div>
                                                      ) : (
                                                        <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                          {solution.score || 0}
                                                        </span>
                                                      )}
                                                    </div>
                                                  </div>
                                                  <div className="mt-2">
                                                    <span className="text-xs font-medium text-gray-500">Answer:</span>
                                                    <div className="mt-1">
                                                      {isEditingSolution ? (
                                                        // Editable mode
                                                        <>
                                                          {Array.isArray(solution.answer) ? (
                                                            solution.answer.map((ans, i) => (
                                                              <div key={i} className="mb-1">
                                                                <Input
                                                                  value={ans}
                                                                  onChange={(e) =>
                                                                    handleUpdateSolutionAnswer(
                                                                      sectionName,
                                                                      itemIndex,
                                                                      solutionIndex,
                                                                      i,
                                                                      e.target.value,
                                                                    )
                                                                  }
                                                                  className="text-sm p-2 bg-green-50"
                                                                />
                                                              </div>
                                                            ))
                                                          ) : typeof solution.answer === "object" &&
                                                            "solution" in solution.answer ? (
                                                            Array.isArray(solution.answer.solution) ? (
                                                              solution.answer.solution.map((ans, i) => (
                                                                <div key={i} className="mb-1">
                                                                  <Input
                                                                    value={ans}
                                                                    onChange={(e) =>
                                                                      handleUpdateSolutionAnswer(
                                                                        sectionName,
                                                                        itemIndex,
                                                                        solutionIndex,
                                                                        i,
                                                                        e.target.value,
                                                                      )
                                                                    }
                                                                    className="text-sm p-2 bg-green-50"
                                                                  />
                                                                </div>
                                                              ))
                                                            ) : (
                                                              <Input
                                                                value={String(solution.answer.solution)}
                                                                onChange={(e) =>
                                                                  handleUpdateSolutionAnswer(
                                                                    sectionName,
                                                                    itemIndex,
                                                                    solutionIndex,
                                                                    null,
                                                                    e.target.value,
                                                                  )
                                                                }
                                                                className="text-sm p-2 bg-green-50"
                                                              />
                                                            )
                                                          ) : (
                                                            <Input
                                                              value={String(solution.answer)}
                                                              onChange={(e) =>
                                                                handleUpdateSolutionAnswer(
                                                                  sectionName,
                                                                  itemIndex,
                                                                  solutionIndex,
                                                                  null,
                                                                  e.target.value,
                                                                )
                                                              }
                                                              className="text-sm p-2 bg-green-50"
                                                            />
                                                          )}
                                                        </>
                                                      ) : (
                                                        // View mode
                                                        <>
                                                          {Array.isArray(solution.answer) ? (
                                                            solution.answer.map((ans, i) => (
                                                              <p
                                                                key={i}
                                                                className="text-sm bg-green-50 p-2 rounded mb-1"
                                                              >
                                                                {ans}
                                                              </p>
                                                            ))
                                                          ) : typeof solution.answer === "object" &&
                                                            "solution" in solution.answer ? (
                                                            Array.isArray(solution.answer.solution) ? (
                                                              solution.answer.solution.map((ans, i) => (
                                                                <p
                                                                  key={i}
                                                                  className="text-sm bg-green-50 p-2 rounded mb-1"
                                                                >
                                                                  {String(ans)}
                                                                </p>
                                                              ))
                                                            ) : (
                                                              <p className="text-sm bg-green-50 p-2 rounded mb-1">
                                                                {String(solution.answer.solution)}
                                                              </p>
                                                            )
                                                          ) : (
                                                            <p className="text-sm bg-green-50 p-2 rounded mb-1">
                                                              {String(solution.answer)}
                                                            </p>
                                                          )}
                                                        </>
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
                                      <p className="text-sm text-gray-500">No tasks found in this section.</p>
                                    )}
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                        {/* Student File Upload */}
                        {taskData && (
                          <div className="space-y-2 mt-6">
                            <Label htmlFor="student-upload">Student's Exam File (with answers)</Label>
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
                                <div className="bg-yellow-50 p-3 rounded-full mb-3">
                                  <FileText className="h-8 w-8 text-yellow-500" />
                                </div>
                                <h3 className="text-base font-medium mb-1">Upload Student's Exam</h3>
                                <p className="text-sm text-gray-500 mb-2">
                                  Drag and drop student's exam file here, or click to browse
                                </p>
                                <input
                                  id="student-upload"
                                  type="file"
                                  ref={studentFileInputRef}
                                  accept=".pdf"
                                  className="hidden"
                                  onChange={(e) => handleFileInput(e, "student")}
                                />
                                {/* Add a button to process the student's exam */}
                                {studentFile.length > 0 && (
                                  <Button
                                    className="w-full mt-4"
                                    onClick={processStudentExam}
                                    disabled={isProcessingStudentExam}
                                  >
                                    {isProcessingStudentExam ? (
                                      <>
                                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                                        Processing Student Exam...
                                      </>
                                    ) : (
                                      <>
                                        <List className="mr-2 h-4 w-4" />
                                        Process Student Exam
                                      </>
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

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

                        {/* Find the section that displays student exam data (around line 1400-1500)
                        Replace the student exam data display section with this updated code: */}
                        {/* Display student exam data */}
                        {studentExamData && (
                          <div className="mt-6 bg-white border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="text-base font-medium flex items-center">
                                <List className="mr-2 h-5 w-5 text-yellow-600" />
                                Student's Exam Analysis
                              </h4>
                              <div className="flex items-center">
                                <span className="text-sm font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                                  Grade: {studentGrades.total.earned.toFixed(1)}/
                                  {studentGrades.total.possible.toFixed(1)}
                                  {studentGrades.total.possible > 0 && (
                                    <span className="ml-1">
                                      ({Math.round((studentGrades.total.earned / studentGrades.total.possible) * 100)}%)
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto">
                              {Object.entries(studentExamData).map(([sectionName, sectionData]) => {
                                const sectionGrade = studentGrades.sections[sectionName] || { earned: 0, possible: 0 }

                                return (
                                  <div key={sectionName} className="mb-6">
                                    <div className="flex justify-between items-center">
                                      <h5 className="text-sm font-semibold bg-blue-50 p-2 rounded mb-3">
                                        {sectionName}
                                      </h5>
                                      <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full mb-3">
                                        Section Grade: {sectionGrade.earned.toFixed(1)}/
                                        {sectionGrade.possible.toFixed(1)}
                                      </span>
                                    </div>

                                    {Array.isArray(sectionData) ? (
                                      sectionData.map((item, itemIndex) => {
                                        // Get the first key in the item object
                                        const itemKey = Object.keys(item)[0]
                                        const taskSection = item[itemKey]

                                        // Find corresponding task section in the solution data
                                        const solutionSectionData = taskData?.[sectionName]
                                        if (!Array.isArray(solutionSectionData)) return null

                                        const solutionItem = solutionSectionData[itemIndex]
                                        if (!solutionItem) return null

                                        const solutionItemKey = Object.keys(solutionItem)[0]
                                        const solutionTaskSection = solutionItem[solutionItemKey]

                                        return (
                                          <div key={itemIndex} className="mb-4">
                                            <span className="text-sm font-medium">{itemKey}</span>
                                            <div className="space-y-4">
                                              {taskSection.solutions.map((solution, solutionIndex) => {
                                                const questionId = `${sectionName}-${itemIndex}-${solutionIndex}`
                                                const isCorrect =
                                                  solution.result === "correct" ||
                                                  teacherCorrections[questionId] === true

                                                // Find the corresponding solution from the task data
                                                const solutionAnswer = solutionTaskSection.solutions[solutionIndex]
                                                const solutionScore = solutionAnswer?.score || 0

                                                return (
                                                  <div key={solutionIndex} className="border-b pb-3">
                                                    {/* Question */}
                                                    <div className="flex justify-between items-start mb-2">
                                                      <p className="text-sm font-medium">{solution.question}</p>
                                                      <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                        {solutionScore.toFixed(1)} points
                                                      </span>
                                                    </div>

                                                    {/* Correct Answer from Solution */}
                                                    <div className="mt-2">
                                                      <span className="text-xs font-medium text-gray-500">
                                                        Correct Answer:
                                                      </span>
                                                      <div className="mt-1">
                                                        {Array.isArray(solutionAnswer?.answer) ? (
                                                          solutionAnswer.answer.map((ans, i) => (
                                                            <p key={i} className="text-sm bg-green-50 p-2 rounded mb-1">
                                                              {ans}
                                                            </p>
                                                          ))
                                                        ) : typeof solutionAnswer?.answer === "object" &&
                                                          "solution" in solutionAnswer.answer ? (
                                                          Array.isArray(solutionAnswer.answer.solution) ? (
                                                            solutionAnswer.answer.solution.map((ans, i) => (
                                                              <p
                                                                key={i}
                                                                className="text-sm bg-green-50 p-2 rounded mb-1"
                                                              >
                                                                {String(ans)}
                                                              </p>
                                                            ))
                                                          ) : (
                                                            <p className="text-sm bg-green-50 p-2 rounded mb-1">
                                                              {String(solutionAnswer.answer.solution)}
                                                            </p>
                                                          )
                                                        ) : (
                                                          <p className="text-sm bg-green-50 p-2 rounded mb-1">
                                                            {String(solutionAnswer?.answer || "No answer provided")}
                                                          </p>
                                                        )}
                                                      </div>
                                                    </div>

                                                    {/* Student Answer */}
                                                    <div className="mt-2">
                                                      <div className="flex justify-between items-center">
                                                        <span className="text-xs font-medium text-gray-500">
                                                          Student Answer:
                                                        </span>
                                                        {solution.result === "incorrect" && (
                                                          <div className="flex items-center space-x-4">
                                                            <div className="flex items-center">
                                                              <input
                                                                type="radio"
                                                                id={`${questionId}-incorrect`}
                                                                name={`answer-${questionId}`}
                                                                checked={!isCorrect}
                                                                onChange={() => handleMarkAsCorrect(questionId, false)}
                                                                className="mr-1"
                                                              />
                                                              <label
                                                                htmlFor={`${questionId}-incorrect`}
                                                                className="text-xs text-red-600"
                                                              >
                                                                falsch
                                                              </label>
                                                            </div>
                                                            <div className="flex items-center">
                                                              <input
                                                                type="radio"
                                                                id={`${questionId}-correct`}
                                                                name={`answer-${questionId}`}
                                                                checked={isCorrect}
                                                                onChange={() => handleMarkAsCorrect(questionId, true)}
                                                                className="mr-1"
                                                              />
                                                              <label
                                                                htmlFor={`${questionId}-correct`}
                                                                className="text-xs text-green-600"
                                                              >
                                                                richtig
                                                              </label>
                                                            </div>
                                                          </div>
                                                        )}
                                                      </div>
                                                      <div className="mt-1">
                                                        {Array.isArray(solution.answer) ? (
                                                          solution.answer.map((ans, i) => (
                                                            <p
                                                              key={i}
                                                              className={`text-sm p-2 rounded mb-1 ${
                                                                solution.result === "correct" || isCorrect
                                                                  ? "bg-green-50 text-green-800"
                                                                  : "bg-red-50 text-red-800"
                                                              }`}
                                                            >
                                                              {ans}
                                                              {(solution.result === "correct" || isCorrect) && (
                                                                <Check className="inline-block h-4 w-4 ml-2 text-green-600" />
                                                              )}
                                                            </p>
                                                          ))
                                                        ) : typeof solution.answer === "object" &&
                                                          "solution" in solution.answer ? (
                                                          Array.isArray(solution.answer.solution) ? (
                                                            solution.answer.solution.map((ans, i) => (
                                                              <p
                                                                key={i}
                                                                className={`text-sm p-2 rounded mb-1 ${
                                                                  solution.result === "correct" || isCorrect
                                                                    ? "bg-green-50 text-green-800"
                                                                    : "bg-red-50 text-red-800"
                                                                }`}
                                                              >
                                                                {String(ans)}
                                                                {(solution.result === "correct" || isCorrect) && (
                                                                  <Check className="inline-block h-4 w-4 ml-2 text-green-600" />
                                                                )}
                                                              </p>
                                                            ))
                                                          ) : (
                                                            <p
                                                              className={`text-sm p-2 rounded mb-1 ${
                                                                solution.result === "correct" || isCorrect
                                                                  ? "bg-green-50 text-green-800"
                                                                  : "bg-red-50 text-red-800"
                                                              }`}
                                                            >
                                                              {String(solution.answer.solution)}
                                                              {(solution.result === "correct" || isCorrect) && (
                                                                <Check className="inline-block h-4 w-4 ml-2 text-green-600" />
                                                              )}
                                                            </p>
                                                          )
                                                        ) : (
                                                          <p
                                                            className={`text-sm p-2 rounded mb-1 ${
                                                              solution.result === "correct" || isCorrect
                                                                ? "bg-green-50 text-green-800"
                                                                : "bg-red-50 text-red-800"
                                                            }`}
                                                          >
                                                            {String(solution.answer)}
                                                            {(solution.result === "correct" || isCorrect) && (
                                                              <Check className="inline-block h-4 w-4 ml-2 text-green-600" />
                                                            )}
                                                          </p>
                                                        )}
                                                      </div>
                                                    </div>
                                                  </div>
                                                )
                                              })}
                                            </div>
                                          </div>
                                        )
                                      })
                                    ) : (
                                      <p className="text-sm text-gray-500">No tasks found in this section.</p>
                                    )}
                                  </div>
                                )
                              })}
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

          {/* Find the sidebar section and replace it with this dropdown-based version */}

          {/* Sidebar with Document Details */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">Document Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="class-select">Class</Label>
                  <select
                    id="class-select"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select a class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exam-select">Exam</Label>
                  <select
                    id="exam-select"
                    value={selectedExam}
                    onChange={(e) => setSelectedExam(e.target.value)}
                    disabled={!currentClass}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select an exam</option>
                    {currentClass?.exams.map((exam) => (
                      <option key={exam.id} value={exam.id}>
                        {exam.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student-select">Student</Label>
                  <select
                    id="student-select"
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select a student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Document Type</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="task"
                        value="task"
                        checked={docType === "task"}
                        onChange={() => {
                          setDocType("task")
                          setUploadDocType("tasks")
                          // Find and click the upload tab if it's not already active
                          const uploadTabTrigger = document.querySelector('[data-state="inactive"][value="upload"]')
                          if (uploadTabTrigger) {
                            ;(uploadTabTrigger as HTMLElement).click()
                          }
                        }}
                        className="h-4 w-4 rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="task" className="font-normal">
                        Task
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="text"
                        value="text"
                        checked={docType === "text"}
                        onChange={() => {
                          setDocType("text")
                          setUploadDocType("text")
                          // Find and click the upload tab if it's not already active
                          const uploadTabTrigger = document.querySelector('[data-state="inactive"][value="upload"]')
                          if (uploadTabTrigger) {
                            ;(uploadTabTrigger as HTMLElement).click()
                          }
                        }}
                        className="h-4 w-4 rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="text" className="font-normal">
                        Text
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doc-title">Document Title</Label>
                  <Input
                    id="doc-title"
                    placeholder="Enter document title"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                  />
                </div>

                <Button className="w-full bg-gray-600 hover:bg-gray-700">Save Document</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">Scanning Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <p>Ensure good lighting for best results</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <p>Keep the document flat and aligned</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <p>Capture the entire document in frame</p>
                </div>
                <div className="flex items-start space-x-2">
                  <X className="h-5 w-5 text-red-500 mt-0.5" />
                  <p>Avoid shadows or glare on the document</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
