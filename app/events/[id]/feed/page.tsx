import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createSupabaseClient } from "@/app/utils/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

const ITEMS_PER_PAGE = 5

type UserProfile = {
  uid: string
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

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function PublicFeedPage({
  params,
  searchParams,
}: PageProps) {
  const supabase = await createSupabaseClient()
  
  // Note: This Next.js warning is a false positive. In Server Components,
  // route params are already resolved and don't need to be awaited.
  // See: https://github.com/vercel/next.js/discussions/54929
  const [{ id }, resolvedSearchParams] = await Promise.all([params, searchParams])
  const currentPage = parseInt(resolvedSearchParams.page || "1")

  try {
    // Fetch all public feed items
    const { data: feedItems, error: feedError } = await supabase
      .from("platform_engagement")
      .select("*")
      .eq("event_id", id)
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

    // Fetch user display names only
    const { data: users, error: usersError } = await supabase
      .from("user_profiles")
      .select("uid, display_name")
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

    // Handle pagination
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
                    {item.display_name?.[0] || item.user?.display_name?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="font-semibold">
                    {item.display_name || item.user?.display_name || 'Anonymous User'}
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
              <Link href={`/events/${id}/feed/public?page=${currentPage - 1}`}>
                <Button variant="outline">Previous</Button>
              </Link>
            )}
            <span className="py-2 px-4">
              Page {currentPage} of {totalPages}
            </span>
            {currentPage < totalPages && (
              <Link href={`/events/${id}/feed/public?page=${currentPage + 1}`}>
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