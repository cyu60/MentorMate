import { redirect } from "next/navigation"

export default function EventPage({ params }: { params: { id: string } }) {
  redirect(`/events/${params.id}/overview`)
}