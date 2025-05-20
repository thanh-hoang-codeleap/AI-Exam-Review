import { Users } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface ClassData {
  id: string
  name: string
  grade: string
  students: number
  lastActivity: string
  imageSrc: string
}

interface ClassCardProps {
  classData: ClassData
}

export default function ClassCard({ classData }: ClassCardProps) {
  return (
    <Link
      href={`/my-groups/${classData.id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
    >
      <div className="relative h-40 w-full">
        <Image
          src={classData.imageSrc || "/placeholder.svg"}
          alt={classData.name}
          fill
          className="object-cover rounded-t-lg"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-lg"></div>
        <div className="absolute bottom-0 left-0 p-4 text-white">
          <h3 className="font-bold text-xl">{classData.name}</h3>
          <p className="text-sm opacity-90">{classData.grade}</p>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center text-gray-600 mb-2">
          <Users className="h-4 w-4 mr-2" />
          <span className="text-sm">{classData.students} Students</span>
        </div>
        <p className="text-xs text-gray-500">Last activity: {classData.lastActivity}</p>
      </div>
    </Link>
  )
}
