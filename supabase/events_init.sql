-- Create events table with all fields including JSON data
create table events (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  date text not null,
  location text not null,
  description text not null,
  schedule jsonb not null default '[]'::jsonb,
  prizes jsonb not null default '[]'::jsonb,
  resources jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS)
alter table events enable row level security;

-- Create policy to allow public read access
create policy "Enable read access for all users" on events
  for select
  to public
  using (true);

-- Insert sample data
insert into events (name, date, location, description, schedule, prizes, resources) values
(
  'TreeHacks 2025',
  'February 27-29, 2025',
  'Stanford University',
  'Join us for TreeHacks 2025, Stanford''s premier hackathon! This year''s theme focuses on leveraging technology for social impact, featuring tracks in healthcare, sustainability, and education.',
  '[
    {
      "time": "Friday, Feb 27",
      "events": [
        {"name": "Check-in & Registration", "time": "3:00 PM - 5:00 PM"},
        {"name": "Opening Ceremony", "time": "5:30 PM - 6:30 PM"},
        {"name": "Team Formation", "time": "6:30 PM - 7:30 PM"},
        {"name": "Hacking Begins!", "time": "8:00 PM"}
      ]
    },
    {
      "time": "Saturday, Feb 28",
      "events": [
        {"name": "Workshops & Mentorship", "time": "10:00 AM - 5:00 PM"},
        {"name": "Project Check-in", "time": "3:00 PM"}
      ]
    },
    {
      "time": "Sunday, Feb 29",
      "events": [
        {"name": "Hacking Ends", "time": "8:00 AM"},
        {"name": "Project Submission", "time": "9:00 AM"},
        {"name": "Judging", "time": "10:00 AM - 12:00 PM"},
        {"name": "Closing Ceremony", "time": "1:00 PM - 2:00 PM"}
      ]
    }
  ]'::jsonb,
  '[
    {
      "track": "Healthcare Innovation",
      "prize": "$3,000",
      "description": "Best solution addressing healthcare challenges"
    },
    {
      "track": "Sustainability",
      "prize": "$3,000",
      "description": "Most innovative environmental impact solution"
    },
    {
      "track": "Education Technology",
      "prize": "$3,000",
      "description": "Best educational technology solution"
    },
    {
      "track": "Best Overall Hack",
      "prize": "$5,000",
      "description": "Most impressive overall project"
    }
  ]'::jsonb,
  '[
    {"name": "Devpost", "link": "#"},
    {"name": "Discord", "link": "#"},
    {"name": "Mentor Support", "link": "#"},
    {"name": "Hardware Lab", "link": "#"}
  ]'::jsonb
);