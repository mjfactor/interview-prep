# Interview Prep

## Project Tech Stack
When working on this interview preparation project, always adhere to the following technology stack and guidelines:

1.  **React** - Use React for building user interfaces.
    - Documentation: [https://react.dev/](https://react.dev/)
    - Follow modern React patterns (Hooks, Context API).

2.  **Next.js** - Use Next.js with the App Router
    - Documentation: [https://nextjs.org/docs](https://nextjs.org/docs)
    - Always leverage React Server Components (RSCs) where appropriate
    - Follow best practices for routing and data fetching

3.  **TypeScript**
    - Documentation: [https://www.typescriptlang.org/docs/](https://www.typescriptlang.org/docs/)
    - Maintain strict type checking
    - Use proper interfaces and type definitions

4.  **Tailwind CSS**
    - Documentation: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
    - Use utility classes consistently
    - Leverage the tailwind-merge library for conditional classes

5.  **shadcn/ui**
    - Documentation: [https://ui.shadcn.com/docs](https://ui.shadcn.com/docs)
    - Install components using the shadcn CLI
    - Customize components as needed while maintaining accessibility

6.  **Vercel AI SDK**
    - Documentation: [https://sdk.vercel.ai/docs](https://sdk.vercel.ai/docs)
    - Check useChat and streamtext docs at [useChat](https://sdk.vercel.ai/docs/reference/ai-sdk-ui/use-chat) and [streamtext] (https://sdk.vercel.ai/docs/reference/ai-sdk-core/stream-text)
    - Check useObject and streamobject docs at [useObject](https://sdk.vercel.ai/docs/reference/ai-sdk-ui/use-object) and [streamobject](https://sdk.vercel.ai/docs/reference/ai-sdk-core/stream-object)
    - Stay updated with the latest AI SDK features and best practices

7.  **Firebase**
    - Documentation: [https://firebase.google.com/docs](https://firebase.google.com/docs)
    - Use Firebase SDK v10+ for web
    - Implement proper authentication and security rules
    - Consider Firestore for real-time data needs

## Important Development Guidelines
- **ALWAYS use pnpm** for package management
- **ALWAYS check Vercel AI SDK documentation** for latest APIs and patterns
- Prioritize performance and accessibility in all implementations
- Implement responsive designs that work across devices
- Write clean, maintainable, and well-documented code
- Stay current with version updates for all libraries
- Use Async/await with try/catch instead of callback hell
- Always use Best Practice

## Project Setup
When installing new packages:
```bash
pnpm add [package-name]
```

For development dependencies:
```bash
pnpm add -D [package-name]
```

## Documentation References
Always refer to official documentation for best practices and latest features:
- Next.js: [https://nextjs.org/docs](https://nextjs.org/docs)
- TypeScript: [https://www.typescriptlang.org/docs/](https://www.typescriptlang.org/docs/)
- Tailwind CSS: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
- shadcn/ui: [https://ui.shadcn.com/docs](https://ui.shadcn.com/docs)
- Vercel AI SDK: [https://sdk.vercel.ai/docs](https://sdk.vercel.ai/docs)
- Firebase: [https://firebase.google.com/docs](https://firebase.google.com/docs)
