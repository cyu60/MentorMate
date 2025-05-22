"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, X } from "lucide-react";

export function AuthNavbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  // fetch & subscribe to session
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => setSession(session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = () => {
    if (typeof window !== "undefined") {
      const returnUrl = window.location.pathname;
      if (returnUrl !== "/mentor") localStorage.setItem("returnUrl", returnUrl);
    }
    router.push("/login");
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    localStorage.removeItem("returnUrl");
    await supabase.auth.signOut();
    router.push("/");
    setIsOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 inset-x-0 bg-white/90 backdrop-blur z-50 shadow">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/mentormate.png"
              alt="Logo"
              width={32}
              height={32}
              className="object-contain pl-2"
            />
            <span className="font-bold text-lg text-blue-900">MentorMates</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex flex-1 justify-center items-center gap-8">
            <Link
              href={session ? `/profile/${session.user.id}` : "/login"}
              className="text-base font-medium text-gray-700 hover:text-blue-600"
            >
              My Profile
            </Link>
            <Link
              href="/events"
              className="text-base font-medium text-gray-700 hover:text-blue-600"
            >
              Events
            </Link>
            <Link
              href="/my-project-gallery"
              className="text-base font-medium text-gray-700 hover:text-blue-600"
            >
              My Projects
            </Link>
            <Link
              href="/resources"
              className="text-base font-medium text-gray-700 hover:text-blue-600"
            >
              Resources
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {session ? (
              <>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {session.user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-full"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Button
                variant="logIn"
                className="bg-black text-white font-semibold py-2 px-6 rounded-full hover:bg-gray-800"
                onClick={handleLogin}
              >
                Log in
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            aria-label="Toggle menu"
            onClick={() => setIsOpen((o) => !o)}
            className="p-2 rounded-md hover:bg-gray-200 flex md:hidden"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        } md:hidden`}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-3/4 max-w-xs bg-white z-50 transform transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col md:hidden`}
      >
        <div className="flex-shrink-0 p-4 border-b">
          {session ? (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={session.user.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {session.user.email?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-900 text-sm">
                  {session.user.email}
                </p>
              </div>
            </div>
          ) : (
            <Button variant="logIn" className="w-full" onClick={handleLogin}>
              Log in
            </Button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-4">
          <Link
            href={session ? `/profile/${session.user.id}` : "/login"}
            className="block text-gray-700 font-medium hover:text-blue-600"
            onClick={() => setIsOpen(false)}
          >
            My Profile
          </Link>
          <Link
            href="/events"
            className="block text-gray-700 font-medium hover:text-blue-600"
            onClick={() => setIsOpen(false)}
          >
            Events
          </Link>
          <Link
            href="/my-project-gallery"
            className="block text-gray-700 font-medium hover:text-blue-600"
            onClick={() => setIsOpen(false)}
          >
            My Projects
          </Link>
          <Link
            href="/resources"
            className="block text-gray-700 font-medium hover:text-blue-600"
            onClick={() => setIsOpen(false)}
          >
            Resources
          </Link>
        </nav>

        {session && (
          <div className="p-4 border-t">
            <button
              onClick={handleSignOut}
              className="w-full text-left text-red-600 font-medium hover:bg-red-50 rounded-md px-3 py-2"
            >
              Sign Out
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
