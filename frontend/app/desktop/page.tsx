"use client"

import { useState } from "react"
import { ArrowLeft, Search, Filter, FileText, Users, Clock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Desktop() {
  // Sample in-progress work data
  const inProgressItems = [
    {
      id: "class8a-final",
      title: "Final Exam",
      class: "Class 8A",
      date: "Mar 20, 2025",
      students: 24,
      corrected: 18,
      type: "exam",
      dueDate: "Mar 25, 2025",
    },
    {
      id: "class7b-midterm",
      title: "Midterm Exam",
      class: "Class 7B",
      date: "Mar 15, 2025",
      students: 22,
      corrected: 12,
      type: "exam",
      dueDate: "Mar 22, 2025",
    },
    {
      id: "class9a-essay",
      title: "Research Essay",
      class: "Class 9A",
      date: "Mar 18, 2025",
      students: 18,
      corrected: 5,
      type: "task",
      dueDate: "Mar 23, 2025",
    },
    {
      id: "class8b-quiz",
      title: "Chapter 5 Quiz",
      class: "Class 8B",
      date: "Mar 17, 2025",
      students: 26,
      corrected: 20,
      type: "quiz",
      dueDate: "Mar 21, 2025",
    },
    {
      id: "class8a-vocab",
      title: "Vocabulary Assignment",
      class: "Class 8A",
      date: "Mar 19, 2025",
      students: 24,
      corrected: 8,
      type: "task",
      dueDate: "Mar 24, 2025",
    },
    {
      id: "class7b-lab",
      title: "Lab Report",
      class: "Class 7B",
      date: "Mar 16, 2025",
      students: 22,
      corrected: 15,
      type: "task",
      dueDate: "Mar 23, 2025",
    },
  ]

  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const filteredItems = inProgressItems
    .filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.class.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter((item) => activeTab === "all" || item.type === activeTab)

  // Calculate days remaining until due date
  const getDaysRemaining = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Get appropriate color for days remaining
  const getDaysRemainingColor = (days: number) => {
    if (days <= 1) return "text-red-600"
    if (days <= 3) return "text-orange-600"
    return "text-green-600"
  }

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
            <h1 className="text-3xl font-bold text-gray-800">Desktop</h1>
            <p className="text-gray-600">What I'm currently working on</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search current work..."
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
          {filteredItems.map((item) => {
            const progressPercentage = Math.round((item.corrected / item.students) * 100)
            const daysRemaining = getDaysRemaining(item.dueDate)

            return (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-blue-600">{item.class}</p>
                      <CardTitle className="text-lg mt-1">{item.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-gray-600">
                        <FileText className="h-4 w-4 mr-1" />
                        <span className="text-sm">{item.date}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className={`text-sm font-medium ${getDaysRemainingColor(daysRemaining)}`}>
                          {daysRemaining} {daysRemaining === 1 ? "day" : "days"} left
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          <span>
                            {item.corrected} of {item.students} corrected
                          </span>
                        </div>
                        <span className="font-medium text-right">{item.title}</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2 bg-gray-200" />
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" asChild>
                        <Link href={`/scan-text?classId=${item.class.toLowerCase().replace(/\s+/g, "-")}`}>
                          Continue
                        </Link>
                      </Button>
                      <Button variant="outline" className="flex-1" asChild>
                        <Link href={`/my-groups/${item.class.toLowerCase().replace(/\s+/g, "-")}`}>View Class</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </main>
  )
}
