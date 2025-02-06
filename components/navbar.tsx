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
    const toggleMenu = () => setIsOpen(!isOpen);
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        const fetchSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                console.error("Error fetching session:", error);
                return;
            }
            if (!session) {
                console.warn("No session found during fetch.");
            } else {
                console.log("Session fetched successfully:", session);
            }
            setSession(session);

            if (session) {
                const { email, user_metadata, id: uid } = session.user;
                const display_name = user_metadata?.name || (email ? email.split('@')[0] : 'user');
                try {
                    const { data: existingUser } = await supabase
                        .from('user_profiles')
                        .select()
                        .eq('email', email)
                        .single();

                    if (!existingUser) {
                        const { error } = await supabase
                            .from('user_profiles')
                            .insert({
                                display_name: display_name,
                                email: email,
                                uid: uid
                            });
                        if (error) {
                            console.error("Error inserting user profile:", error);
                        } else {
                            console.log("User profile created successfully.");
                        }
                    } else {
                        console.log("User profile already exists.");
                    }
                } catch (err) {
                    console.error("Unexpected error:", err);
                }
            }
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

    const handleParticipantClick = async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
            console.error("Error checking session:", error);
            return;
        }
        if (!session) {
            router.push("/login");
        } else {
            router.push("/participant");
        }
    };

    return (
        <nav className="w-full bg-transparent text-blue-900">
            <div className="flex justify-between items-center p-8 max-w-7xl mx-auto">
                {/* Logo */}
                <Link href="/">
                    <div className="inline-flex items-center cursor-pointer">
                        <Image
                            src="/mentormate.png"
                            alt="Mentor Mate Logo"
                            width={40}
                            height={40}
                            className="object-contain"
                        />
                        {/* <h2 className="text-4xl sm:text-2xl md:text-3xl font-extrabold flex items-center">
                            <span className="flex items-center bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-blue-300">
                                Mentor Mate
                            </span>
                        </h2> */}
                    </div>
                </Link>

                {/* Centered Menu items */}
                <div className="flex-1 flex justify-center items-center space-x-6">
                    <Link href="/about" className="text-lg font-semibold hover:text-blue-300 transition-colors duration-300">
                        About Us
                    </Link>
                    <Link href="/teams" className="text-lg font-semibold hover:text-blue-300 transition-colors duration-300">
                        Team
                    </Link>
                    <Link href="mailto:chinat@stanford.edu" className="text-lg font-semibold hover:text-blue-300 transition-colors duration-300">
                        Contact
                    </Link>
                </div>

                {/* Log In/Sign Out Button */}
                <div>
                    {session ? (
                        <Button
                            size="default"
                            className="bg-red-700 text-white font-semibold py-2 px-4 rounded-full hover:bg-red-900 transition-all duration-300"
                            onClick={handleSignOutClick}
                        >
                            Sign Out
                        </Button>
                    ) : (
                        <Button
                            size="default"
                            className="bg-blue-900 py-2 px-4 text-white font-semibold rounded-full hover:bg-blue-300 hover:text-black transition-all duration-300"
                            onClick={handleLoginClick}
                        >
                            Log In 
                        </Button>
                    )}
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
                    <Link href="/team" className="block py-2 font-semibold">
                        Team
                    </Link>
                    <Link href="/contact" className="block py-2 font-semibold">
                        Contact
                    </Link>
                </div>
            )}
        </nav>
    );
}