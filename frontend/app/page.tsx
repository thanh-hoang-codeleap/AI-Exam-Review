import FolderCard from "@/components/dashboard/folder-card"
import QuickStarter from "@/components/dashboard/quick-starter"
import ProfileSection from "@/components/dashboard/profile-section"

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Main content area */}
          <div className="w-full md:w-3/4 space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>

            {/* Folders section */}
            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">My Workspace</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FolderCard
                  title="Desktop"
                  description="What I'm currently working on"
                  icon="desktop"
                  imageSrc="/placeholder.svg?height=120&width=200"
                  href="/desktop"
                />
                <FolderCard
                  title="My Groups"
                  description="My learning groups and classes"
                  icon="users"
                  imageSrc="/placeholder.svg?height=120&width=200"
                  href="/my-groups"
                />
                <FolderCard
                  title="Shelf"
                  description="Corrected exams and assignments"
                  icon="book"
                  imageSrc="/placeholder.svg?height=120&width=200"
                  href="/shelf"
                />
              </div>
            </section>

            {/* Quick starters */}
            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Quick Starters</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <QuickStarter
                  title="Check Word/Sentence Online"
                  description="Quickly verify language accuracy"
                  icon="search"
                  href="/check-text"
                />
                <QuickStarter
                  title="Scan New Text"
                  description="Scan and process new documents"
                  icon="scan"
                  href="/scan-text"
                />
              </div>
            </section>

            {/* Recent activity */}
            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent Activity</h2>
              <div className="bg-white rounded-lg shadow p-4">
                <ul className="divide-y divide-gray-200">
                  <li className="py-3">
                    <p className="text-sm text-gray-600">
                      Scanned 12 exams for <span className="font-medium">Class 8A</span>
                    </p>
                    <p className="text-xs text-gray-400">Today, 10:23 AM</p>
                  </li>
                  <li className="py-3">
                    <p className="text-sm text-gray-600">
                      Added 3 students to <span className="font-medium">Class 7B</span>
                    </p>
                    <p className="text-xs text-gray-400">Yesterday, 2:45 PM</p>
                  </li>
                  <li className="py-3">
                    <p className="text-sm text-gray-600">
                      Completed grading for <span className="font-medium">Class 9A Quiz #3</span>
                    </p>
                    <p className="text-xs text-gray-400">Mar 12, 2025</p>
                  </li>
                </ul>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-1/4 space-y-6">
            <ProfileSection />

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-medium text-gray-700 mb-2">Upcoming Deadlines</h3>
              <ul className="space-y-2">
                <li className="text-sm">
                  <span className="text-red-500 font-medium">Today:</span> Grade History Papers
                </li>
                <li className="text-sm">
                  <span className="text-orange-500 font-medium">Tomorrow:</span> Science Quiz
                </li>
                <li className="text-sm">
                  <span className="text-blue-500 font-medium">Mar 15:</span> Parent-Teacher Meetings
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

