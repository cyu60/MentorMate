# Helper Functions

This directory contains reusable helper functions for common operations throughout the application.

## Project Helpers (`projects.ts`)

Provides standardized functions for fetching project data from Supabase.

### Functions

#### `fetchProjectById(projectId: string, includeEventName?: boolean): Promise<Project | null>`

Fetches a project by its ID.

**Parameters:**

- `projectId`: ID of the project to fetch
- `includeEventName`: (Optional, default: false) If true, also fetches the event name for the project's event_id

**Returns:**

- A Promise that resolves to the project data or null if not found or if an error occurs

**Example:**

```typescript
// Basic usage
const project = await fetchProjectById('some-project-id');

// With event name
const projectWithEvent = await fetchProjectById('some-project-id', true);
```

#### `fetchProjectsByEventId(eventId: string): Promise<Project[]>`

Fetches all projects associated with an event.

**Parameters:**

- `eventId`: ID of the event to fetch projects for

**Returns:**

- A Promise that resolves to an array of projects or an empty array if none found or if an error occurs

**Example:**

```typescript
const projects = await fetchProjectsByEventId('some-event-id');
```

### Project Interface

```typescript
export interface Project {
  id: string;
  project_name: string;
  lead_name: string;
  lead_email: string;
  project_description: string;
  teammates: string[];
  project_url?: string | null;
  additional_materials_url?: string | null;
  cover_image_url?: string | null;
  event_id: string;
  event_name?: string;
}
```

## Usage in Components

Here's how to use the helper functions in your components:

```typescript
import { fetchProjectById, Project } from "@/lib/helpers/projects";

// In a React component
const [project, setProject] = useState<Project | null>(null);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const loadProject = async () => {
    // Fetch project data
    const projectData = await fetchProjectById(projectId);
    setProject(projectData);
    setIsLoading(false);
  };

  loadProject();
}, [projectId]);
```
