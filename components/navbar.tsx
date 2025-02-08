"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

export function Navbar() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [session, setSession] = useState<Session | null>(null);

    const toggleMenu = () => setIsOpen(!isOpen);

    useEffect(() => {
        const fetchSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                console.error("Error fetching session:", error);
                return;
            }
            setSession(session);
        };

        fetchSession();
    }, []);

    const handleLoginClick = () => {
        router.push("/login");
    };

    const handleSignOutClick = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Error signing out:", error);
        } else {
            setSession(null);
            router.push("/");
        }
    };

    return (
        <>
            <nav className="w-full bg-transparent text-blue-900">
                <div className="flex justify-between items-center p-8 max-w-7xl mx-auto">
                    {/* Logo */}
                    <Link href="/">
                        <div className="flex items-center gap-2 cursor-pointer">
                            <Image
                                src="/mentormate.png"
                                alt="Mentor Mate Logo"
                                width={40}
                                height={40}
                                className="object-contain"
                            />
                        </div>
                    </Link>

                    {/* Menu items */}
                    <div className="hidden sm:flex items-center space-x-3">
                        <Link href="/about" className="text-lg font-semibold hover:text-blue-300 transition-colors duration-300 px-3">
                            About Us
                        </Link>
                        <Link href="/teams" className="text-lg font-semibold hover:text-blue-300 transition-colors duration-300 px-3">
                            Team
                        </Link>
                        <Link href="mailto:chinat@stanford.edu" className="text-lg font-semibold hover:text-blue-300 transition-colors duration-300 px-3">
                            Contact
                        </Link>
                        <div className="flex items-center">
                            {session ? (
                                <Button
                                    size="lg"
                                    className="bg-red-600 text-white font-semibold py-2 px-4 rounded-full hover:bg-red-700 transition-all duration-300 w-40"
                                    onClick={handleSignOutClick}
                                >
                                    Sign Out
                                </Button>
                            ) : (
                                <Button
                                    size="lg"
                                    className="bg-black text-white font-semibold py-2 px-4 rounded-full hover:bg-gray-800 transition-all duration-300 w-40"
                                    onClick={handleLoginClick}
                                >
                                    Sign Up/Login
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu toggle */}
                    <div className="sm:hidden">
                        <button onClick={toggleMenu} className="text-2xl">
                            {isOpen ? "✖" : "☰"}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="sm:hidden bg-blue-900 text-white text-center py-4">
                        <Link href="/about" className="block py-2 font-semibold">
                            About Us
                        </Link>
                        <Link href="/teams" className="block py-2 font-semibold">
                            Team
                        </Link>
                        <Link href="mailto:chinat@stanford.edu" className="block py-2 font-semibold">
                            Contact
                        </Link>
                        {session ? (
                            <>
                                <button
                                    className="block w-full py-2 font-semibold text-red-400"
                                    onClick={handleSignOutClick}
                                >
                                    Sign Out
                                </button>
                                <div className="text-sm text-gray-300 mt-1">
                                    Logged in as: {session.user.email}
                                </div>
                            </>
                        ) : (
                            <button
                                className="block w-full py-2 font-semibold"
                                onClick={handleLoginClick}
                            >
                                Sign Up/Login
                            </button>
                        )}
                    </div>
                )}
            </nav>
            {session && (
                <div className="max-w-7xl mx-auto px-8 mb-4 flex justify-end">
                    <div className="text-sm text-gray-700 mt-2">
                        Logged in as: {session.user.email}
                    </div>
                </div>
            )}
        </>
    );
}