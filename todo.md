# MentorMate Product Requirements Document

## Overview

This document outlines the key features and requirements for the MentorMate platform. Check off items as they are completed.

## **✅ Critical Feature Checklist for Minerva Hacks**

### **🔧 1. Track System Implementation**

- [X] Create a proper event_tracks table in the database
  - [X] Each track should have a unique, immutable ID (foreign key supported)
  - [X] Include metadata: description, associated event, label, description
- [X] Define prize info per track <- add this to the list of existing prizes in the current events table
- [X] Define scoring criteria per track (can be stored as JSON) <- get this from the current events table it is currently stored in scoring_config
- [X] Support track-based judging (scores assigned per track)
- [ ] Support assigning winners per track

---

### **📊 2. Organizer Dashboard Enhancements**

- Display **full list of participants**
- Display **all project submissions**
- Show **live judge scores per project**
- Enable view of **which projects are leading per track**
- Calculate the scores to assign the winner
- Provide **export capability** for submissions and scores

---

### **🧪 3. Stress Testing & Bug Fixes**

- Run full platform **stress test with 50 dummy participants**
- Identify and fix **project registration/editing bugs**
- Test judge assignment flow and scoring reliability
- Validate feedback/commenting flow from mentors

## Authentication & Security

- [X] Implement browserclient and serverclients to authenticate API endpoints
- [X] Make passcode protection for judging and organizer roles
- [X] Verify passcode on judge's side ✅
- [X] Implement database functions for transactions for organizer changes
- [X] Add API route protections and authentication
- [ ] Support password authentication for organizers

## Submission System
- [x] Submission time management
    - [x] Open/close submission periods
    - [x] Track submission timestamps
    - [x] Implement submission deadlines per track
    - [ ] Submissions deadline needs to hold for editing a project after submission
- [ ] Track-based submissions
  - [X] Add trackID field to project schema
  - [X] Support multiple tracks (array)
  - [X] Add UI elements for track selection (dropdown/checkbox)
  - [ ] Display selected track in dashboard
  - [X] Prevent submissions outside deadline windows
  - [ ] Submission validation
  - [ ] Fix validation bugs for missing fields
  - [ ] Stress test server calls
  - [ ] Ensure submissions appear in dashboard view 

## Track-Based Judging System

### Track Configuration

- [X] Parse event_prizes JSONB from events table
  - [X] Extract track names and prizes
  - [X] Handle track-specific descriptions
  - [X] Support dynamic track addition/modification

### Scoring Configuration

- [X] Implement scoring config parser from events table
  - [X] Parse scoring_config JSONB column
  - [X] Create dynamic scoring forms based on config
  - [X] Validate scoring inputs against config schema
  - [X] Support different scoring weights per criterion
  - [X] Handle track-specific scoring variations
- [ ] Implement scoring defaults for missing track configs

### Judge Review System

- [X] Implement judge identification for reviews
  - [X] Add judge metadata to each review
  - [X] Track review timestamps and modifications
  - [X] Allow judges to edit their own reviews
- [X] Frontend Implementation
  - [X] Build judging editing interface
  - [X] Support track-specific scoring forms
  - [ ] Enable score and reflection aggregation

### Project Assignment System

- [ ] Implement project assignment functionality
  - [ ] Create logic to assign projects to judges
  - [ ] Display assigned projects to judges
  - [ ] Add winner/placed column to project model
  - [ ] Create admin API route for tagging winners

## Organizer Dashboard

### Event Details

- [ ] Allow organizers to change submission times
- [ ] Display video links as embedded

### Score Management

- [X] Implement aggregated scoring views
  - [X] Display scores by track
  - [ ] Show individual judge scores
  - [X] Calculate final rankings
  - [ ] Show judge-specific scoring patterns
  - [X] Display scoring distribution per criterion
- [X] Fix dashboard rendering for missing track configs

### Winner Management

- [ ] Implement winner management system
  - [ ] Allow manual winner assignment by organizers
  - [ ] Support multiple winners per track
  - [ ] Display winner status in dashboard

### Analytics & Reporting

- [ ] Build track-specific analytics
  - [ ] Generate submission statistics
  - [ ] Create judging progress reports
  - [ ] Export data in multiple formats
  - [ ] Generate judge participation reports

## Database & Infrastructure

- [X] Database Enhancements
  - [X] Modify SQL for default trackID in old entries
  - [X] Set nullable/default values in SQL tables
  - [X] Add JSONB field for event_prizes
  - [ ] Clean up columns that are no longer being used and remove them from the frontend
  - [ ] Fix auth callbacks and redirect urls -- need to change vercel env variables
- [X] Production Support
  - [X] Implement data backup system
  - [ ] Set up production monitoring
  - [ ] Create disaster recovery plan
- [ ] Storage 
    - [ ] Better storage organization for projects
    - [ ] Delete project materials on event deletion

