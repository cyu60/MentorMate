import { Hero } from "@/components/Hero";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { Navbar } from "@/components/navbar";

export default function HomePage() {
  return (
    <div>
      <Navbar />
      <Hero />
      <ServiceWorkerRegistration />
    </div>
  );
}
