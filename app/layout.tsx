import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Navigation } from "@/components/navigation"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Amrella - Connect, Learn, Grow",
  description: "A comprehensive social learning platform where communities thrive",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navigation />
          <main className="min-h-screen bg-gray-50">{children}</main>
          <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">AM</span>
                    </div>
                    <span className="font-bold text-xl text-gray-900">Amrella</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Connect, Learn, and Grow Together. A comprehensive social learning platform where communities thrive.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Platform</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li><a href="/groups" className="hover:text-blue-600">Groups</a></li>
                    <li><a href="/courses" className="hover:text-blue-600">Courses</a></li>
                    <li><a href="/events" className="hover:text-blue-600">Events</a></li>
                    <li><a href="/forums" className="hover:text-blue-600">Forums</a></li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li><a href="/support" className="hover:text-blue-600">Help Center</a></li>
                    <li><a href="/terms" className="hover:text-blue-600">Terms of Service</a></li>
                    <li><a href="/privacy" className="hover:text-blue-600">Privacy Policy</a></li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
                <p>&copy; {new Date().getFullYear()} Amrella. All rights reserved.</p>
              </div>
            </div>
          </footer>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
