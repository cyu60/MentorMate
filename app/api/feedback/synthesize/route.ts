import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    console.log("Starting feedback synthesis...");
    const body = await request.json();
    const { id } = body;
    
    console.log("Project ID:", id);

    if (!id) {
      console.error("No project ID provided");
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const { data: feedbackData, error: feedbackError } = await supabase
      .from("feedback")
      .select("*")
      .eq("project_id", id);

    if (feedbackError) {
      console.error("Supabase error:", feedbackError);
      return NextResponse.json(
        { error: "Error fetching feedback" },
        { status: 500 }
      );
    }

    if (!feedbackData || feedbackData.length === 0) {
      console.log("No feedback found for project:", id);
      return NextResponse.json(
        { error: "No feedback found for this project" },
        { status: 404 }
      );
    }

    console.log("Found feedback items:", feedbackData.length);

    const feedbackText = feedbackData
      .map(
        (f) => `Feedback:
${f.feedback_text}
`
      )
      .join("\n");

    console.log("Preparing OpenAI request...");

    const systemPrompt = `You are an expert at analyzing and synthesizing feedback. 
Given multiple pieces of feedback about a project, your task is to:
1. Identify common themes and patterns (areas of strength and improvement)
2. Provide actionable recommendations
3. Present the information in a clear, organized format

Please analyze the following feedback and provide a comprehensive synthesis. KEEP IT BRIEF WITHOUT LOSING INFORMATION. Provide your response in simple text form without delimters:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: feedbackText,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    console.log("OpenAI request completed");

    const synthesis = completion.choices[0].message.content;

    return NextResponse.json({ synthesis });
  } catch (error) {
    console.error("Error in synthesis route:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error synthesizing feedback" },
      { status: 500 }
    );
  }
}