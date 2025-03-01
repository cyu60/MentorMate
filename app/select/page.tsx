"use client";

import { SelectHero } from "@/components/SelectHero";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function SelectPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-blue-100">
      <Navbar />
      <SelectHero />
      <ServiceWorkerRegistration />
      <Footer />
    </div>
  );
}