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
      .select("event_id, submission_time_start, submission_time_cutoff")
      .eq("event_id", eventId)
      .single();

    if (eventError) {
      console.error("Event fetch error:", eventError);
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

    // Validate track_ids exist in event_tracks table
    if (!trackIds || trackIds.length === 0) {
      return NextResponse.json(
        { error: "At least one track must be selected" },
        { status: 400 }
      );
    }

    const { data: validTracks, error: trackError } = await supabase
      .from("event_tracks")
      .select("track_id")
      .eq("event_id", eventId)
      .in("track_id", trackIds);

    if (trackError) {
      console.error("Track validation error:", trackError);
      return NextResponse.json(
        { error: "Failed to validate tracks" },
        { status: 500 }
      );
    }

    const validTrackIds = validTracks.map((t) => t.track_id);
    const invalidTracks = trackIds.filter(
      (id: string) => !validTrackIds.includes(id)
    );

    if (invalidTracks.length > 0) {
      return NextResponse.json(
        { error: `Invalid track IDs: ${invalidTracks.join(", ")}` },
        { status: 400 }
      );
    }

    // Start a transaction to ensure both project and track relationships are created
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        project_name: projectName,
        lead_name: leadName,
        lead_email: leadEmail,
        project_description: projectDescription,
        teammates: teammates || [],
        project_url: projectUrl || null,
        cover_image_url: coverImageUrl || null,
        additional_materials_url: additionalMaterialsUrl || null,
        event_id: eventId,
      })
      .select()
      .single();

    if (projectError) {
      console.error("Project creation error:", projectError);
      return NextResponse.json(
        { error: "Failed to create project" },
        { status: 500 }
      );
    }

    // Create track relationships
    const trackInserts = trackIds.map((trackId: string) => ({
      project_id: project.id,
      track_id: trackId,
    }));

    const { error: trackInsertError } = await supabase
      .from("project_tracks")
      .insert(trackInserts);

    if (trackInsertError) {
      console.error("Track relationship error:", trackInsertError);
      // Delete the project since track relationships failed
      await supabase.from("projects").delete().eq("id", project.id);
      return NextResponse.json(
        { error: "Failed to create project track relationships" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: project });
  } catch (error) {
    console.error("Error in project submission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
