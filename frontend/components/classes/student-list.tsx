"use client"

import { useState } from "react"
import { Search, Plus, MoreHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

interface StudentListProps {
  classId: string
}

export default function StudentList({ classId }: StudentListProps) {
  // In a real app, you would fetch this data based on the classId
  const students = [
    { id: "student1", name: "Emma Thompson", email: "emma.t@school.edu", grade: "A-", lastActivity: "Mar 12, 2025" },
    { id: "student2", name: "Liam Johnson", email: "liam.j@school.edu", grade: "B+", lastActivity: "Mar 11, 2025" },
    { id: "student3", name: "Olivia Davis", email: "olivia.d@school.edu", grade: "A", lastActivity: "Mar 12, 2025" },
    { id: "student4", name: "Noah Wilson", email: "noah.w@school.edu", grade: "B", lastActivity: "Mar 10, 2025" },
    { id: "student5", name: "Ava Martinez", email: "ava.m@school.edu", grade: "A+", lastActivity: "Mar 12, 2025" },
    { id: "student6", name: "Ethan Brown", email: "ethan.b@school.edu", grade: "C+", lastActivity: "Mar 9, 2025" },
    { id: "student7", name: "Sophia Lee", email: "sophia.l@school.edu", grade: "B-", lastActivity: "Mar 11, 2025" },
    { id: "student8", name: "Lucas Garcia", email: "lucas.g@school.edu", grade: "A-", lastActivity: "Mar 12, 2025" },
  ]

  const [searchTerm, setSearchTerm] = useState("")

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div>
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
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Current Grade</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.id} className="cursor-pointer hover:bg-gray-50">
                <TableCell className="font-medium">
                  <Link
                    href={`/my-groups/${classId}/student/${student.id}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {student.name}
                  </Link>
                </TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.grade}</TableCell>
                <TableCell>{student.lastActivity}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Link href={`/my-groups/${classId}/student/${student.id}`}>View Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Edit Details</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Remove</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

