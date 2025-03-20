"use client"

import { useState } from "react"
import { ArrowLeft, Search, Filter, CheckCircle, FileText, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function Shelf() {
  // Sample corrected exam data
  const correctedExams = [
    {
      id: "class8a-midterm",
      title: "Class 8A - Midterm Exam",
      date: "Mar 5, 2025",
      class: "Class 8A",
      students: 24,
      corrected: 24,
      avgScore: "82%",
      type: "exam",
    },
    {
      id: "class7b-quiz",
      title: "Class 7B - Lab Quiz",
      date: "Mar 3, 2025",
      class: "Class 7B",
      students: 22,
      corrected: 22,
      avgScore: "78%",
      type: "quiz",
    },
    {
      id: "class9a-essay",
      title: "Class 9A - Essay Assignment",
      date: "Feb 28, 2025",
      class: "Class 9A",
      students: 18,
      corrected: 18,
      avgScore: "85%",
      type: "task",
    },
    {
      id: "class8b-quiz",
      title: "Class 8B - Quiz #4",
      date: "Feb 25, 2025",
      class: "Class 8B",
      students: 26,
      corrected: 26,
      avgScore: "76%",
      type: "quiz",
    },
    {
      id: "class8a-vocab",
      title: "Class 8A - Vocabulary Test",
      date: "Feb 20, 2025",
      class: "Class 8A",
      students: 24,
      corrected: 24,
      avgScore: "88%",
      type: "task",
    },
    {
      id: "class7b-final",
      title: "Class 7B - Final Exam",
      date: "Feb 15, 2025",
      class: "Class 7B",
      students: 22,
      corrected: 22,
      avgScore: "81%",
      type: "exam",
    },
  ]

  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const filteredExams = correctedExams
    .filter(
      (exam) =>
        exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.class.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter((exam) => activeTab === "all" || exam.type === activeTab)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href="/" className="mr-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Shelf</h1>
            <p className="text-gray-600">All corrected exams and assignments</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search corrected items..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="exam">Exams</TabsTrigger>
            <TabsTrigger value="quiz">Quizzes</TabsTrigger>
            <TabsTrigger value="task">Tasks</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => (
            <Card key={exam.id} className="overflow-hidden">
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

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{exam.students} Students</span>
                      </div>
                      <span>Avg: {exam.avgScore}</span>
                    </div>
                    <Progress value={100} className="h-2 bg-gray-200" />
                  </div>

                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/shelf/${exam.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}

