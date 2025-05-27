# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

Essential commands for development:
- `npm run dev` - Start development server on localhost:3000
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks
- `npm run setup-db` - Initialize database with env-cmd using .env.local

## Project Architecture

**MentorMate** is a Next.js 15 application for hackathon mentor-participant feedback system built with TypeScript, Supabase, and TailwindCSS.

### Core Architecture Patterns

**Next.js App Router Structure:**
- Uses App Router with TypeScript and route groups for organization
- Route groups: `(static)` for public pages, `(users)` for authenticated pages
- Dynamic routes for events `[id]` and projects `[projectId]`
- API routes in `app/api/` for backend functionality

**Authentication & Authorization:**
- Supabase Auth integration with middleware-based session management
- Role-based access control: participant, mentor, judge, organizer, admin
- `AuthProvider` wraps the app with authentication state management
- `AuthRedirectProvider` handles automatic redirects based on auth state
- Public routes defined in `AuthProvider` with regex patterns for dynamic routes

**Database Architecture:**
- Supabase PostgreSQL with TypeScript-generated types in `lib/database.types.ts`
- Key tables: `user_event_roles`, `projects`, `project_scores`
- Role-based row-level security (RLS) policies
- Migration files in `supabase/migrations/` with versioned naming

**State Management:**
- React Context for auth state in `AuthProvider`
- Custom hooks: `use-profile.ts`, `use-project.ts`, `use-toast.ts`
- Form handling with `react-hook-form` and Zod validation

### Component Organization

**UI Components:**
- Radix UI primitives in `components/ui/` with consistent styling
- Custom components follow feature-based organization
- Dashboard components for each role type (admin, participant, mentor, etc.)

**Layout Structure:**
- Root layout with gradient background and responsive design
- Development-only Stagewise toolbar integration
- Toast notifications via Sonner

### Key Integrations

**Supabase Integration:**
- Client-side: `app/utils/supabase/client.ts`
- Server-side: `app/utils/supabase/server.ts`  
- Middleware: `app/utils/supabase/middleware.ts`
- Session management across client/server boundary

**Email System:**
- Nodemailer integration for notifications
- Template system in `app/email-templates/`
- Google APIs integration via `googleapis`

**QR Code Functionality:**
- Project sharing via QR codes using `qrcode.react`
- QR scanning with `@yudiel/react-qr-scanner`

## Project Structure

**Feature-Based Architecture (Newly Implemented):**
```
features/
├── projects/                    # Project management feature
│   ├── components/
│   │   ├── forms/              # ProjectSubmissionForm, SubmissionConfirmation
│   │   ├── displays/           # ProjectBoard, my-project-section
│   │   ├── feedback/           # FeedbackForm
│   │   └── management/         # project-dashboard
│   ├── hooks/                  # use-project
│   └── utils/                  # projects helpers
└── user/                       # User management feature  
    ├── authentication/         # AuthProvider, AuthRedirectProvider
    ├── dashboards/            # Role-specific dashboards
    ├── profiles/              # Profile management
    └── roles/                 # Role utilities

lib/
├── config/          # Configuration and constants
├── templates/       # Email templates  
├── hooks/          # Shared React hooks
├── utils/          # Shared utility functions
└── types/          # TypeScript type definitions

app/
├── (auth)/         # Authentication pages
├── (users)/        # User-specific pages  
├── api/           # API routes
└── utils/supabase/ # Next.js specific Supabase utilities
```

## Development Guidelines

**File Naming:**
- Components use PascalCase: `AuthProvider.tsx`
- Pages use kebab-case: `page.tsx`
- Utilities use camelCase: `invite-links.ts`

**Import Paths:**
- Project Components: `@/features/projects/components/{forms,displays,feedback,management}/*`
- User Components: `@/features/user/{authentication,dashboards,profiles,roles}/*`  
- Project Hooks: `@/features/projects/hooks/*`
- Shared Hooks: `@/lib/hooks/*`
- Templates: `@/lib/templates/*`
- Config: `@/lib/config/*`
- Types: `@/lib/types/*`

**Database Operations:**
- Use TypeScript types from `lib/database.types.ts`
- Prefer server-side operations for sensitive data
- Follow RLS policies for data access

**Authentication Flow:**
- Check auth state in `AuthProvider` before accessing protected routes
- Use role-based conditionals for feature access
- Handle auth redirects via `AuthRedirectProvider`

**Environment Setup:**
- Requires `.env.local` with Supabase credentials
- Development includes Stagewise toolbar for debugging
- Database setup via `npm run setup-db` command