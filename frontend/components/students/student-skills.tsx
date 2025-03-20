"use client"

import { BarChart, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface StudentSkillsProps {
  studentId: string
  classId: string
}

interface Skill {
  name: string
  level: number
  trend: "up" | "down" | "neutral"
  lastAssessment: string
}

export default function StudentSkills({ studentId, classId }: StudentSkillsProps) {
  // Sample skills data
  const skills: Skill[] = [
    {
      name: "Grammar",
      level: 75,
      trend: "up",
      lastAssessment: "Mar 10, 2025",
    },
    {
      name: "Vocabulary",
      level: 85,
      trend: "up",
      lastAssessment: "Mar 5, 2025",
    },
    {
      name: "Reading Comprehension",
      level: 70,
      trend: "neutral",
      lastAssessment: "Feb 28, 2025",
    },
    {
      name: "Writing",
      level: 65,
      trend: "up",
      lastAssessment: "Mar 15, 2025",
    },
    {
      name: "Critical Analysis",
      level: 60,
      trend: "down",
      lastAssessment: "Mar 8, 2025",
    },
    {
      name: "Research Skills",
      level: 80,
      trend: "up",
      lastAssessment: "Mar 12, 2025",
    },
  ]

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getProgressColor = (level: number) => {
    if (level >= 80) return "bg-green-600"
    if (level >= 70) return "bg-blue-600"
    if (level >= 60) return "bg-yellow-600"
    return "bg-red-600"
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Skill Development Overview</h2>
        <p className="text-gray-600">
          Track progress across different skill areas based on assessments and completed tasks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skills.map((skill) => (
          <Card key={skill.name}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{skill.name}</CardTitle>
                {getTrendIcon(skill.trend)}
              </div>
              <CardDescription>Last assessed: {skill.lastAssessment}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Proficiency Level</span>
                  <span className="font-medium">{skill.level}%</span>
                </div>
                <Progress value={skill.level} className={getProgressColor(skill.level)} />

                <div className="pt-2 text-sm text-gray-600">
                  {skill.trend === "up" && "Improving steadily"}
                  {skill.trend === "down" && "Needs attention"}
                  {skill.trend === "neutral" && "Maintaining level"}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recommended Focus Areas</CardTitle>
          <CardDescription>Based on recent performance and skill trends</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start">
              <BarChart className="h-5 w-5 mr-2 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Critical Analysis</p>
                <p className="text-sm text-gray-600">
                  Work on analyzing texts more deeply and forming stronger arguments.
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <BarChart className="h-5 w-5 mr-2 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Writing Structure</p>
                <p className="text-sm text-gray-600">Focus on paragraph transitions and thesis development.</p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

