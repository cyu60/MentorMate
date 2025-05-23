"use client";

import { StagewiseToolbar } from "@stagewise/toolbar-next";

interface StagewiseRequest {
  type: string;
  payload: unknown;
}

const stagewiseConfig = {
  plugins: [],
  onRequest: async (request: StagewiseRequest) => {
    console.log("Received request:", request);
    return { success: true };
  },
};

export function StagewiseToolbarWrapper() {
  if (process.env.NODE_ENV !== "development") return null;

  return <StagewiseToolbar config={stagewiseConfig} />;
}
