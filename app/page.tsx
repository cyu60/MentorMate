import { Hero } from "@/components/Hero";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

export default function HomePage() {
  return (
    <div>
      <Hero />
      <ServiceWorkerRegistration />
    </div>
  );
}
