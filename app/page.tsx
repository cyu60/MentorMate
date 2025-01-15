import { Hero } from "@/components/Hero";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { Navbar } from "@/components/navbar";
// import { BackgroundBeams } from "@/components/ui/background-beams";


export default function HomePage() {
  return (
    <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-white to-blue-100" >
      <Navbar />
      {/* <BackgroundBeams /> */}
      <Hero />
      <ServiceWorkerRegistration />
    </div>
  );
}
