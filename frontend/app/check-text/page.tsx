"use client"

import { useState } from "react"
import { ArrowLeft, Check, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CheckText() {
  const [text, setText] = useState("")
  const [result, setResult] = useState("")
  const [checkType, setCheckType] = useState("grammar")
  const [language, setLanguage] = useState("english")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!text.trim()) {
      alert("Please enter some text to check.")
      return
    }

    setIsLoading(true)
    setResult("")

    // Simulate API call
    setTimeout(() => {
      let simulatedResult = ""

      if (checkType === "grammar") {
        simulatedResult = `Grammar Check Results:

Your text appears to be grammatically correct. Here are some style suggestions:
- Consider using more varied sentence structures
- The text is clear and concise

Overall rating: Good`
      } else if (checkType === "translation") {
        simulatedResult = `Translation to ${language}:

${
  language === "spanish"
    ? "Hola, este es un texto traducido de ejemplo."
    : language === "french"
      ? "Bonjour, ceci est un exemple de texte traduit."
      : language === "german"
        ? "Hallo, dies ist ein Beispiel für übersetzten Text."
        : "This is a translated example text."
}`
      } else if (checkType === "summary") {
        simulatedResult = `Summary:

This text discusses key points about education and learning methods. The main themes include student engagement, effective teaching strategies, and assessment techniques.`
      }

      setResult(simulatedResult)
      setIsLoading(false)
    }, 1500)
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
          <h1 className="text-3xl font-bold text-gray-800">Check Text</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Input Text</CardTitle>
              <CardDescription>Enter the text you want to check or process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="check-type">Check Type</Label>
                  <RadioGroup
                    defaultValue="grammar"
                    value={checkType}
                    onValueChange={setCheckType}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="grammar" id="grammar" />
                      <Label htmlFor="grammar">Grammar & Spelling</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="translation" id="translation" />
                      <Label htmlFor="translation">Translation</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="summary" id="summary" />
                      <Label htmlFor="summary">Summarize</Label>
                    </div>
                  </RadioGroup>
                </div>

                {checkType === "translation" && (
                  <div className="space-y-2">
                    <Label htmlFor="language">Target Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="spanish">Spanish</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                        <SelectItem value="german">German</SelectItem>
                        <SelectItem value="chinese">Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="text">Text</Label>
                  <Textarea
                    id="text"
                    placeholder="Enter text here..."
                    className="min-h-[200px]"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>

                <Button onClick={handleSubmit} disabled={isLoading || !text.trim()} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Check Text
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Result</CardTitle>
              <CardDescription>AI-powered analysis and feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 border rounded-md p-4 min-h-[300px] whitespace-pre-wrap">
                {result ? result : <p className="text-gray-400 italic">Results will appear here after processing...</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
