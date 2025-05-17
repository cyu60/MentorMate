# MentorMate Adaptation for Stanford Demo Day

## Overview

This document outlines the requirements for adapting MentorMate from its current hackathon-focused implementation to support Stanford Demo Day events and similar showcase formats.

## Core Feature Requirements

### 1. Customizable Role Labels ✅

- ✅ **Dynamic Label System**: Implement a JSON-based mapping system that allows organizers to customize all role labels throughout the application
- ✅ **Implementation Details**:
  - ✅ Create a role label mapping function (e.g., `getRoleLabel(role)`)
  - ✅ Default terms (hackathon context): "Judges", "Participants", "Mentors", "Organizers"
  - ✅ Example customization (demo day context): "Investors", "Founders", "Observers", "Organizers"
- ✅ **UI Component**: Add interface in organizer dashboard to modify these label mappings
- ✅ **Persistence**: Store custom labels in the event configuration

### 2. Role System Adaptation ✅

#### Role Definitions

| Base Role    | Demo Day Context | Description                                                     | Access Level               |
| ------------ | ---------------- | --------------------------------------------------------------- | -------------------------- |
| Judges       | Investors        | Can evaluate/score submissions and indicate investment interest | Password-protected         |
| Participants | Founders         | Can submit projects/startups                                    | Registration-required      |
| Mentors      | Observers        | Can view submissions but not judge/score                        | Open or password-protected |
| Organizers   | Organizers       | Full administrative control                                     | Account-required           |

#### Security Enhancements ✅

- ✅ **Password Protection**: Implement/enhance password protection for the Investor/Judge role
- ✅ **Access Control**: Ensure proper permission boundaries between roles

### 3. Enhanced Judging Interface ✅

- ✅ **Investment-Focused UI**: Redesign the judging panel to better suit investment decisions
- ✅ **Scoring Mechanisms**:
  - ✅ Binary decision option: "Invest" / "Pass"
  - ✅ Optional: Investment amount range or tiers
  - ✅ Comments field for feedback/notes
- ✅ **UI Components**:
  - ✅ Clear, minimal interface optimized for quick decisions
  - ✅ Mobile-responsive design for on-the-go usage during demo day
  - ✅ Batch processing capabilities for reviewing multiple pitches

### 4. Platform Documentation

- **Role Documentation**: Create comprehensive documentation explaining each role's capabilities and limitations
- **Admin Guide**: Instructions for organizers on how to configure the platform for demo days vs hackathons
- **Context Adaptability**: Document how the platform supports different event formats beyond hackathons

## Implementation Approach

The adaptation will focus primarily on frontend changes and configuration options, leveraging the existing backend architecture. Key implementation areas:

1. ✅ Create JSON configuration schema for role labels
2. ✅ Refactor UI components to use dynamic label functions
3. ✅ Enhance the judging/investor interface
4. ✅ Update permission system to support new role configurations

## Timeline and Priorities

1. ✅ **Phase 1**: Implement role label customization system
2. ✅ **Phase 2**: Enhance judging interface for investor use case
3. **Phase 3**: Update documentation and role explanations
4. **Phase 4**: Testing with Stanford Demo Day specific configurations

## Future Considerations

- Support for additional event types beyond hackathons and demo days
- Analytics specific to investment-focused events
- Integration with follow-up systems for post-event investment tracking
