import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

const ITEMS_PER_PAGE = 5

type User = {
  email: string | null
  user_metadata: {
    avatar_url?: string
  }
}

type FeedItem = {
  id: string
  content: string
  created_at: string
  type: string
  display_name: string | null
  user_id: string
  users: User[]
}

export default async function FeedPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { page?: string }
}) {
  const supabase = createServerComponentClient({ cookies })
  const currentPage = parseInt(searchParams.page || "1")

  // Fetch all feed items
  const { data: allFeedItems, error } = await supabase
    .from("platform_engagement")
    .select(`
      id,
      content,
      created_at,
      type,
      display_name,
      user_id,
      users (
        email,
        user_metadata
      )
    `)
    .eq("event_id", params.id)
    .eq("is_private", false)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching feed:", error)
    return <div>Error loading feed</div>
  }

  // Handle pagination on the client side
  const totalItems = allFeedItems?.length || 0
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const feedItems = (allFeedItems as FeedItem[])?.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Activity Feed</h2>
      {feedItems?.map((item) => {
        const user = item.users[0] // Get first user from array
        return (
          <Card key={item.id}>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <Avatar>
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {item.display_name?.[0] || user?.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="font-semibold">
                    {item.display_name || user?.email}
                  </h3>
                  <p className="text-gray-600">{item.content}</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </p>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500 capitalize">{item.type}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          {currentPage > 1 && (
            <Link href={`/events/${params.id}/feed?page=${currentPage - 1}`}>
              <Button variant="outline">Previous</Button>
            </Link>
          )}
          <span className="py-2 px-4">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link href={`/events/${params.id}/feed?page=${currentPage + 1}`}>
              <Button variant="outline">Next</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
