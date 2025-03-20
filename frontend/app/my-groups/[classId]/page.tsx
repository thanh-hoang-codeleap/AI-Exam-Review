import { ArrowLeft, Users, FileText } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StudentList from "@/components/classes/student-list"
import ExamList from "@/components/classes/exam-list"

interface ClassPageProps {
  params: {
    classId: string
  }
}

export default function ClassPage({ params }: ClassPageProps) {
  // In a real app, you would fetch this data based on the classId
  const classData = {
    id: params.classId,
    name:
      params.classId === "class8a"
        ? "Class 8A"
        : params.classId === "class7b"
          ? "Class 7B"
          : params.classId === "class9a"
            ? "Class 9A"
            : params.classId === "class8b"
              ? "Class 8B"
              : "Class " + params.classId,
    grade: params.classId.includes("8")
      ? "8th Grade"
      : params.classId.includes("7")
        ? "7th Grade"
        : params.classId.includes("9")
          ? "9th Grade"
          : "Grade Unknown",
    students: 24,
    description:
      "This class focuses on fundamental language skills including grammar, vocabulary, and writing techniques.",
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href="/my-groups" className="mr-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{classData.name}</h1>
            <p className="text-gray-600">
              {classData.grade} • {classData.students} Students
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-2">Class Overview</h2>
          <p className="text-gray-700 mb-4">{classData.description}</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              Edit Class
            </Button>
            <Button variant="outline" size="sm">
              Add Students
            </Button>
            <Button variant="outline" size="sm">
              Create New Exam
            </Button>
          </div>
        </div>

        <Tabs defaultValue="students">
          <TabsList className="mb-6">
            <TabsTrigger value="students" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="exams" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Exams
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <StudentList classId={params.classId} />
          </TabsContent>

          <TabsContent value="exams">
            <ExamList classId={params.classId} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

