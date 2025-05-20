"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, RefreshCw, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function DocumentScanner() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    return () => {
      // Clean up camera stream when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        const tracks = stream.getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraActive(true)
        setCapturedImage(null)
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
    }
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw video frame to canvas
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convert canvas to image data URL
        const imageDataUrl = canvas.toDataURL("image/png")
        setCapturedImage(imageDataUrl)

        // Stop camera stream
        const stream = video.srcObject as MediaStream
        const tracks = stream.getTracks()
        tracks.forEach((track) => track.stop())

        setIsCameraActive(false)

        // Simulate processing
        setIsProcessing(true)
        setTimeout(() => {
          setIsProcessing(false)
        }, 2000)
      }
    }
  }

  const resetCamera = () => {
    setCapturedImage(null)
    startCamera()
  }

  const handleUseImage = () => {
    // Simulate successful processing
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      // In a real app, this would save the image to the server
      alert("Document processed successfully!")
    }, 1500)
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative bg-black aspect-[4/3] flex items-center justify-center">
        {isCameraActive ? (
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        ) : capturedImage ? (
          <img
            src={capturedImage || "/placeholder.svg"}
            alt="Captured document"
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-white text-center p-8">
            <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Camera preview will appear here</p>
          </div>
        )}

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} className="hidden" />

        {isProcessing && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white">
            <RefreshCw className="h-10 w-10 animate-spin mb-4" />
            <p>Processing document...</p>
          </div>
        )}

        {!isProcessing && capturedImage && (
          <div className="absolute bottom-0 left-0 right-0 bg-green-600/90 p-2 text-white text-center">
            <Check className="h-4 w-4 inline-block mr-1" />
            <span>Document captured successfully</span>
          </div>
        )}
      </div>

      <div className="p-4 flex justify-center gap-4">
        {!isCameraActive && !capturedImage ? (
          <Button onClick={startCamera} size="lg">
            <Camera className="mr-2 h-4 w-4" />
            Start Camera
          </Button>
        ) : isCameraActive ? (
          <Button onClick={captureImage} size="lg">
            <Camera className="mr-2 h-4 w-4" />
            Capture Document
          </Button>
        ) : (
          <>
            <Button onClick={resetCamera} variant="outline" size="lg">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retake
            </Button>
            <Button size="lg" disabled={isProcessing} onClick={handleUseImage}>
              <Check className="mr-2 h-4 w-4" />
              Use This Image
            </Button>
          </>
        )}
      </div>
    </Card>
  )
}
