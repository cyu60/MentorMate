import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

const ITEMS_PER_PAGE = 5

type UserProfile = {
  uid: string
  email: string | null
  display_name: string | null
}

type FeedItem = {
  id: string
  content: string
  created_at: string
  type: string
  display_name: string | null
  user_id: string
  user?: UserProfile
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

  try {
    // Fetch all feed items
    const { data: feedItems, error: feedError } = await supabase
      .from("platform_engagement")
      .select("*")
      .eq("event_id", params.id)
      .eq("is_private", false)
      .order("created_at", { ascending: false })

    if (feedError) {
      console.error("Error fetching feed:", feedError)
      throw feedError
    }

    if (!feedItems) {
      console.error("No feed items found")
      return <div>No feed items found</div>
    }

    // Get unique user IDs
    const userIds = [...new Set(feedItems.map(item => item.user_id))]

    // Fetch user profiles
    const { data: users, error: usersError } = await supabase
      .from("user_profiles")
      .select("uid, email, display_name")
      .in("uid", userIds)

    if (usersError) {
      console.error("Error fetching users:", usersError)
      throw usersError
    }

    // Create a map of user data
    const userMap = new Map(users?.map(user => [user.uid, user]) || [])

    // Combine feed items with user data
    const enrichedFeedItems: FeedItem[] = feedItems.map(item => ({
      ...item,
      user: userMap.get(item.user_id)
    }))

    // Handle pagination on the client side
    const totalItems = enrichedFeedItems.length
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const paginatedItems = enrichedFeedItems.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Activity Feed</h2>
        {paginatedItems.map((item) => (
          <Card key={item.id}>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <Avatar>
                  <AvatarFallback>
                    {item.display_name?.[0] || item.user?.display_name?.[0] || item.user?.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="font-semibold">
                    {item.display_name || item.user?.display_name || item.user?.email}
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
        ))}

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
  } catch (error) {
    console.error("Feed error:", error)
    return <div>Error loading feed. Please try again later.</div>
  }
}
