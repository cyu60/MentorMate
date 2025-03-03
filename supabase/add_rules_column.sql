ALTER TABLE events 
ADD COLUMN rules JSONB DEFAULT '[
  {
    "title": "General Rules",
    "items": [
      "All work must be completed during the hackathon",
      "Teams can have up to 4 members",
      "Projects must be original work",
      "Use of open source libraries and APIs is allowed"
    ]
  },
  {
    "title": "Submission Requirements",
    "items": [
      "Project must be submitted before the deadline",
      "Include a demo video",
      "Provide access to source code",
      "Complete project documentation"
    ]
  }
]'::jsonb NOT NULL;

UPDATE events 
SET rules = '[
  {
    "title": "General Rules",
    "items": [
      "All work must be completed during the hackathon",
      "Teams can have up to 4 members",
      "Projects must be original work",
      "Use of open source libraries and APIs is allowed"
    ]
  },
  {
    "title": "Submission Requirements",
    "items": [
      "Project must be submitted before the deadline",
      "Include a demo video",
      "Provide access to source code",
      "Complete project documentation"
    ]
  }
]'::jsonb
WHERE rules IS NULL;