"use client";

import { StagewiseToolbar } from "@stagewise/toolbar-next";

const stagewiseConfig = {
  plugins: [],
  onRequest: async (request: { type: string; payload: any }) => {
    console.log("Received request:", request);
    return { success: true };
  },
};

export function StagewiseToolbarWrapper() {
  if (process.env.NODE_ENV !== "development") return null;

  return <StagewiseToolbar config={stagewiseConfig} />;
}
