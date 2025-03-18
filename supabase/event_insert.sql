INSERT INTO "public"."events" 
("event_id", "event_name", "event_date", "location", "event_description", "event_schedule", "event_prizes", "event_resources", "created_at", "rules") 
VALUES 
('9a630393-1f7f-48ff-9ba4-6bf108d40b66', 
 'TreeHacks 2025', 
 '2025-02-27',  -- Start date
 'Stanford University', 
 'Join us for TreeHacks 2025, Stanford''s premier hackathon! This year''s theme focuses on leveraging technology for social impact, featuring tracks in healthcare, sustainability, and education.', 
 '[{"time": "Friday, Feb 27", "events": [{"name": "Check-in & Registration", "time": "3:00 PM - 5:00 PM"}, {"name": "Opening Ceremony", "time": "5:30 PM - 6:30 PM"}, {"name": "Team Formation", "time": "6:30 PM - 7:30 PM"}, {"name": "Hacking Begins!", "time": "8:00 PM"}]}, {"time": "Saturday, Feb 28", "events": [{"name": "Workshops & Mentorship", "time": "10:00 AM - 5:00 PM"}, {"name": "Project Check-in", "time": "3:00 PM"}]}, {"time": "Sunday, Feb 29", "events": [{"name": "Hacking Ends", "time": "8:00 AM"}, {"name": "Project Submission", "time": "9:00 AM"}, {"name": "Judging", "time": "10:00 AM - 12:00 PM"}, {"name": "Closing Ceremony", "time": "1:00 PM - 2:00 PM"}]}]'::json, 
 '[{"prize": "$3,000", "track": "Healthcare Innovation", "description": "Best solution addressing healthcare challenges"}, {"prize": "$3,000", "track": "Sustainability", "description": "Most innovative environmental impact solution"}, {"prize": "$3,000", "track": "Education Technology", "description": "Best educational technology solution"}, {"prize": "$5,000", "track": "Best Overall Hack", "description": "Most impressive overall project"}]'::json, 
 '[{"link": "#", "name": "Devpost"}, {"link": "#", "name": "Discord"}, {"link": "#", "name": "Mentor Support"}, {"link": "#", "name": "Hardware Lab"}]'::json, 
 '2025-02-28 02:04:39.589092+00', 
 '[{"items": ["All work must be completed during the hackathon", "Teams can have up to 4 members", "Projects must be original work", "Use of open source libraries and APIs is allowed"], "title": "General Rules"}, {"items": ["Project must be submitted before the deadline", "Include a demo video", "Provide access to source code", "Complete project documentation"], "title": "Submission Requirements"}]'::json);