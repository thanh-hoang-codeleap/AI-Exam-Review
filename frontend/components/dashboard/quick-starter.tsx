import { Search, ScanLine } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

type QuickStarterIconType = "search" | "scan"

interface QuickStarterProps {
  title: string
  description: string
  icon: QuickStarterIconType
  href: string
  className?: string
}

export default function QuickStarter({ title, description, icon, href, className }: QuickStarterProps) {
  const IconComponent = () => {
    switch (icon) {
      case "search":
        return <Search className="h-5 w-5" />
      case "scan":
        return <ScanLine className="h-5 w-5" />
      default:
        return <Search className="h-5 w-5" />
    }
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-4 bg-white rounded-lg shadow p-4 hover:bg-blue-50 transition-colors duration-200",
        className,
      )}
    >
      <div className="bg-blue-100 p-3 rounded-full text-blue-600">
        <IconComponent />
      </div>
      <div>
        <h3 className="font-medium text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </Link>
  )
}
