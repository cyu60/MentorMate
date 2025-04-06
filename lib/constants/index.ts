import { ScoringCriterion } from "../types";

// Admin User IDs type
type AdminUserId = string;

// Error Messages
export const ERROR_MESSAGES = {
  REGISTRATION_CONTEXT: 'useEventRegistration must be used within an EventRegistrationProvider',
  REGISTRATION_STATUS: 'Error checking registration status:',
};

// UI Text
export const UI_TEXT = {
  SEARCH_PLACEHOLDER: 'Search hackathons...',
  NO_EVENTS_FOUND: 'No events found for the selected filters.',
};

// Default Values
export const DEFAULT_VALUES = {
  SEARCH_TERM: '',
}; 

// Default scoring criteria if none are configured for the event
export const defaultCriteria: ScoringCriterion[] = [
  {
    id: "technical",
    name: "Technical Implementation",
    description: "Quality of code, technical complexity, and implementation",
    weight: 1,
  },
  {
    id: "innovation",
    name: "Innovation",
    description: "Originality, creativity, and uniqueness of the solution",
    weight: 1,
  },
  {
    id: "impact",
    name: "Impact",
    description: "Potential impact and real-world applicability",
    weight: 1,
  },
  {
    id: "presentation",
    name: "Presentation",
    description: "Quality of documentation, demo, and overall presentation",
    weight: 1,
  },
];

export const ADMIN_USER_IDS: AdminUserId[] = [
  // Add your admin user IDs here
  "5fd21fad-2ea4-4caa-aab1-596ab7f6a4d7", // spencer
  "e4182548-e05d-4201-bc61-fe5d76a7a7ce", // quest 2 learn
  "c0bb8ce8-a8cf-4db0-82d3-262535825d12", // Hello mentor mates
  "e4182548-e05d-4201-bc61-fe5d76a7a7ce", // Matthew dev
  "a91610aa-5324-4978-b75d-2994ba3e15fd" // Chinat dev
];
