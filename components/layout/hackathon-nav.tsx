"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEventRegistration } from "@/components/event-registration-provider";
import { EventRole } from "@/lib/types";

const navItems = [
  {
    name: "Overview",
    href: "/overview",
    public: true,
    roles: [
      EventRole.Participant,
      EventRole.Mentor,
      EventRole.Judge,
      EventRole.Organizer,
      EventRole.Admin,
    ],
  },
  {
    name: "Dashboard",
    href: "/dashboard",
    public: false,
    roles: [
      EventRole.Participant,
      EventRole.Admin,
      EventRole.Organizer,
      EventRole.Judge,
      EventRole.Mentor,
    ],
  },
  {
    name: "Participants",
    href: "/participants",
    public: false,
    roles: [
      EventRole.Participant,
      EventRole.Mentor,
      EventRole.Judge,
      EventRole.Organizer,
      EventRole.Admin,
    ],
  },
  {
    name: "Gallery",
    href: "/gallery",
    public: false,
    roles: [
      EventRole.Participant,
      EventRole.Mentor,
      EventRole.Judge,
      EventRole.Organizer,
      EventRole.Admin,
    ],
  },
  {
    name: "Feed",
    href: "/feed",
    public: false,
    roles: [
      EventRole.Participant,
      EventRole.Mentor,
      EventRole.Judge,
      EventRole.Organizer,
      EventRole.Admin,
    ],
  },
  // TODO: add admin data page?
];

export function HackathonNav({ id }: { id: string }) {
  const pathname = usePathname();
  const basePath = `/events/${id}`;
  const { isRegistered, userRole } = useEventRegistration();

  const visibleNavItems = navItems.filter(
    (item) =>
      item.public || (isRegistered && userRole && item.roles.includes(userRole))
  );

  return (
    <nav className="w-full">
      <div className="overflow-x-auto py-4 sm:py-10">
        <ul className="flex space-x-3 sm:space-x-6 px-2 sm:px-4 border-gray-200/30">
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
                    "py-2 sm:py-3 text-sm sm:text-base font-medium transition-all duration-200",
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
