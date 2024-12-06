import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

export default function HomePage() {
  return (
    <div>
      {/* <Navbar /> */}
      <Hero />
      <ServiceWorkerRegistration />
    </div>
  );
}
