"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Menu,
  Calendar,
  Folder,
  // MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

type SidebarSubItem = {
  name: string;
  href: string;
};

type SidebarItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  subItems?: SidebarSubItem[];
};

const sidebarItems: SidebarItem[] = [
  { name: "Events", href: "/events", icon: Calendar },
  { name: "My Projects", href: "/my-projects", icon: Folder },
  // {
  //   name: "Feedback",
  //   href: "/feedback",
  //   icon: MessageSquare,
  //   subItems: [
  //     // { name: "Received", href: "/feedback/received" },
  //     { name: "Given", href: "/feedback/given" },
  //   ],
  // },
];

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const pathname = usePathname();

  const toggleExpand = (name: string) => {
    setExpandedItem(expandedItem === name ? null : name);
  };

  const renderSidebarItems = () => {
    return (
      <nav className="flex flex-col space-y-2">
        {sidebarItems.map((item, index) => (
          <div key={`${item.href}-${index}`}>
            {item.subItems ? (
              <Button
                variant={pathname.startsWith(item.href) ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => toggleExpand(item.name)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
                {expandedItem === item.name ? (
                  <ChevronDown className="ml-auto h-4 w-4" />
                ) : (
                  <ChevronUp className="ml-auto h-4 w-4" />
                )}
              </Button>
            ) : (
              <Link href={item.href}>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setOpen(false)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            )}
            {item.subItems && expandedItem === item.name && (
              <div className="ml-4 mt-2 space-y-2">
                {item.subItems.map((subItem) => (
                  <Link key={subItem.href} href={subItem.href}>
                    <Button
                      variant={
                        pathname === subItem.href ? "secondary" : "ghost"
                      }
                      className="w-full justify-start"
                      onClick={() => setOpen(false)}
                    >
                      {subItem.name}
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[240px] sm:w-[300px] p-0">
          <div className="p-4">{renderSidebarItems()}</div>
        </DialogContent>
      </Dialog>
      <aside className="hidden md:flex md:flex-col md:fixed md:top-[72px] md:bottom-0 md:w-64 md:border-r bg-background">
        <style jsx global>{`
          @media (min-width: 768px) {
            main {
              padding-left: 16rem;
            }
          }
        `}</style>
        <div className="flex-grow overflow-y-auto">
          <div className="p-4">{renderSidebarItems()}</div>
        </div>
      </aside>
    </>
  );
}
