"use client";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AuthNavbar } from "@/components/layout/authNavbar";
import { Navbar } from "@/components/layout/navbar";
import { useState, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { Project, EventRole, EventItem } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface EventWithRole extends EventItem {
  user_event_roles: {
    role: EventRole;
  }[];
}

export default function ProfilePage() {
  const { userId } = useParams();
  const [session, setSession] = useState<Session | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{
    display_name: string | null;
    email: string | null;
  } | null>(null);
  const [events, setEvents] = useState<EventWithRole[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        setSession(session);

        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("display_name, email")
          .eq("uid", userId)
          .single();

        if (profileError) throw profileError;
        setUserProfile(profile);

        // Fetch projects where user is lead or teammate
        const { data: leadProjects, error: leadError } = await supabase
          .from("projects")
          .select(
            `
            id,
            project_name,
            project_description,
            lead_name,
            lead_email,
            teammates,
            project_url,
            cover_image_url,
            event_id,
            created_at,
            project_tracks (
              event_tracks (
                track_id,
                name
              )
            )
          `
          )
          .eq("lead_email", profile.email);

        if (leadError) throw leadError;

        const { data: teamProjects, error: teamError } = await supabase
          .from("projects")
          .select(
            `
            id,
            project_name,
            project_description,
            lead_name,
            lead_email,
            teammates,
            project_url,
            cover_image_url,
            event_id,
            created_at,
            project_tracks (
              event_tracks (
                track_id,
                name
              )
            )
          `
          )
          .contains("teammates", [profile.email]);

        if (teamError) throw teamError;

        // Combine and deduplicate projects
        const allProjects = [...(leadProjects || []), ...(teamProjects || [])]
          .filter(
            (project, index, self) =>
              index === self.findIndex((p) => p.id === project.id)
          )
          .map((project) => ({
            id: project.id,
            project_name: project.project_name,
            project_description: project.project_description,
            lead_name: project.lead_name,
            lead_email: project.lead_email,
            teammates: project.teammates,
            project_url: project.project_url,
            cover_image_url: project.cover_image_url,
            event_id: project.event_id,
            created_at: project.created_at,
            track_ids:
              project.project_tracks
                ?.map((pt) => pt.event_tracks?.[0]?.track_id)
                .filter(Boolean) || [],
            tracks:
              project.project_tracks
                ?.map((pt) => ({
                  track_id: pt.event_tracks?.[0]?.track_id || "",
                  name: pt.event_tracks?.[0]?.name || "",
                  event_id: project.event_id,
                  description: "",
                  scoring_criteria: {
                    name: pt.event_tracks?.[0]?.name || "",
                    criteria: [],
                  },
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                }))
                .filter(Boolean) || [],
          }));

        // Fetch events for each role
        const { data: events, error } = await supabase
          .from("events")
          .select(
            `
                event_id,
                event_name,
                event_date,
                location,
                visibility,
                cover_image_url,
                scoring_config,
                user_event_roles!inner (
                    role
                )
        `
          )
          .eq("user_event_roles.user_id", userId)
          .in("visibility", ["public", "private"]);

        if (error) throw error;

        setEvents(events);
        setProjects(allProjects);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  return (
    <div className="min-h-screen bg-gray-50">
      {session ? <AuthNavbar /> : <Navbar />}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {userProfile?.display_name || "User Profile"}
          </h1>
          <p className="mt-2 text-gray-600">{userProfile?.email}</p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Projects</h2>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No projects found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  {project.cover_image_url && (
                    <div className="relative h-48 w-full">
                      <img
                        src={project.cover_image_url}
                        alt={project.project_name}
                        className="object-cover w-full h-full rounded-t-lg"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl hover:text-blue-600">
                      <Link
                        href={
                          userId === session?.user?.id
                            ? `/my-project-gallery/${project.id}/dashboard`
                            : `/public-project-details/${project.id}`
                        }
                        key={project.id}
                      >
                        {project.project_name}
                      </Link>
                    </CardTitle>
                    <CardDescription>
                      {project.project_description?.slice(0, 100)}
                      {project.project_description?.length > 100 ? "..." : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">
                          Lead: {project.lead_name}
                        </p>
                        {project.teammates && project.teammates.length > 0 && (
                          <p className="text-sm text-gray-600">
                            Team: {project.teammates.join(", ")}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {project.tracks?.map((track) => (
                          <Badge key={track.track_id} variant="secondary">
                            {track.name}
                          </Badge>
                        ))}
                      </div>
                      {project.project_url && (
                        <Link
                          href={project.project_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View Project Repository →
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Events</h2>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No events found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card
                  key={event.event_id}
                  className="hover:shadow-lg transition-shadow"
                >
                  {event.cover_image_url && (
                    <div className="relative h-48 w-full">
                      <img
                        src={event.cover_image_url}
                        alt={event.event_name}
                        className="object-cover w-full h-full rounded-t-lg"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl hover:text-blue-600">
                      <Link href={`/events/${event.event_id}/overview`}>
                        {event.event_name}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">
                          Date: {event.event_date}
                        </p>
                        {event.location && (
                          <p className="text-sm text-gray-600">
                            Location: {event.location}
                          </p>
                        )}
                      </div>
                      <Badge variant={event.user_event_roles?.[0]?.role}>
                        {event.user_event_roles?.[0]?.role}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
