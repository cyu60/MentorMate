"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Overview", href: "/overview" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "Projects", href: "/projects/list" },
  { name: "Submit Project", href: "/projects" },
  { name: "Participants", href: "/participants" },
  { name: "Tools", href: "/tools" },
  { name: "Gallery", href: "/gallery" },
  { name: "Feed", href: "/feed" },
  { name: "Rules", href: "/rules" },
]

export function HackathonNav({ id }: { id: string }) {
  const pathname = usePathname()
  const basePath = `/events/${id}`

  return (
    <nav className="border-b bg-white sticky top-0 z-10">
      <div className="container mx-auto px-4 overflow-x-auto">
        <div className="flex space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={`${basePath}${item.href}`}
              className={cn(
                "py-4 px-1 border-b-2 text-sm font-medium transition-colors hover:border-gray-300 whitespace-nowrap",
                pathname === `${basePath}${item.href}`
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700",
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
