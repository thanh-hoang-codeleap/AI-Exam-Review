"use client"

import { useState } from "react"
import { ArrowLeft, Plus, Search } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ClassCard from "@/components/classes/class-card"

export default function MyGroups() {
  // Sample class data
  const classes = [
    {
      id: "class8a",
      name: "Class 8A",
      grade: "8th Grade",
      students: 24,
      lastActivity: "Mar 12, 2025",
      imageSrc: "/placeholder.svg?height=120&width=200",
    },
    {
      id: "class7b",
      name: "Class 7B",
      grade: "7th Grade",
      students: 22,
      lastActivity: "Mar 11, 2025",
      imageSrc: "/placeholder.svg?height=120&width=200",
    },
    {
      id: "class9a",
      name: "Class 9A",
      grade: "9th Grade",
      students: 18,
      lastActivity: "Mar 10, 2025",
      imageSrc: "/placeholder.svg?height=120&width=200",
    },
    {
      id: "class8b",
      name: "Class 8B",
      grade: "8th Grade",
      students: 26,
      lastActivity: "Mar 9, 2025",
      imageSrc: "/placeholder.svg?height=120&width=200",
    },
  ]

  const [searchTerm, setSearchTerm] = useState("")

  const filteredClasses = classes.filter(
    (classItem) =>
      classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.grade.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href="/" className="mr-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">My Groups</h1>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search classes..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Class
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((classItem) => (
            <ClassCard key={classItem.id} classData={classItem} />
          ))}
        </div>
      </div>
    </main>
  )
}
