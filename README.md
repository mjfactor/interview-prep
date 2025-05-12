# InterviewPrep AI 🚀

An intelligent interview preparation platform powered by AI to help job seekers practice and ace their technical interviews.

![InterviewPrep AI](./public/preview.svg)

## 🌟 Features

- **AI-Generated Interview Questions**: Generate realistic interview questions based on job role, experience level, and tech stack
- **Multiple Question Categories**: Technical, behavioral, critical thinking, and leadership questions
- **Experience Level Targeting**: Tailor questions to different career stages (entry-level to manager)
- **Tech Stack Customization**: Specify technologies relevant to your job search
- **Voice Interview Practice**: Practice answering interview questions verbally with our intelligent voice assistant
- **Question Management**: Save, organize, and review your practice questions
- **Responsive Design**: Seamless experience across desktop and mobile devices
- **Dark Mode Support**: Comfortable UI for day and night use

## 💻 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: Radix UI, Tailwind CSS 4
- **Deployment**: Vercel
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **AI Integration**: Google Gemini via AI SDK
- **Voice Features**: Vapi AI Web SDK
- **Analytics**: Vercel Analytics

## 🚀 Getting Started

### Live Demo

Check out the live application: [InterviewPrep AI](https://prep-interview-vapi.vercel.app/)

### Prerequisites

Before running the project, make sure you have the following installed:

- Node.js (v18.0.0 or later)
- pnpm (v8.0.0 or later)
- A Google Gemini API key for AI features
- Firebase project credentials

### Environment Variables Setup

Create a `.env.local` file in the root directory with the necessary environment variables. Contact project administrators for the required values.

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/interview-prep.git
   cd interview-prep
   ```

2. Install dependencies
   ```bash
   pnpm install
   ```

3. Run the development server
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application

## 📋 Project Structure

```
src/
├── app/                     # Next.js app directory
│   ├── (auth)/              # Authentication pages
│   ├── api/                 # API routes
│   │   ├── generate-question/  # Question generation endpoint
│   │   ├── og/              # Open Graph image generation
│   │   └── validate-keys/   # API key validation endpoints
│   └── dashboard/           # Protected dashboard pages
│       ├── api-keys/        # API key management
│       ├── generate-question-page/  # Question generation interface
│       ├── interview-generated/     # Generated questions display
│       └── interview-page/   # Interview practice interface
├── components/              # Reusable UI components
│   ├── ui/                  # Base UI components
│   └── ...                  # Application-specific components
├── hooks/                   # Custom React hooks
├── lib/                     # Utility functions and services
│   ├── auth/                # Authentication utilities
│   ├── firebase.ts          # Firebase configuration
│   └── ...                  # Other utilities
└── ...
```

## 🛠️ API Integration

### Google Gemini API

1. Obtain a Google Gemini API key from [Google AI Studio](https://ai.google.dev/)
2. Add your API key in the dashboard's API keys section to enable AI question generation

### Voice Integration

Voice practice capabilities are fully implemented using the Vapi AI Web SDK:
1. Get your Vapi API key from [Vapi.ai](https://vapi.ai/)
2. Add your API key in the settings section to enable voice interview practice
3. Practice answering interview questions verbally with our intelligent voice assistant

## 🔒 Authentication

This project uses Firebase Authentication with the following providers:
- Google Sign-In
- Email/Password (planned)

## 🧩 Main Components

- **Question Generator**: Customizable interface to generate relevant interview questions
- **Practice Interface**: Tools for practicing and reviewing interview questions
- **API Key Management**: Secure storage and management of user API keys
- **Dashboard**: Central hub for accessing all features

## 📱 Responsive Design

The application is built with a mobile-first approach, ensuring a seamless experience across:
- Desktop
- Tablet
- Mobile

## 🌙 Theming

The application supports both light and dark themes using `next-themes`, automatically respecting user system preferences.

## ⚡ Performance and Best Practices

### Performance Optimization
- **Server-side Rendering**: Utilizes Next.js SSR for improved initial load times
- **Component Lazy-Loading**: Components are loaded only when needed
- **Image Optimization**: Images are automatically optimized using Next.js Image component
- **Bundle Size Management**: Code splitting to minimize bundle sizes

### Code Quality
- TypeScript for type safety
- ESLint configured for code quality enforcement
- Prettier for consistent code formatting
- Husky pre-commit hooks for code quality checks

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- WCAG 2.1 compliance guidelines
- Proper contrast ratios for text readability

## 📚 Developer Documentation

### Architecture Overview

InterviewPrep AI follows a modern web application architecture with:

- **App Router**: Built with Next.js 15's App Router for enhanced routing and layouts
- **Server Components**: Leverages React Server Components for improved performance
- **Client Components**: Uses React Client Components for interactive UI elements
- **API Routes**: REST API implemented with Next.js API routes

### State Management

- React's built-in state management (useState, useContext)
- Custom hooks for shared logic
- Server state with React Query for data fetching and caching

### Database Schema

The application uses Firebase Firestore with the following collections:

- **users**: User profiles and preferences
- **questions**: Saved interview questions
- **attempts**: User practice attempts
- **apiKeys**: User's stored API keys (encrypted)

### Testing Strategy

The project follows a comprehensive testing strategy:

- **Unit Tests**: Component and utility function tests with Jest and React Testing Library
- **Integration Tests**: API and feature integration tests
- **End-to-End Tests**: User flow tests with Playwright
- **Accessibility Tests**: A11y testing with axe-core

### CI/CD Pipeline

Continuous integration and deployment is handled through:

- GitHub Actions for CI
- Vercel for CD with automatic previews for PRs
- Automated testing on push

## 🔄 Roadmap

Future planned features include:

- **Enhanced Voice Interview Mode**: Advanced voice interview features with AI feedback
- **Mock Video Interviews**: Simulated video interview experience
- **Interview Analytics**: Performance metrics and improvement suggestions
- **Interview Coaching**: AI-powered feedback on interview responses
- **Resume Analysis**: AI-powered resume review and suggestions
- **Interview Scheduling**: Tools to schedule mock interviews with peers

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/) - React framework
- [Radix UI](https://www.radix-ui.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Firebase](https://firebase.google.com/) - Authentication and database
- [Google AI](https://ai.google.dev/) - AI capabilities
- [Vapi AI](https://vapi.ai/) - Voice AI SDK
