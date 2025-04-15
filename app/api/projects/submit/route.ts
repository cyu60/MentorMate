import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/app/utils/supabase/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseClient();

  try {
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (!user?.user || userError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      projectName,
      leadName,
      leadEmail,
      projectDescription,
      teammates,
      projectUrl,
      coverImageUrl,
      additionalMaterialsUrl,
      eventId,
      trackIds,
    } = body;

    // First, check if the event exists and get its submission time window
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .select("submission_time_start, submission_time_cutoff, scoring_config")
      .eq("event_id", eventId)
      .single();

    console.log("event_id:", eventId);

    if (eventError) {
      return NextResponse.json(
        { error: "Failed to fetch event data" },
        { status: 500 }
      );
    }

    if (!eventData) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if current time is within submission window
    const now = new Date();
    const submissionStart = new Date(eventData.submission_time_start);
    const submissionCutoff = new Date(eventData.submission_time_cutoff);

    if (now < submissionStart) {
      return NextResponse.json(
        { error: "Project submission has not started yet" },
        { status: 400 }
      );
    }

    if (now > submissionCutoff) {
      return NextResponse.json(
        { error: "Project submission deadline has passed" },
        { status: 400 }
      );
    }

    // Validate track_ids exist in event scoring config
    if (trackIds?.length > 0 && eventData.scoring_config) {
      const validTracks = Object.keys(eventData.scoring_config.tracks || {});
      const invalidTracks = trackIds.filter((id: string) => !validTracks.includes(id));
      if (invalidTracks.length > 0) {
        return NextResponse.json(
          { error: `Invalid track IDs: ${invalidTracks.join(", ")}` },
          { status: 400 }
        );
      }
    }

    // Insert the project
    const { data, error } = await supabase
      .from("projects")
      .insert({
        project_name: projectName,
        lead_name: leadName,
        lead_email: leadEmail,
        project_description: projectDescription,
        teammates: teammates,
        project_url: projectUrl || null,
        cover_image_url: coverImageUrl,
        additional_materials_url: additionalMaterialsUrl,
        event_id: eventId,
        track_ids: trackIds || [],
      })
      .select();

    if (error) {
      console.error("Project creation error:", error);
      return NextResponse.json(
        { error: "Failed to create project" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error in project submission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
