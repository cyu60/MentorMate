"use client";
import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-none">
      <div className="mx-auto max-w-7xl px-6 py-4 flex flex-col items-center justify-center lg:px-8">
        <div className="flex flex-col items-center">
          <div className="flex justify-center space-x-4 text-sm text-gray-600/90">
            <Link href="/about" className="hover:text-gray-800">
              About
            </Link>
            <Link href="/privacy" className="hover:text-gray-800">
              Privacy Policy
            </Link>
          </div>
          <p className="mt-2 text-center text-sm text-gray-600/80">
            &copy; 2025 Mentor Mate, All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
