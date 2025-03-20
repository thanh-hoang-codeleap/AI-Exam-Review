"use client"

import { useState } from "react"
import { Search, FileCheck, MoreHorizontal, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface StudentExamsProps {
  studentId: string
  classId: string
}

interface CorrectedExam {
  id: string
  title: string
  date: string
  score: string
  feedback: string
  mistakes: string[]
}

export default function StudentExams({ studentId, classId }: StudentExamsProps) {
  // Sample corrected exams data
  const exams: CorrectedExam[] = [
    {
      id: "exam1",
      title: "Midterm Exam - Grammar Test",
      date: "Mar 5, 2025",
      score: "82%",
      feedback: "Good understanding of grammar concepts. Work on verb tenses.",
      mistakes: ["Subject-verb agreement", "Past perfect usage"],
    },
    {
      id: "exam2",
      title: "Vocabulary Quiz",
      date: "Feb 20, 2025",
      score: "90%",
      feedback: "Excellent vocabulary knowledge. Continue expanding your academic vocabulary.",
      mistakes: ["Spelling errors"],
    },
    {
      id: "exam3",
      title: "Essay on Literature",
      date: "Feb 15, 2025",
      score: "78%",
      feedback: "Good analysis but needs more supporting evidence. Work on paragraph structure.",
      mistakes: ["Paragraph transitions", "Citation format", "Thesis clarity"],
    },
    {
      id: "exam4",
      title: "Reading Comprehension Test",
      date: "Feb 10, 2025",
      score: "85%",
      feedback: "Strong understanding of main ideas. Work on inferential questions.",
      mistakes: ["Inference questions", "Detail identification"],
    },
  ]

  const [searchTerm, setSearchTerm] = useState("")

  const filteredExams = exams.filter((exam) => exam.title.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search corrected exams..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredExams.map((exam) => (
          <Card key={exam.id} className="overflow-hidden">
            <CardHeader className="py-3 bg-green-50">
              <CardTitle className="text-base flex justify-between items-center">
                <span>{exam.title}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Full Correction</DropdownMenuItem>
                    <DropdownMenuItem>Download</DropdownMenuItem>
                    <DropdownMenuItem>Print</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{exam.date}</span>
                </div>
                <div className="flex items-center">
                  <FileCheck className="h-4 w-4 mr-1 text-green-600" />
                  <span className="font-medium text-green-600">{exam.score}</span>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-sm text-gray-700">{exam.feedback}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {exam.mistakes.map((mistake, index) => (
                  <Badge key={index} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    {mistake}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

