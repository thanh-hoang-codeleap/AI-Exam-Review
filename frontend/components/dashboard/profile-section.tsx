import { UserCircle, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ProfileSection() {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-col items-center">
        <div className="relative w-20 h-20 mb-3">
          <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <UserCircle className="w-16 h-16" />
          </div>
        </div>
        <h3 className="font-medium text-gray-800">Ms. Johnson</h3>
        <p className="text-sm text-gray-500 mb-3">English Teacher</p>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              Profile Options
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
