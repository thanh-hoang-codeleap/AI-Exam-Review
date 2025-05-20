"use client"

import { useState } from "react"
import { Search, Plus, MoreHorizontal, FileText, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

interface StudentTaskListProps {
  studentId: string
  classId: string
}

interface Task {
  id: string
  title: string
  type: "task" | "text"
  date: string
  status: "Completed" | "Pending" | "Graded"
  score?: string
}

export default function StudentTaskList({ studentId, classId }: StudentTaskListProps) {
  // Sample tasks data
  const tasks: Task[] = [
    {
      id: "task1",
      title: "Vocabulary Gap Fill",
      type: "task",
      date: "Mar 15, 2025",
      status: "Graded",
      score: "85%",
    },
    {
      id: "task2",
      title: "Grammar Multiple Choice",
      type: "task",
      date: "Mar 10, 2025",
      status: "Graded",
      score: "92%",
    },
    {
      id: "text1",
      title: "Essay on Literature",
      type: "text",
      date: "Mar 5, 2025",
      status: "Graded",
      score: "78%",
    },
    {
      id: "task3",
      title: "Reading Comprehension",
      type: "task",
      date: "Mar 3, 2025",
      status: "Graded",
      score: "88%",
    },
    {
      id: "text2",
      title: "Research Paper Draft",
      type: "text",
      date: "Mar 18, 2025",
      status: "Pending",
    },
  ]

  const [searchTerm, setSearchTerm] = useState("")

  const filteredTasks = tasks.filter((task) => task.title.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search tasks..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Link href={`/scan-text?classId=${classId}&studentId=${studentId}`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Task
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="overflow-hidden">
            <CardHeader className={`py-3 ${task.type === "task" ? "bg-purple-50" : "bg-blue-50"}`}>
              <CardTitle className="text-base flex justify-between items-center">
                <span>{task.title}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Download</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center text-sm text-gray-600">
                  <FileText className="h-4 w-4 mr-1" />
                  <span>{task.type.charAt(0).toUpperCase() + task.type.slice(1)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{task.date}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    task.status === "Graded"
                      ? "bg-green-100 text-green-800"
                      : task.status === "Completed"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {task.status}
                </span>
                {task.score && <span className="font-medium text-sm">Score: {task.score}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
