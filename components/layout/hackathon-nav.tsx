"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEventRegistration } from "@/components/event-registration-provider";

const navItems = [
  { name: "Overview", href: "/overview", public: true },
  { name: "Dashboard", href: "/dashboard", public: false },
  { name: "Participants", href: "/participants/public", public: false },
  { name: "Gallery", href: "/gallery", public: false },
  { name: "Feed", href: "/feed/public", public: false },
  { name: "Tools", href: "/tools", public: false },
];

export function HackathonNav({ id }: { id: string }) {
  const pathname = usePathname();
  const basePath = `/events/${id}`;
  const { isRegistered } = useEventRegistration();

  const visibleNavItems = navItems.filter(
    (item) => item.public || isRegistered
  );

  return (
    <nav className="w-full">
      <div className="overflow-x-auto py-10">
        <ul className="flex space-x-6 px-4 border-gray-200/30">
          {visibleNavItems.map((item) => {
            const isActive = pathname === `${basePath}${item.href}`;
            return (
              <motion.li
                key={item.name}
                whileHover={{ scale: 1.05 }}
                className="flex-shrink-0"
              >
                <Link
                  href={`${basePath}${item.href}`}
                  className={cn(
                    "py-3 text-base font-medium transition-all duration-200",
                    isActive
                      ? "border-b-2 border-blue-500 text-white"
                      : "border-b-2 border-transparent text-gray-300 hover:text-white hover:border-gray-200"
                  )}
                >
                  {item.name}
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
