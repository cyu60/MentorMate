"use client";

import Link from "next/link";
import { useState } from "react";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <nav className="fixed top-0 left-0 w-full bg-transparent text-white z-20">
            <div className="flex justify-between items-center p-8 max-w-7xl mx-auto">
                {/* Logo */}
                <div className="flex items-center gap-2">
                <img
                    src="/mentormate.png"
                    alt="Mentor Mate Logo"
                    width={30}
                    height={0}
                    className="object-contain"
                />
                {/* <span className="text-2xl font-extrabold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-blue-300">
                    Mentor Mate
                </span> */}
                </div>

                {/* Menu items (right-aligned) */}
                <div className="hidden sm:flex gap-6">
                <Link href="#about" className="text-lg font-semibold hover:text-blue-300 transition-colors duration-300">
                    About Us
                </Link>
                <Link href="#team" className="text-lg font-semibold hover:text-blue-300 transition-colors duration-300">
                    Team
                </Link>
                <Link href="#contact" className="text-lg font-semibold hover:text-blue-300 transition-colors duration-300">
                    Contact
                </Link>
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
                <div className="sm:hidden bg-blue-900/50 text-white text-center py-4">
                <Link href="#about" className="block py-2 font-semibold">
                    About Us
                </Link>
                <Link href="#team" className="block py-2 font-semibold">
                    Team
                </Link>
                <Link href="#contact" className="block py-2 font-semibold">
                    Contact
                </Link>
                </div>
            )}
        </nav>
    );
}
