"use client";

import { Hero } from "@/components/Hero";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function SelectPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-blue-100">
      <Navbar />
      <Hero />
      <ServiceWorkerRegistration />
      <Footer />
    </div>
  );
}