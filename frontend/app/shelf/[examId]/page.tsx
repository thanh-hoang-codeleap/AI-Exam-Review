"use client"

import { useState } from "react"
import { ArrowLeft, Search, CheckCircle, FileText, Users, Download, Printer } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ShelfDetailPageProps {
  params: {
    examId: string
  }
}

export default function ShelfDetailPage({ params }: ShelfDetailPageProps) {
  // In a real app, you would fetch this data based on the examId
  const examId = params.examId

  // Extract class ID from exam ID (e.g., "class8a-midterm" -> "class8a")
  const classId = examId.split("-")[0]

  // Get class name from class ID
  const className =
    classId === "class8a"
      ? "Class 8A"
      : classId === "class7b"
        ? "Class 7B"
        : classId === "class9a"
          ? "Class 9A"
          : classId === "class8b"
            ? "Class 8B"
            : "Unknown Class"

  // Get exam title from exam ID
  const examTitle = examId.includes("midterm")
    ? "Midterm Exam"
    : examId.includes("final")
      ? "Final Exam"
      : examId.includes("quiz")
        ? "Quiz"
        : examId.includes("vocab")
          ? "Vocabulary Test"
          : examId.includes("essay")
            ? "Essay Assignment"
            : "Unknown Exam"

  // Sample exam data
  const examData = {
    id: examId,
    title: `${className} - ${examTitle}`,
    date: "Mar 5, 2025",
    class: className,
    students: 24,
    corrected: 24,
    avgScore: "82%",
    type: examId.includes("quiz") ? "quiz" : examId.includes("essay") || examId.includes("vocab") ? "task" : "exam",
  }

  // Sample student results
  const studentResults = [
    { id: 1, name: "Emma Thompson", score: "92%", status: "Excellent", date: "Mar 3, 2025", feedback: true },
    { id: 2, name: "Liam Johnson", score: "85%", status: "Good", date: "Mar 3, 2025", feedback: true },
    { id: 3, name: "Olivia Davis", score: "78%", status: "Satisfactory", date: "Mar 4, 2025", feedback: true },
    { id: 4, name: "Noah Wilson", score: "65%", status: "Needs Improvement", date: "Mar 4, 2025", feedback: true },
    { id: 5, name: "Ava Martinez", score: "95%", status: "Excellent", date: "Mar 3, 2025", feedback: true },
    { id: 6, name: "Ethan Brown", score: "72%", status: "Satisfactory", date: "Mar 5, 2025", feedback: true },
    { id: 7, name: "Sophia Lee", score: "88%", status: "Good", date: "Mar 4, 2025", feedback: true },
    { id: 8, name: "Lucas Garcia", score: "81%", status: "Good", date: "Mar 5, 2025", feedback: true },
    { id: 9, name: "Isabella Rodriguez", score: "76%", status: "Satisfactory", date: "Mar 5, 2025", feedback: true },
    { id: 10, name: "Mason Smith", score: "90%", status: "Excellent", date: "Mar 3, 2025", feedback: true },
    { id: 11, name: "Mia Hernandez", score: "83%", status: "Good", date: "Mar 4, 2025", feedback: true },
    { id: 12, name: "James Johnson", score: "79%", status: "Satisfactory", date: "Mar 5, 2025", feedback: true },
  ]

  // Sample corrected exams for the same class
  const classExams = [
    {
      id: `${classId}-midterm`,
      title: `${className} - Midterm Exam`,
      date: "Mar 5, 2025",
      students: 24,
      corrected: 24,
      avgScore: "82%",
      type: "exam",
    },
    {
      id: `${classId}-quiz1`,
      title: `${className} - Quiz #1`,
      date: "Feb 15, 2025",
      students: 24,
      corrected: 24,
      avgScore: "79%",
      type: "quiz",
    },
    {
      id: `${classId}-vocab`,
      title: `${className} - Vocabulary Test`,
      date: "Feb 20, 2025",
      students: 24,
      corrected: 24,
      avgScore: "88%",
      type: "task",
    },
    {
      id: `${classId}-essay`,
      title: `${className} - Essay Assignment`,
      date: "Feb 28, 2025",
      students: 24,
      corrected: 24,
      avgScore: "85%",
      type: "task",
    },
  ]

  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("students")

  const filteredStudents = studentResults.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Excellent":
        return "bg-green-100 text-green-800"
      case "Good":
        return "bg-blue-100 text-blue-800"
      case "Satisfactory":
        return "bg-yellow-100 text-yellow-800"
      case "Needs Improvement":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href="/shelf" className="mr-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{examData.title}</h1>
            <p className="text-gray-600">Completed on {examData.date}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <div className="text-4xl font-bold text-blue-600">{examData.avgScore}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <div className="text-4xl font-bold text-green-600">{examData.students}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <Badge className="text-lg py-1 px-3 bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Completed
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search students..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Results
            </Button>
            <Button variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Print Report
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="students">Student Results</TabsTrigger>
            <TabsTrigger value="class-exams">Class Exams</TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Corrected Date</TableHead>
                    <TableHead>Feedback</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/my-groups/${classId}/student/student${student.id}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {student.name}
                        </Link>
                      </TableCell>
                      <TableCell>{student.score}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(student.status)}`}>
                          {student.status}
                        </span>
                      </TableCell>
                      <TableCell>{student.date}</TableCell>
                      <TableCell>
                        {student.feedback ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="class-exams">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classExams.map((exam) => (
                <Card key={exam.id} className={`overflow-hidden ${exam.id === examId ? "ring-2 ring-blue-500" : ""}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{exam.title}</CardTitle>
                      <Badge
                        className={`
                          ${
                            exam.type === "exam"
                              ? "bg-blue-100 text-blue-800 border-blue-200"
                              : exam.type === "quiz"
                                ? "bg-purple-100 text-purple-800 border-purple-200"
                                : "bg-green-100 text-green-800 border-green-200"
                          }
                        `}
                      >
                        {exam.type.charAt(0).toUpperCase() + exam.type.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{exam.date}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-gray-600">
                          <FileText className="h-4 w-4 mr-2" />
                          <span className="text-sm">{exam.class}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                          <span className="text-sm font-medium">100% Complete</span>
                        </div>
                      </div>

                      <div className="flex justify-between text-sm">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{exam.students} Students</span>
                        </div>
                        <span>Avg: {exam.avgScore}</span>
                      </div>

                      <Button variant={exam.id === examId ? "default" : "outline"} className="w-full" asChild>
                        <Link href={`/shelf/${exam.id}`}>{exam.id === examId ? "Current Exam" : "View Details"}</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
