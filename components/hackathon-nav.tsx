"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Overview", href: "/overview" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "Participants", href: "/participants/public" },
  { name: "Gallery", href: "/gallery" },
  { name: "Feed", href: "/feed/public" },
];

export function HackathonNav({ id }: { id: string }) {
  const pathname = usePathname();
  const basePath = `/events/${id}`;

  return (
    <nav className="border-b bg-white sticky top-0 z-10 w-full">
      <div className="w-full overflow-x-auto">
        <div className="flex space-x-8 pl-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={`${basePath}${item.href}`}
              className={cn(
                "py-2 px-1 border-b-2 text-sm font-medium transition-colors hover:border-gray-300 whitespace-nowrap",
                pathname === `${basePath}${item.href}`
                  ? "border-blue-800 text-blue-800"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
