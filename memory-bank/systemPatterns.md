# System Patterns

## System Architecture
The Interview Prep application follows a modern web application architecture with the following key components:

1. **Frontend Layer**: Next.js-based UI with server and client components
2. **API Layer**: Backend API routes for handling data requests and LLM integration
3. **Database Layer**: Firebase for data persistence and user management
4. **AI Integration Layer**: Gemini API for question generation and response evaluation

## Key Technical Decisions
- **Next.js Framework**: Chosen for its server-side rendering capabilities, API routes, and modern React patterns
- **Firebase Integration**: Selected for ease of setup, authentication services, and real-time database capabilities
- **Gemini LLM**: Preferred for question generation due to its strong contextual understanding and prompt following
- **ShadCN UI**: Adopted for consistent design language with minimal configuration

## Design Patterns in Use
- **Page-based Routing**: Next.js routing structure with app directory for clear navigation paths
- **Server Components**: Leveraging Next.js server components for improved performance
- **Authentication Pattern**: Firebase authentication with protected routes
- **API Route Pattern**: Backend functionality exposed through Next.js API routes
- **Component Composition**: UI built from composable Shadcn UI components
- **Repository Pattern**: Abstracting data access through service layers

## Component Relationships
```
Client UI <-> Next.js Server Components <-> API Routes <-> Firebase
                                         <-> Gemini API
```

- User interactions trigger client-side state changes
- Data persistence operations handled through Firebase SDK
- Question generation and evaluation processed through Gemini API
- Authentication state managed through Firebase Auth

## Critical Implementation Paths
1. **Authentication Flow**: 
   - User registration/login → Firebase Auth → Protected routes
   
2. **Question Generation Flow**:
   - User preferences → API route → Gemini LLM → Formatted questions → UI presentation
   
3. **Practice Session Flow**:
   - Question display → User response → Optional evaluation → Progress tracking
   
4. **Data Persistence Flow**:
   - User actions → State updates → Firebase writes → Data synchronization