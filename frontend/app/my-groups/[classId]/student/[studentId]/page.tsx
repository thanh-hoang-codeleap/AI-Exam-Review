"use client"

import { useState } from "react"
import { ArrowLeft, FileText, BarChart, MessageSquare, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import StudentTaskList from "@/components/students/student-task-list"
import StudentFeedback from "@/components/students/student-feedback"
import StudentExams from "@/components/students/student-exams"
import StudentSkills from "@/components/students/student-skills"

interface StudentPageProps {
  params: {
    classId: string
    studentId: string
  }
}

export default function StudentPage({ params }: StudentPageProps) {
  // In a real app, you would fetch this data based on the studentId
  const student = {
    id: params.studentId,
    name:
      params.studentId === "student1"
        ? "Emma Thompson"
        : params.studentId === "student2"
          ? "Liam Johnson"
          : params.studentId === "student3"
            ? "Olivia Davis"
            : "Student " + params.studentId,
    grade: "10th Grade",
    email: "student@school.edu",
    averageGrade: "B+",
    lastActivity: "Mar 12, 2025",
  }

  const [activeTab, setActiveTab] = useState("tasks")

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href={`/my-groups/${params.classId}`} className="mr-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center">
            <Avatar className="h-12 w-12 mr-4">
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {student.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{student.name}</h1>
              <p className="text-gray-600">
                {student.grade} • {student.email}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-4 border rounded-lg">
              <h3 className="font-medium text-gray-700">Average Grade</h3>
              <p className="text-2xl font-bold text-blue-600">{student.averageGrade}</p>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-lg">
              <h3 className="font-medium text-gray-700">Completed Tasks</h3>
              <p className="text-2xl font-bold text-green-600">12</p>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-lg">
              <h3 className="font-medium text-gray-700">Last Activity</h3>
              <p className="text-2xl font-bold text-purple-600">{student.lastActivity}</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="tasks" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="exams" className="flex items-center">
              <CheckCircle className="mr-2 h-4 w-4" />
              Corrected Exams
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center">
              <BarChart className="mr-2 h-4 w-4" />
              Skill Development
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center">
              <MessageSquare className="mr-2 h-4 w-4" />
              Feedback
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks">
            <StudentTaskList studentId={params.studentId} classId={params.classId} />
          </TabsContent>

          <TabsContent value="exams">
            <StudentExams studentId={params.studentId} classId={params.classId} />
          </TabsContent>

          <TabsContent value="skills">
            <StudentSkills studentId={params.studentId} classId={params.classId} />
          </TabsContent>

          <TabsContent value="feedback">
            <StudentFeedback studentId={params.studentId} classId={params.classId} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
