"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { useParams } from "next/navigation"
import { Pencil, CheckCircle2, XCircle } from "lucide-react"
import { Session } from "@supabase/supabase-js"

type SupabaseSessionResponse = {
  data: {
    session: Session | null;
  };
  error: Error | null;
} | null

interface JournalEntry {
  id: string
  user_id: string
  event_id: string
  type: 'journal'
  content: string
  display_name: string
  created_at: string
  is_private?: boolean
  tags?: string[]
  status?: 'in_progress' | 'completed'
}

interface JournalSectionProps {
  eventId?: string
}

export default function JournalSection({ eventId: propEventId }: JournalSectionProps) {
  const params = useParams()
  const eventId = propEventId || (params.id as string)
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [isPrivate, setIsPrivate] = useState(false)
  const [newTag, setNewTag] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [entry, setEntry] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const [editedContent, setEditedContent] = useState("")
  const [sessionData, setSessionData] = useState<SupabaseSessionResponse | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (eventId) {
      const initSession = async () => {
        const sessionResponse = await supabase.auth.getSession()
        setSessionData(sessionResponse)
        fetchEntries()
      }
      initSession()
    }
  }, [eventId])

  const incrementPulse = async (userEmail: string) => {
    const { data: profiles, error: fetchError } = await supabase
      .from('user_profiles')
      .select('pulse')
      .eq('email', userEmail)
      .single()

    if (fetchError) {
      console.error('Error fetching pulse:', fetchError)
      return
    }

    const currentPulse = profiles?.pulse || 0
    const newPulse = currentPulse + 1

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ pulse: newPulse })
      .eq('email', userEmail)

    if (updateError) {
      console.error('Error updating pulse:', updateError)
      toast({
        title: "Error updating pulse",
        description: updateError.message || "Please try again later",
        variant: "destructive",
      })
    }
  }

  const fetchEntries = async () => {
    const { data: session } = await supabase.auth.getSession()
    if (!session?.session?.user?.id) return

    const { data, error } = await supabase
      .from("platform_engagement")
      .select("*")
      .eq("event_id", eventId)
      .eq("type", "journal")
      .eq("is_private", false)
      .order("created_at", { ascending: false })

    if (error) {
      toast({
        title: "Error fetching journal entries",
        description: "Please try again later",
        variant: "destructive",
      })
      return
    }

    if (data) {
      setEntries(data)
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmitEntry = async () => {
    if (!entry.trim()) return

    const { data: session } = await supabase.auth.getSession()
    if (!session?.session?.user?.id || !session.session.user.email) {
      toast({
        title: "Authentication error",
        description: "Please sign in to create journal entries",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    const { error } = await supabase
      .from("platform_engagement")
      .insert([
        {
          event_id: eventId,
          user_id: session.session.user.id,
          type: "journal",
          content: entry.trim(),
          display_name: session.session.user.user_metadata.full_name,
          is_private: isPrivate,
          tags: tags.length > 0 ? tags : undefined,
          status: 'in_progress'
        }
      ])

    if (error) {
      toast({
        title: "Error saving journal entry",
        description: error.message || "Please try again later",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    await incrementPulse(session.session.user.email)

    setIsSubmitting(false)
    toast({
      title: "Journal entry saved",
      description: "Your entry has been saved successfully",
    })
    
    setEntry("")
    setIsPrivate(false)
    setTags([])
    fetchEntries()
  }

  const handleToggleStatus = async (entry: JournalEntry) => {
    const newStatus = entry.status === 'completed' ? 'in_progress' : 'completed'
    const { data: session } = await supabase.auth.getSession()
    if (!session?.session?.user?.id || !session.session.user.email) return

    const { error } = await supabase
      .from("platform_engagement")
      .update({ status: newStatus })
      .eq("id", entry.id)

    if (error) {
      toast({
        title: "Error updating status",
        description: error.message || "Please try again later",
        variant: "destructive",
      })
      return
    }

    // Increment pulse when entry is completed
    if (newStatus === 'completed') {
      await incrementPulse(session.session.user.email)
    }

    fetchEntries()
  }

  const handleEditEntry = (journalEntry: JournalEntry) => {
    setEditingEntryId(journalEntry.id)
    setEditedContent(journalEntry.content)
    setIsPrivate(journalEntry.is_private || false)
    setTags(journalEntry.tags || [])
  }

  const handleSaveEdit = async (entryId: string) => {
    if (!editedContent.trim()) return

    const { error } = await supabase
      .from("platform_engagement")
      .update({
        content: editedContent.trim(),
        is_private: isPrivate,
        tags: tags.length > 0 ? tags : undefined
      })
      .eq("id", entryId)

    if (error) {
      toast({
        title: "Error updating entry",
        description: error.message || "Please try again later",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Entry updated",
      description: "Your changes have been saved",
    })

    setEditingEntryId(null)
    setEditedContent("")
    setIsPrivate(false)
    setTags([])
    fetchEntries()
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="rounded-md bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Journal</h2>
        <p className="mt-1 text-sm text-gray-500">
          Write down your thoughts, track your progress, and share insights with others.
        </p>
      </div>

      {/* Create / Edit Entry Section */}
      <div className="rounded-md bg-white p-6 shadow-sm">
        <h3 className="text-lg font-medium mb-4">
          {editingEntryId ? "Edit Entry" : "Create a New Entry"}
        </h3>
        <div className="space-y-4">
          <Textarea
            placeholder="Write your journal entry here..."
            value={editingEntryId ? editedContent : entry}
            onChange={(e) => editingEntryId ? setEditedContent(e.target.value) : setEntry(e.target.value)}
            className="min-h-[150px] resize-none"
          />

          {/* Privacy Toggle */}
          <div className="flex items-center gap-2">
            <Switch
              id="private"
              checked={isPrivate}
              onCheckedChange={(checked: boolean) => setIsPrivate(checked)}
            />
            <Label htmlFor="private">Make private</Label>
          </div>

          {/* Tag Input */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                className="flex-1"
              />
              <Button
                onClick={handleAddTag}
                className="bg-black text-white hover:bg-black/90"
              >
                Add Tag
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-1"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Save Button */}
          <Button
            className="w-full bg-black text-white hover:bg-black/90"
            onClick={editingEntryId ? () => handleSaveEdit(editingEntryId) : handleSubmitEntry}
            disabled={
              isSubmitting ||
              (!editingEntryId && !entry.trim()) ||
              (editingEntryId && !editedContent.trim()) ||
              false
            }
          >
            {isSubmitting
              ? "Saving..."
              : editingEntryId
              ? "Save Changes"
              : "Save Entry"}
          </Button>
        </div>
      </div>

      {/* Previous Entries Section */}
      {entries.length > 0 && (
        <div className="rounded-md bg-white p-6 shadow-sm">
          <h3 className="text-lg font-medium mb-4">Previous Entries</h3>
          <ul className="space-y-4">
            {entries.map((entry) => (
              <li key={entry.id} className="p-4 rounded-md border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{entry.display_name}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(entry.created_at).toLocaleString()}
                    </span>

                    {entry.status === 'completed' ? (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-xs font-medium text-green-600">
                          Completed
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-xs font-medium text-red-600">
                          In Progress
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons (Only for the Author) */}
                  {entry.user_id === sessionData?.data?.session?.user?.id && (
                    <div className="flex items-center gap-2">
                      {entry.status === 'in_progress' && (
                        <Button
                          size="sm"
                          onClick={() => handleToggleStatus(entry)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Mark as Complete
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditEntry(entry)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <p
                  className={
                    entry.status === 'completed'
                      ? 'whitespace-pre-wrap line-through text-gray-500'
                      : 'whitespace-pre-wrap'
                  }
                >
                  {entry.content}
                </p>

                {entry.tags && entry.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {entry.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 bg-gray-100 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
