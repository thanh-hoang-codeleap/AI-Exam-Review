import { FileText, Users, BarChart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface ExamData {
  id: string
  title: string
  date: string
  class: string
  students: number
  avgScore: string
  imageSrc: string
}

interface ExamCardProps {
  examData: ExamData
}

export default function ExamCard({ examData }: ExamCardProps) {
  return (
    <Link
      href={`/shelf/${examData.id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
    >
      <div className="relative h-40 w-full">
        <Image
          src={examData.imageSrc || "/placeholder.svg"}
          alt={examData.title}
          fill
          className="object-cover rounded-t-lg"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-lg"></div>
        <div className="absolute bottom-0 left-0 p-4 text-white">
          <h3 className="font-bold text-lg">{examData.title}</h3>
          <p className="text-sm opacity-90">{examData.date}</p>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center text-gray-600 mb-2">
          <FileText className="h-4 w-4 mr-2" />
          <span className="text-sm">{examData.class}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{examData.students} Students</span>
          </div>
          <div className="flex items-center">
            <BarChart className="h-4 w-4 mr-1" />
            <span>Avg: {examData.avgScore}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
