"use client"

import { MessageSquare, AlertCircle, CheckCircle, HelpCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface StudentFeedbackProps {
  studentId: string
  classId: string
}

interface FeedbackItem {
  id: string
  date: string
  type: "summary" | "mistake" | "improvement" | "question"
  content: string
}

export default function StudentFeedback({ studentId, classId }: StudentFeedbackProps) {
  // Get student name based on ID
  const studentName =
    studentId === "student1"
      ? "Emma"
      : studentId === "student2"
        ? "Liam"
        : studentId === "student3"
          ? "Olivia"
          : "Student"

  // Sample feedback data
  const feedbackItems: FeedbackItem[] = [
    {
      id: "feedback1",
      date: "Mar 15, 2025",
      type: "summary",
      content: `Dear ${studentName},\n\nIn the past three months, your texts have shown the following patterns of mistakes:\n\n1. Subject-verb agreement issues, particularly with complex subjects\n2. Inconsistent use of verb tenses within paragraphs\n3. Run-on sentences that could benefit from being broken up\n\nYour strengths include excellent vocabulary usage and creative expression. I recommend focusing on sentence structure in your upcoming assignments.`,
    },
    {
      id: "feedback2",
      date: "Feb 28, 2025",
      type: "mistake",
      content: `I've noticed a recurring issue with comma usage in your recent assignments. Specifically, you often omit commas in compound sentences. Remember to use a comma before coordinating conjunctions (and, but, or, nor, for, so, yet) when they connect independent clauses.`,
    },
    {
      id: "feedback3",
      date: "Feb 15, 2025",
      type: "improvement",
      content: `Your vocabulary usage has shown significant improvement over the last month. I'm particularly impressed with your incorporation of academic terminology in your latest essay. Continue building on this strength by reading scholarly articles in your areas of interest.`,
    },
    {
      id: "feedback4",
      date: "Mar 5, 2025",
      type: "question",
      content: `You asked about the difference between "affect" and "effect" in your last assignment. "Affect" is typically used as a verb meaning to influence something, while "effect" is typically used as a noun meaning the result of an action. For example: "The weather affected our plans" vs. "The effect of the weather was that we stayed indoors."`,
    },
  ]

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case "summary":
        return <MessageSquare className="h-5 w-5 text-blue-600" />
      case "mistake":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case "improvement":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "question":
        return <HelpCircle className="h-5 w-5 text-purple-600" />
      default:
        return <MessageSquare className="h-5 w-5 text-blue-600" />
    }
  }

  const getFeedbackTitle = (type: string) => {
    switch (type) {
      case "summary":
        return "Periodic Summary"
      case "mistake":
        return "Common Mistake Pattern"
      case "improvement":
        return "Improvement Noted"
      case "question":
        return "Question Response"
      default:
        return "Feedback"
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Personalized Feedback</h2>
        <p className="text-gray-600">Review feedback on past work and track improvement areas over time.</p>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Feedback</TabsTrigger>
          <TabsTrigger value="summary">Summaries</TabsTrigger>
          <TabsTrigger value="mistake">Mistakes</TabsTrigger>
          <TabsTrigger value="improvement">Improvements</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="space-y-4">
            {feedbackItems.map((item) => (
              <Card key={item.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    {getFeedbackIcon(item.type)}
                    <CardTitle className="text-lg">{getFeedbackTitle(item.type)}</CardTitle>
                  </div>
                  <CardDescription>{item.date}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-line text-gray-700">{item.content}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="summary">
          <div className="space-y-4">
            {feedbackItems
              .filter((item) => item.type === "summary")
              .map((item) => (
                <Card key={item.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      {getFeedbackIcon(item.type)}
                      <CardTitle className="text-lg">{getFeedbackTitle(item.type)}</CardTitle>
                    </div>
                    <CardDescription>{item.date}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-line text-gray-700">{item.content}</div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="mistake">
          <div className="space-y-4">
            {feedbackItems
              .filter((item) => item.type === "mistake")
              .map((item) => (
                <Card key={item.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      {getFeedbackIcon(item.type)}
                      <CardTitle className="text-lg">{getFeedbackTitle(item.type)}</CardTitle>
                    </div>
                    <CardDescription>{item.date}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-line text-gray-700">{item.content}</div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="improvement">
          <div className="space-y-4">
            {feedbackItems
              .filter((item) => item.type === "improvement")
              .map((item) => (
                <Card key={item.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      {getFeedbackIcon(item.type)}
                      <CardTitle className="text-lg">{getFeedbackTitle(item.type)}</CardTitle>
                    </div>
                    <CardDescription>{item.date}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-line text-gray-700">{item.content}</div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
