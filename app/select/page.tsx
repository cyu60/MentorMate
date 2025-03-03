"use client";

import { SelectHero } from "@/components/SelectHero";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { Navbar } from "@/components/navbar";

export default function SelectPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-blue-100">
      <Navbar />
      <SelectHero />
      <ServiceWorkerRegistration />
    </div>
  );
}
