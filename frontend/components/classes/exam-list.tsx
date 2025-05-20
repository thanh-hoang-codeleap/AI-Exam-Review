"use client"

import { useState } from "react"
import { Search, ScanLine, MoreHorizontal, FileText, ChevronRight, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

interface ExamListProps {
  classId: string
}

// Define our data structure types
interface ExamContent {
  id: string
  title: string
  type: "task" | "text"
  date: string
  status: string
  score?: string
}

interface Exam {
  id: string
  title: string
  date: string
  status: string
  scanned: number
  total: number
  avgScore: string
  contents: ExamContent[]
}

// Sample data structure - exams by class
const examsByClass: Record<string, Exam[]> = {
  class8a: [
    {
      id: "midterm",
      title: "Midterm Exam",
      date: "Mar 5, 2025",
      status: "Completed",
      scanned: 24,
      total: 24,
      avgScore: "82%",
      contents: [
        {
          id: "text1",
          title: "Essay on Literature",
          type: "text",
          date: "Mar 3, 2025",
          status: "Completed",
          score: "85%",
        },
        {
          id: "task1",
          title: "Vocabulary Gap Fill",
          type: "task",
          date: "Mar 4, 2025",
          status: "Completed",
          score: "78%",
        },
        {
          id: "task2",
          title: "Grammar Multiple Choice",
          type: "task",
          date: "Mar 5, 2025",
          status: "Completed",
          score: "82%",
        },
      ],
    },
    {
      id: "final",
      title: "Final Exam",
      date: "Mar 20, 2025",
      status: "In Progress",
      scanned: 18,
      total: 24,
      avgScore: "79%",
      contents: [
        {
          id: "text2",
          title: "Research Essay",
          type: "text",
          date: "Mar 15, 2025",
          status: "Completed",
          score: "88%",
        },
        {
          id: "task3",
          title: "Literature Comprehension",
          type: "task",
          date: "Mar 18, 2025",
          status: "Completed",
          score: "75%",
        },
        {
          id: "task4",
          title: "Language Analysis",
          type: "task",
          date: "Mar 20, 2025",
          status: "In Progress",
          score: "76%",
        },
        {
          id: "text3",
          title: "Final Reflective Essay",
          type: "text",
          date: "Mar 19, 2025",
          status: "Completed",
          score: "82%",
        },
      ],
    },
  ],
  class7b: [
    {
      id: "midterm",
      title: "Midterm Exam",
      date: "Feb 28, 2025",
      status: "Completed",
      scanned: 23,
      total: 24,
      avgScore: "88%",
      contents: [
        {
          id: "text1",
          title: "Lab Report Essay",
          type: "text",
          date: "Feb 25, 2025",
          status: "Completed",
          score: "90%",
        },
        {
          id: "task1",
          title: "Chemistry Multiple Choice",
          type: "task",
          date: "Feb 26, 2025",
          status: "Completed",
          score: "85%",
        },
      ],
    },
    {
      id: "quiz",
      title: "Lab Quiz",
      date: "Mar 3, 2025",
      status: "Completed",
      scanned: 22,
      total: 24,
      avgScore: "78%",
      contents: [
        {
          id: "task2",
          title: "Lab Safety Questions",
          type: "task",
          date: "Mar 3, 2025",
          status: "Completed",
          score: "78%",
        },
      ],
    },
    {
      id: "final",
      title: "Final Exam",
      date: "Mar 25, 2025",
      status: "Pending",
      scanned: 0,
      total: 24,
      avgScore: "-",
      contents: [
        {
          id: "text2",
          title: "Final Research Essay",
          type: "text",
          date: "Mar 22, 2025",
          status: "Pending",
          score: "-",
        },
        {
          id: "task3",
          title: "Physics Problem Set",
          type: "task",
          date: "Mar 23, 2025",
          status: "Pending",
          score: "-",
        },
        {
          id: "task4",
          title: "Chemistry Multiple Choice",
          type: "task",
          date: "Mar 24, 2025",
          status: "Pending",
          score: "-",
        },
        {
          id: "task5",
          title: "Biology Gap Fill",
          type: "task",
          date: "Mar 25, 2025",
          status: "Pending",
          score: "-",
        },
      ],
    },
  ],
  class9a: [
    {
      id: "midterm",
      title: "Midterm Exam",
      date: "Mar 10, 2025",
      status: "Completed",
      scanned: 18,
      total: 18,
      avgScore: "85%",
      contents: [
        {
          id: "text1",
          title: "Analysis Essay",
          type: "text",
          date: "Mar 8, 2025",
          status: "Completed",
          score: "87%",
        },
        {
          id: "task1",
          title: "Reading Comprehension",
          type: "task",
          date: "Mar 9, 2025",
          status: "Completed",
          score: "83%",
        },
      ],
    },
  ],
  class8b: [
    {
      id: "quiz",
      title: "Chapter 5 Quiz",
      date: "Mar 17, 2025",
      status: "In Progress",
      scanned: 20,
      total: 26,
      avgScore: "76%",
      contents: [
        {
          id: "task1",
          title: "Vocabulary Test",
          type: "task",
          date: "Mar 17, 2025",
          status: "In Progress",
          score: "76%",
        },
      ],
    },
  ],
}

export default function ExamList({ classId }: ExamListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentView, setCurrentView] = useState<"exams" | "contents">("exams")
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)

  // Get exams for this class
  const exams = examsByClass[classId] || []

  // Filter exams based on search term
  const filteredExams = exams.filter((exam) => exam.title.toLowerCase().includes(searchTerm.toLowerCase()))

  // Navigate to exams view
  const showExams = () => {
    setCurrentView("exams")
    setSelectedExam(null)
  }

  // Navigate to contents view
  const showContents = (exam: Exam) => {
    setCurrentView("contents")
    setSelectedExam(exam)
  }

  // Get content type badge color
  const getContentTypeColor = (type: string) => {
    switch (type) {
      case "text":
        return "bg-blue-100 text-blue-800"
      case "task":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Count content types
  const countContentTypes = (contents: ExamContent[]) => {
    const counts = {
      task: 0,
      text: 0,
    }

    contents.forEach((content) => {
      counts[content.type]++
    })

    return counts
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search exams..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Create Exam
          </Button>
          <Link href={`/scan-text?classId=${classId}`}>
            <Button>
              <ScanLine className="mr-2 h-4 w-4" />
              Scan Exams
            </Button>
          </Link>
        </div>
      </div>

      {/* Navigation breadcrumbs */}
      {currentView === "contents" && selectedExam && (
        <div className="flex items-center mb-4 text-sm text-gray-600">
          <Button variant="ghost" size="sm" onClick={showExams} className="hover:bg-transparent p-0 h-auto">
            Exams
          </Button>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="font-medium">{selectedExam.title}</span>
        </div>
      )}

      {/* Exams View */}
      {currentView === "exams" && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Contents</TableHead>
                <TableHead>Scanned</TableHead>
                <TableHead>Avg. Score</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExams.map((exam) => {
                const contentCounts = countContentTypes(exam.contents)

                return (
                  <TableRow
                    key={exam.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => showContents(exam)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <span className="mr-2">{exam.title}</span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </TableCell>
                    <TableCell>{exam.date}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          exam.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : exam.status === "In Progress"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {exam.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {contentCounts.text > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            {contentCounts.text} {contentCounts.text === 1 ? "Text" : "Texts"}
                          </span>
                        )}
                        {contentCounts.task > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                            {contentCounts.task} {contentCounts.task === 1 ? "Task" : "Tasks"}
                          </span>
                        )}
                        {exam.contents.length === 0 && <span className="text-sm text-gray-400">No content</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {exam.scanned} / {exam.total}
                    </TableCell>
                    <TableCell>{exam.avgScore}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit Exam</DropdownMenuItem>
                          <DropdownMenuItem>Download Results</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Contents View */}
      {currentView === "contents" && selectedExam && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">{selectedExam.title} Contents</h3>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Content
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedExam.contents.length > 0 ? (
                  selectedExam.contents.map((content) => (
                    <TableRow key={content.id}>
                      <TableCell className="font-medium">{content.title}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getContentTypeColor(content.type)}`}>
                          {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>{content.date}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            content.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : content.status === "In Progress"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {content.status}
                        </span>
                      </TableCell>
                      <TableCell>{content.score || "-"}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No content has been added to this exam yet.
                      <div className="mt-2">
                        <Button size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Content
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
