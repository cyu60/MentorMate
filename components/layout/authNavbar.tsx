"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AuthNavbar() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [session, setSession] = useState<Session | null>(null);

    const toggleMenu = () => setIsOpen(!isOpen);

    useEffect(() => {
        const fetchSession = async () => {
        const {
            data: { session },
            error,
        } = await supabase.auth.getSession();
        if (error) {
            console.error("Error fetching session:", error);
            return;
        }
        setSession(session);
        };

        fetchSession();
    }, []);

    const handleLoginClick = () => {
        // Save current URL before redirecting
        if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        if (currentPath !== "/mentor") {
            localStorage.setItem("returnUrl", currentPath);
            console.log("Setting returnUrl:", currentPath);
        }
        }
        router.push("/select");
    };

    const handleSignOutClick = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
        console.error("Error signing out:", error);
        } else {
        setSession(null);
        localStorage.removeItem("returnUrl"); // Clear returnUrl on sign out
        window.location.href = "/";
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 bg-white/70 z-50 shadow">
        <div className="flex justify-between items-center px-4 py-2 max-w-7xl mx-auto">
            {/* Left: Logo and mobile menu toggle */}
            <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
                <Image
                src="/mentormate.png"
                alt="Mentor Mate Logo"
                width={40}
                height={40}
                className="object-contain"
                />
                {/* <span className="font-bold text-xl text-blue-900">MentorMates</span> */}
            </Link>
            {/* Mobile menu toggle */}
            <div className="sm:hidden">
                <button onClick={toggleMenu} className="text-2xl ml-2">
                {isOpen ? "✖" : "☰"}
                </button>
            </div>
            </div>

            {/* Center: Navigation Links */}
            <div className="hidden sm:flex space-x-4">
                <Link href="/events">
                    <Button variant="ghost" className="text-lg font-semibold hover:text-blue-900 hover:italic hover:bg-none">
                    Events
                    </Button>
                </Link>
                <Link href="/my-projects">
                    <Button variant="ghost" className="text-lg font-semibold hover:text-blue-900 hover:italic hover:bg-none">
                    My Projects
                    </Button>
                </Link>
            </div>


            {/* Right: Authentication */}
            <div>
            {session ? (
                <DropdownMenu>
                <DropdownMenuTrigger>
                    <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage src={session.user.user_metadata?.avatar_url} />
                    <AvatarFallback>
                        {session.user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleSignOutClick}>
                    Sign Out
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <Button
                size="lg"
                className="bg-black text-white font-semibold px-6 rounded-full hover:bg-gray-800 transition-all duration-300"
                onClick={handleLoginClick}
                >
                Login
                </Button>
            )}
            </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
            <div className="sm:hidden bg-white border-t text-center py-4">
            <Link
                href="/events"
                className="block py-2 font-semibold"
                onClick={() => setIsOpen(false)}
            >
                Events
            </Link>
            <Link
                href="/my-projects"
                className="block py-2 font-semibold"
                onClick={() => setIsOpen(false)}
            >
                My Projects
            </Link>
            </div>
        )}
        </nav>
    );
}
