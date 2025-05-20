import { Book, ComputerIcon as Desktop, Users, FolderIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

type FolderIconType = "desktop" | "users" | "book" | "folder"

interface FolderCardProps {
  title: string
  description: string
  icon: FolderIconType
  imageSrc?: string
  href: string
  className?: string
}

export default function FolderCard({ title, description, icon, imageSrc, href, className }: FolderCardProps) {
  const IconComponent = () => {
    switch (icon) {
      case "desktop":
        return <Desktop className="h-6 w-6" />
      case "users":
        return <Users className="h-6 w-6" />
      case "book":
        return <Book className="h-6 w-6" />
      default:
        return <FolderIcon className="h-6 w-6" />
    }
  }

  return (
    <Link
      href={href}
      className={cn("block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200", className)}
    >
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-blue-50 p-2 rounded-full text-blue-600">
            <IconComponent />
          </div>
          <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
        </div>
        <p className="text-gray-600 text-sm mb-4">{description}</p>
        {imageSrc && (
          <div className="relative h-32 w-full overflow-hidden rounded-md bg-gray-100">
            <Image src={imageSrc || "/placeholder.svg"} alt={`${title} preview`} fill className="object-cover" />
          </div>
        )}
      </div>
    </Link>
  )
}
