# Technical Context

## Technologies Used

### Frontend
- **Next.js**: v14 with App Router for server and client components
- **React**: Core UI library leveraging hooks and functional components
- **TypeScript**: For type safety and developer experience
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Shadcn UI**: Component library built on Radix UI primitives

### Backend
- **Next.js API Routes**: For serverless API endpoints
- **Firebase**: For authentication, database, and storage
  - Firestore: NoSQL database for storing user data and interview questions
  - Firebase Authentication: For user management
  - Firebase Storage: For storing media assets (if needed)

### AI/ML
- **Gemini API**: Google's LLM for generating interview questions and analyzing responses

### Development Tools
- **pnpm**: For package management with better dependency handling
- **ESLint**: For code quality and consistency
- **Prettier**: For code formatting
- **Git**: For version control

## Development Setup
1. **Environment Setup**:
   - Node.js >= 18.x
   - pnpm as package manager
   - Firebase project configuration
   - Gemini API key

2. **Local Development**:
   - `pnpm install`: Install dependencies
   - `pnpm dev`: Run development server
   - `pnpm build`: Build production version
   - `pnpm lint`: Run linting

3. **Environment Variables**:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`: Firebase configuration
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Firebase configuration
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Firebase configuration
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Firebase configuration
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Firebase configuration
   - `NEXT_PUBLIC_FIREBASE_APP_ID`: Firebase configuration
   - `GEMINI_API_KEY`: For AI integration

## Technical Constraints
- **Browser Compatibility**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Responsiveness**: Must work on mobile, tablet, and desktop viewports
- **Accessibility**: WCAG compliance for accessibility
- **Performance**: Core Web Vitals optimization
- **Security**: Authentication and data protection best practices

## Dependencies
- **Core Dependencies**:
  - next
  - react
  - react-dom
  - typescript
  - tailwindcss
  - firebase
  - @google/generative-ai (Gemini)

- **UI Dependencies**:
  - shadcn/ui components
  - class-variance-authority
  - clsx
  - tailwind-merge
  - lucide-react (icons)

- **Development Dependencies**:
  - eslint
  - prettier
  - typescript
  - postcss
  - autoprefixer

## Tool Usage Patterns
- **Next.js App Router**: File-based routing with app directory structure
- **Firebase SDK Patterns**: Direct integration for authentication and database operations
- **Tailwind Utility Classes**: Composition of utility classes for styling
- **Component Composition**: Building pages from reusable Shadcn UI components
- **API Route Patterns**: RESTful endpoints for backend operations
- **TypeScript Types**: Strong typing for components, API responses, and state