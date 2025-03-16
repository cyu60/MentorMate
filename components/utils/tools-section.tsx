"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Pencil, Globe, Presentation } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function ToolsSection() {
  const navigateToTool = (tool: string) => {
    toast({
      title: "Feature coming soon...",
      description: `The ${tool} tool will be available soon.`,
    });
  };

  return (
    <Card className="p-8 shadow-xl rounded-xl">
      <Toaster />
      <h2 className="text-3xl font-bold text-center mb-6">My Tools</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button
          onClick={() => navigateToTool("brainstormer")}
          className="flex items-center justify-center gap-2 bg-blue-800 text-white hover:bg-blue-900 h-16 rounded-lg transition-all"
        >
          <Lightbulb className="w-6 h-6" />
          <span className="text-lg">AI Brainstormer</span>
        </Button>
        <Button
          onClick={() => navigateToTool("whiteboard")}
          className="flex items-center justify-center gap-2 bg-blue-800 text-white hover:bg-blue-900 h-16 rounded-lg transition-all"
        >
          <Pencil className="w-6 h-6" />
          <span className="text-lg">Whiteboard</span>
        </Button>
        <Button
          onClick={() => navigateToTool("website-builder")}
          className="flex items-center justify-center gap-2 bg-blue-800 text-white hover:bg-blue-900 h-16 rounded-lg transition-all"
        >
          <Globe className="w-6 h-6" />
          <span className="text-lg">Website Builder</span>
        </Button>
        <Button
          onClick={() => navigateToTool("presentation-builder")}
          className="flex items-center justify-center gap-2 bg-blue-800 text-white hover:bg-blue-900 h-16 rounded-lg transition-all"
        >
          <Presentation className="w-6 h-6" />
          <span className="text-lg">Presentation Builder</span>
        </Button>
      </div>
    </Card>
  );
}
