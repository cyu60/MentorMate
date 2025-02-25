"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function JournalSection() {
  const [isPrivate, setIsPrivate] = useState(false)
  const [newTag, setNewTag] = useState("")
  const [entry, setEntry] = useState("")

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Journal</h2>
      <div className="space-y-4">
        <Textarea
          placeholder="Write your journal entry here..."
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          className="min-h-[150px] resize-none"
        />
        <div className="flex items-center gap-2">
          <Switch id="private" checked={isPrivate} onCheckedChange={setIsPrivate} />
          <Label htmlFor="private">Make private</Label>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add a tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="flex-1"
          />
          <Button className="bg-black text-white hover:bg-black/90">Add Tag</Button>
        </div>
        <Button className="w-full bg-black text-white hover:bg-black/90">Save Entry</Button>
      </div>
    </Card>
  )
}

