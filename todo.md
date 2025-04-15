# MentorMate Product Requirements Document

## Overview
This document outlines the key features and requirements for the MentorMate platform. Check off items as they are completed.

## Authentication & Security
- [x] Implement browserclient and serverclients to authenticate API endpoints
- [x] Make passcode protection for judging and organizer roles
- [x] Verify passcode on judge's side ✅
- [x] Implement database functions for transactions for organizer changes
- [ ] Add API route protections and authentication
- [ ] Support password authentication for organizers

## Submission System
- [x] Submission time management
    - [x] Open/close submission periods
    - [x] Track submission timestamps
    - [x] Implement submission deadlines per track
- [ ] Track-based submissions
    - [x] Add trackID field to project schema
    - [x] Support multiple tracks (array)
    - [x] Add UI elements for track selection (dropdown/checkbox)
    - [ ] Display selected track in dashboard
    - [X] Prevent submissions outside deadline windows
- [ ] Submission validation
    - [ ] Fix validation bugs for missing fields
    - [ ] Stress test server calls
    - [ ] Ensure submissions appear in dashboard view

## Track-Based Judging System
### Track Configuration
- [x] Parse event_prizes JSONB from events table
    - [x] Extract track names and prizes
    - [x] Handle track-specific descriptions
    - [x] Support dynamic track addition/modification

### Scoring Configuration
- [x] Implement scoring config parser from events table
    - [x] Parse scoring_config JSONB column
    - [x] Create dynamic scoring forms based on config
    - [x] Validate scoring inputs against config schema
    - [x] Support different scoring weights per criterion
    - [x] Handle track-specific scoring variations
- [ ] Implement scoring defaults for missing track configs

### Judge Review System
- [x] Implement judge identification for reviews
    - [x] Add judge metadata to each review
    - [x] Track review timestamps and modifications
    - [x] Allow judges to edit their own reviews
- [x] Frontend Implementation
    - [x] Build judging editing interface
    - [x] Support track-specific scoring forms
    - [ ] Enable score and reflection aggregation

### Project Assignment System
- [ ] Implement project assignment functionality
    - [ ] Create logic to assign projects to judges
    - [ ] Display assigned projects to judges
    - [ ] Add winner/placed column to project model
    - [ ] Create admin API route for tagging winners

## Organizer Dashboard
### Score Management
- [ ] Implement aggregated scoring views
    - [ ] Display scores by track
    - [ ] Show individual judge scores
    - [ ] Calculate final rankings
    - [ ] Show judge-specific scoring patterns
    - [ ] Display scoring distribution per criterion
- [ ] Fix dashboard rendering for missing track configs

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
- [ ] Database Enhancements
    - [ ] Modify SQL for default trackID in old entries
    - [ ] Set nullable/default values in SQL tables
    - [ ] Add JSONB field for event_prizes
- [ ] Production Support
    - [ ] Implement data backup system
    - [ ] Set up production monitoring
    - [ ] Create disaster recovery plan

## Completed Features
- [x] Verify passcode on judge's side
- [x] Basic submission time management
- [x] Track-based scoring interface
- [x] Judge review system with track selection

## Notes
- Regular testing is required for each completed feature
- All features should include error handling and logging
- UI/UX should be consistent across all new features
- Scoring configurations must be validated before being applied
- Judge reviews must maintain data integrity and auditability
