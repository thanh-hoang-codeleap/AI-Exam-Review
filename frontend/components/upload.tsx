import { File } from "lucide-react"

interface UploadProps {
  file: {
    name: string
    size: string
    type: string
    progress: number
    status: "uploading" | "success" | "failed"
  }
}

export function Upload({ file }: UploadProps) {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex-shrink-0">
        <File className="h-6 w-6 text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate dark:text-white">{file.name}</p>
        <p className="text-sm text-gray-500 truncate dark:text-gray-400">{file.size}</p>
      </div>
      <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
        {file.progress}%
      </div>
    </div>
  )
}
