"use client";

import { SelectHero } from '@/components/heroes/SelectHero';
import { ServiceWorkerRegistration } from '@/components/utils/ServiceWorkerRegistration';
import { Footer } from '@/components/layout/footer';

export default function SelectPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-blue-100">
      <SelectHero />
      <ServiceWorkerRegistration />
      <Footer />
    </div>
  );
}
