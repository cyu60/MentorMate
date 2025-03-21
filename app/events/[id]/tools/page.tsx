"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lightbulb, Pencil, Globe } from "lucide-react"
import { toast } from "react-hot-toast"

export default function ToolsPage() {

  const tools = [
    {
      name: "AI Brainstormer",
      description: "Generate ideas and get inspiration for your project using AI.",
      icon: Lightbulb,
      href: "brainstormer"
    },
    {
      name: "Whiteboard",
      description: "Collaborate with your team using our interactive whiteboard.",
      icon: Pencil,
      href: "whiteboard"
    },
    {
      name: "Website Builder",
      description: "Build and deploy your project website with our easy-to-use builder.",
      icon: Globe,
      href: "website-builder"
    }
  ]

  const handleToolClick = (href: string) => {
    toast("Features are coming soon!")
    console.log("Tool href:", href)
    // router.push(`./${href}`)
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Project Tools</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => {
          const Icon = tool.icon
          return (
            <Card key={tool.name} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-black rounded-lg">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold">{tool.name}</h2>
                </div>
                <p className="text-gray-600 mb-6 flex-grow">{tool.description}</p>
                <Button 
                  onClick={() => handleToolClick(tool.href)}
                  className="w-full bg-black text-white hover:bg-black/90"
                >
                  Launch Tool
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}