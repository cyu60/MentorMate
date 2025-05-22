"use client";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AuthNavbar } from "@/components/layout/authNavbar";
import { Navbar } from "@/components/layout/navbar";
import { useState, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  Project,
  EventRole,
  EventItem,
  ProjectBoardContext,
} from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Pencil, Globe } from "lucide-react";
import { FaLinkedin, FaGithub, FaXTwitter } from "react-icons/fa6";
import Link from "next/link";
import ProjectBoard from "@/components/projects/ProjectBoard/ProjectBoard";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMediaQuery } from "@/hooks/use-media-query";

interface EventWithRole extends EventItem {
  user_event_roles: {
    role: EventRole;
  }[];
}

interface SocialLinks {
  linkedin?: string;
  github?: string;
  twitter?: string;
  portfolio?: string;
}

export default function ProfilePage() {
  const { userId } = useParams();
  const [session, setSession] = useState<Session | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{
    display_name: string | null;
    email: string | null;
    links: SocialLinks | null;
  } | null>(null);
  const [events, setEvents] = useState<EventWithRole[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [isEditingLinks, setIsEditingLinks] = useState(false);
  const [newSocialLinks, setNewSocialLinks] = useState<SocialLinks>({});
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("projects");
  const isMobile = useMediaQuery("(max-width: 768px)");

  const tabs = [
    { key: "projects", label: "Projects" },
    { key: "events", label: "Events" },
    { key: "personal", label: "Personal" },
  ];

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
          .select("display_name, email, links")
          .eq("uid", userId)
          .single();

        if (profileError) throw profileError;
        setUserProfile(profile);
        setNewSocialLinks(profile.links || {});

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

  const handleUpdateDisplayName = async () => {
    if (!newDisplayName.trim()) return;

    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ display_name: newDisplayName })
        .eq("uid", userId);

      if (error) throw error;

      toast({
        title: "Display name updated",
        description: "Your display name has been updated successfully",
      });
      setUserProfile((prev) =>
        prev ? { ...prev, display_name: newDisplayName } : null
      );
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error updating display name",
        description: "Please try again later",
        variant: "destructive",
      });
      console.error("Error updating display name:", error);
    }
  };

  const handleUpdateSocialLinks = async () => {
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ links: newSocialLinks })
        .eq("uid", userId);

      if (error) throw error;

      toast({
        title: "Social links updated",
        description: "Your social links have been updated successfully",
      });
      setUserProfile((prev) =>
        prev ? { ...prev, links: newSocialLinks } : null
      );
      setIsEditingLinks(false);
    } catch (error) {
      toast({
        title: "Error updating social links",
        description: "Please try again later",
        variant: "destructive",
      });
      console.error("Error updating social links:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {session ? <AuthNavbar /> : <Navbar />}
      <Toaster />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="group relative inline-block">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  className="text-3xl font-bold text-gray-900"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUpdateDisplayName();
                    } else if (e.key === "Escape") {
                      setIsEditing(false);
                    }
                  }}
                  autoFocus
                />
                <button
                  onClick={handleUpdateDisplayName}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-gray-900">
                  {userProfile?.display_name || "User Profile"}
                </h1>
                {/* {session?.user?.id === userId && (
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setNewDisplayName(userProfile?.display_name || "");
                    }}
                    className="absolute -right-8 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded-full transition-all"
                  >
                    <Pencil className="w-5 h-5 text-gray-600" />
                  </button>
                )} */}
              </>
            )}
          </div>
          <p className="mt-2 text-gray-600">{userProfile?.email}</p>
        </div>

        <div className="flex justify-center space-x-8 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-4 px-6 text-lg font-medium focus:outline-none transition
                ${
                  activeTab === tab.key
                    ? "border-b-2 border-gray-900 text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {activeTab === "projects" && (
            <div>
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
                <ProjectBoard
                  isLoading={isLoading}
                  projectList={projects}
                  session={session ?? undefined}
                  projectBoardContext={
                    userId === session?.user?.id
                      ? ProjectBoardContext.MyProjects
                      : ProjectBoardContext.EventGallery
                  }
                />
              )}
            </div>
          )}
          {activeTab === "events" && (
            <div>
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
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
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
                </motion.div>
              )}
            </div>
          )}
          {activeTab === "personal" && (
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Find Me!</span>
                    {session?.user?.id === userId && (
                      <button
                        onClick={() => {
                          setIsEditingLinks(true);
                          setNewSocialLinks(userProfile?.links || {});
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full transition-all"
                      >
                        <Pencil className="w-5 h-5 text-gray-600" />
                      </button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditingLinks ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <FaLinkedin className="w-5 h-5 text-gray-600" />
                        <Input
                          type="url"
                          placeholder="LinkedIn Profile URL"
                          value={newSocialLinks.linkedin || ""}
                          onChange={(e) =>
                            setNewSocialLinks((prev) => ({
                              ...prev,
                              linkedin: e.target.value || undefined,
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <FaGithub className="w-5 h-5 text-gray-600" />
                        <Input
                          type="url"
                          placeholder="GitHub Profile URL"
                          value={newSocialLinks.github || ""}
                          onChange={(e) =>
                            setNewSocialLinks((prev) => ({
                              ...prev,
                              github: e.target.value || undefined,
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <FaXTwitter className="w-5 h-5 text-gray-600" />
                        <Input
                          type="url"
                          placeholder="Twitter Profile URL"
                          value={newSocialLinks.twitter || ""}
                          onChange={(e) =>
                            setNewSocialLinks((prev) => ({
                              ...prev,
                              twitter: e.target.value || undefined,
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-gray-600" />
                        <Input
                          type="url"
                          placeholder="Portfolio Website URL"
                          value={newSocialLinks.portfolio || ""}
                          onChange={(e) =>
                            setNewSocialLinks((prev) => ({
                              ...prev,
                              portfolio: e.target.value || undefined,
                            }))
                          }
                        />
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button
                          onClick={() => setIsEditingLinks(false)}
                          className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUpdateSocialLinks}
                          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userProfile?.links?.linkedin && (
                        <a
                          href={userProfile.links.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                        >
                          <FaLinkedin className="w-5 h-5" />
                          <span>LinkedIn Profile</span>
                        </a>
                      )}
                      {userProfile?.links?.github && (
                        <a
                          href={userProfile.links.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-gray-900 hover:text-gray-700"
                        >
                          <FaGithub className="w-5 h-5" />
                          <span>GitHub Profile</span>
                        </a>
                      )}
                      {userProfile?.links?.twitter && (
                        <a
                          href={userProfile.links.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-400 hover:text-blue-600"
                        >
                          <FaXTwitter className="w-5 h-5" />
                          <span>Twitter Profile</span>
                        </a>
                      )}
                      {userProfile?.links?.portfolio && (
                        <a
                          href={userProfile.links.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                        >
                          <Globe className="w-5 h-5" />
                          <span>Portfolio Website</span>
                        </a>
                      )}
                      {!userProfile?.links?.linkedin &&
                        !userProfile?.links?.github &&
                        !userProfile?.links?.twitter &&
                        !userProfile?.links?.portfolio && (
                          <p className="text-gray-500 italic">
                            No social links added yet
                          </p>
                        )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
