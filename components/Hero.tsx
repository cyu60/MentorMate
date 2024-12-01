import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-gradient-to-b from-primary/20 to-background text-center px-4">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
        Welcome to Mentor Mate
      </h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
        Elevate your project feedback process with our intuitive platform.
        Connect project creators with mentors for valuable insights and improve
        outcomes across various domains.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/participant">
          <Button size="lg" className="w-full sm:w-auto" variant="custom">
            I&apos;m a Participant
          </Button>
        </Link>
        <Link href="/mentor">
          <Button size="lg" variant="outline" className="w-full sm:w-auto">
            I&apos;m a Mentor/Judge
          </Button>
        </Link>
      </div>
    </div>
  );
}
