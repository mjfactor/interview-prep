# Active Context

## Current Work Focus
- **Integrate interview settings UI with the backend Gemini API.**
- Implement the actual interview session UI (displaying questions, handling responses).
- Define and implement Firestore security rules.
- Enhance user profile and preference management.
- Develop response evaluation and feedback mechanisms.

## Recent Changes
- Project initialization with Next.js 14 and TypeScript
- Implemented basic project structure with app directory layout
- Set up Shadcn UI components for consistent design
- Created initial authentication pages
- Added API route for question generation
- Implemented Firestore integration to store user profiles after OAuth authentication
- Added error handling for Firestore operations to ensure graceful fallbacks
- **Created the interview settings form UI (`interview-page/page.tsx`) using Shadcn components (Input, Label, Button, Select) and React state.**
- **Implemented tech stack input with add/remove functionality and dynamic suggestions.**

## Next Steps
1. **Connect the interview settings form to the `/api/generate-question` endpoint.**
2. **Implement the UI to display generated questions and allow user input for answers.**
3. Set up user profile and preference management
4. Create progress tracking and history views
5. Enhance feedback mechanisms for user responses
6. Implement proper Firestore security rules to secure user data
7. Add more comprehensive error handling for all Firebase operations

## Active Decisions and Considerations
- **AI Integration Approach**: Determining best prompt structure for Gemini API to generate relevant questions
- **User Experience Flow**: Balancing simplicity with feature richness in the practice session
- **Response Evaluation**: Deciding on approach for evaluating user interview responses
- **Data Structure**: Designing optimal Firebase schema for storing questions, responses, and user data
  - Using users/{uid} document pattern with UID from Firebase Auth
  - Storing essential user profile data with merge option to preserve existing fields
- **Authentication Strategy**: Implementing secure but frictionless user authentication
  - Using Google OAuth for primary authentication
  - Storing authenticated user data in Firestore for additional profile information

## Important Patterns and Preferences
- Using TypeScript for all new code with proper type definitions
- Following Next.js app directory structure for routing
- Implementing responsive design with mobile-first approach
- Leveraging Shadcn UI components for consistent UI elements
- **Using React functional components with `useState` hook for managing component-level state (e.g., form inputs, loading status, tech stack).**
- Using Firebase for authentication and data persistence
  - Using setDoc with merge:true for updating user profiles
  - Using user.uid as document ID for direct user document access
- Maintaining clean component structure with clear separation of concerns
- Implementing nested try/catch blocks for graceful error handling in authentication flows

## Learnings and Project Insights
- Gemini API performs best with specific context about the job role and experience level
- User flow needs to balance authenticity of interview experience with helpful guidance
- Firebase integration works well for authentication but requires careful schema design
  - Firestore security rules are essential to prevent unauthorized access
  - The difference between setDoc and addDoc is important:
    - setDoc is used when we need a specific document ID (like user.uid)
    - addDoc automatically generates a unique ID and is better for collections of items
  - Collections are created automatically when documents are added
- Next.js server components provide performance benefits for static content
- Clear separation between client and server components is essential for proper hydration