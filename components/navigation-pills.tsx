import { Button } from "@/components/ui/button"

interface NavigationPillsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function NavigationPills({ activeTab, setActiveTab }: NavigationPillsProps) {
  return (
    <div className="flex justify-center space-x-4 mb-8">
      <Button
        variant={activeTab === "dashboard" ? "default" : "outline"}
        className="rounded-full"
        onClick={() => setActiveTab("dashboard")}
      >
        Dashboard
      </Button>
      <Button
        variant={activeTab === "gallery" ? "default" : "outline"}
        className="rounded-full"
        onClick={() => setActiveTab("gallery")}
      >
        Gallery
      </Button>
      <Button
        variant={activeTab === "feed" ? "default" : "outline"}
        className="rounded-full"
        onClick={() => setActiveTab("feed")}
      >
        Feed
      </Button>
    </div>
  )
}