## Completed Features

- [X] Verify passcode on judge's side
- [X] Basic submission time management
- [X] Track-based scoring interface
- [X] Judge review system with track selection

## Notes

- Regular testing is required for each completed feature
- All features should include error handling and logging
- UI/UX should be consistent across all new features
- Scoring configurations must be validated before being applied
- Judge reviews must maintain data integrity and auditability

## Examples

### Example of current event_prizes:

```json
[
  {
    "prize": "$3,000",
    "track": "AI Assistant for Learning Differences",
    "description": "Best project in the coding challenge"
  },
  {
    "prize": "$3,000",
    "track": "AI for Better Memory Retention",
    "description": "Best project in the coding challenge"
  },
  {
    "prize": "$3,000",
    "track": "Responsible AI in Education",
    "description": "Best essay in the essay challenge (in partnership with BoodleBox)"
  }
]
```

### Example of scoring config:

```json
{
  "tracks": {
    "essay_contest": {
      "name": "Essay Contest",
      "criteria": [
        {
          "id": "insight",
          "max": 10,
          "min": 1,
          "name": "Depth of Insight & Critical Thinking",
          "weight": 0.3,
          "description": "Does the essay demonstrate strong reasoning, thoughtful analysis, or a nuanced understanding of the topic? Does it go beyond surface-level opinions?"
        },
        {
          "id": "originality",
          "max": 10,
          "min": 1,
          "name": "Originality & Creativity",
          "weight": 0.25,
          "description": "Introduces original arguments, literary devices, or structures that set the essay apart."
        },
        {
          "id": "relevance",
          "max": 10,
          "min": 1,
          "name": "Relevance to the Theme",
          "weight": 0.2,
          "description": "Does the essay clearly engage with AI in education and the challenge prompt themes?"
        },
        {
          "id": "style",
          "max": 10,
          "min": 1,
          "name": "Clarity & Style",
          "weight": 0.25,
          "description": "Is the writing well-organized, coherent, and stylistically effective?"
        }
      ]
    },
    "coding_challenge_1": {
      "name": "Coding Challenge 1",
      "criteria": [
        {
          "id": "scientific_grounding",
          "max": 10,
          "min": 1,
          "name": "Scientific Grounding",
          "weight": 0.25,
          "description": "Are the techniques (spaced repetition, dual coding, etc.) accurately and meaningfully integrated?"
        },
        {
          "id": "user_impact",
          "max": 10,
          "min": 1,
          "name": "User Impact & Relevance",
          "weight": 0.25,
          "description": "Does the tool solve a real user need in a helpful, engaging, or personalized way? Would a student actually use it?"
        },
        {
          "id": "technical_execution",
          "max": 10,
          "min": 1,
          "name": "Technical Execution",
          "weight": 0.2,
          "description": "Is the solution functional and well-scoped for the hackathon timeframe?"
        },
        {
          "id": "creativity",
          "max": 10,
          "min": 1,
          "name": "Creativity & Originality",
          "weight": 0.15,
          "description": "Does it go beyond copying existing apps? Any clever UX, design, or conceptual innovation?"
        },
        {
          "id": "pitch",
          "max": 10,
          "min": 1,
          "name": "Pitch & Explanation",
          "weight": 0.15,
          "description": "Did the pitch present a clear and convincing rationale? Is the project clearly explained in the README or demo?"
        }
      ]
    },
    "coding_challenge_2": {
      "name": "Coding Challenge 2",
      "criteria": [
        {
          "id": "problem_insight",
          "max": 10,
          "min": 1,
          "name": "Problem Insight & Relevance",
          "weight": 0.25,
          "description": "Does the project demonstrate a deep understanding of neurodivergent users' needs? How is that incorporated into the design?"
        },
        {
          "id": "inclusive_design",
          "max": 10,
          "min": 1,
          "name": "Inclusive Design & Accessibility",
          "weight": 0.25,
          "description": "Does the tool consider how a neurodivergent learner would interact with it? Is the UX accessible, customizable, or adaptive?"
        },
        {
          "id": "technical_execution",
          "max": 10,
          "min": 1,
          "name": "Technical Execution",
          "weight": 0.2,
          "description": "Is the solution functional and well-scoped for the hackathon timeframe?"
        },
        {
          "id": "creativity",
          "max": 10,
          "min": 1,
          "name": "Creativity & Originality",
          "weight": 0.15,
          "description": "Does it go beyond copying existing apps? Any clever UX, design, or conceptual innovation?"
        },
        {
          "id": "pitch",
          "max": 10,
          "min": 1,
          "name": "Pitch & Explanation",
          "weight": 0.15,
          "description": "Did the pitch present a clear and convincing rationale? Is the project clearly explained in the README or demo?"
        }
      ]
    }
  },
  "defaultMax": 10,
  "defaultMin": 1,
  "defaultWeight": 1
}
```
