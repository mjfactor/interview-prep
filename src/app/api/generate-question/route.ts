import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { db, doc, getDoc } from '@/lib/firebase';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Define the types for request body
type RequestBody = {
    jobRole?: string;
    experience?: string;
    userId?: string
};

export async function POST(req: Request) {
    try {
        // Parse request body 
        const { jobRole, experience, userId }: RequestBody = await req.json();

        // Get the user's Google API key from Firebase if userId is provided
        let apiKey = '';
        if (userId) {
            const apiKeysDoc = await getDoc(doc(db, "users", userId, "settings", "apiKeys"));

            if (apiKeysDoc.exists()) {
                const data = apiKeysDoc.data();
                apiKey = data.googleApiKey || '';
            }
        }

        if (!apiKey) {
            return Response.json(
                { error: 'Google API key not found. Please add it in your settings.' },
                { status: 400 }
            );
        }

        // Create custom Google provider with user's API key
        const google = createGoogleGenerativeAI({
            apiKey
        });

        const prompt = `Generate 5 behavioral interview questions for a ${experience || 'Mid-level'} ${jobRole || 'Software Developer'} position. 
                     These questions should be designed for STAR method practice (Situation, Task, Action, Result).
                     Focus on questions that start with "Tell me about a time when..." or "Describe a situation where..." 
                     The questions should cover common workplace scenarios like teamwork, problem-solving, leadership, conflict resolution, and achievements.
                     Make sure the questions are relevant to the experience level and job role specified.`;

        // Use generateObject instead of streamObject for a complete response
        const { object } = await generateObject({
            model: google('gemini-2.0-flash-lite'),
            schemaName: 'InterviewQuestions',
            schemaDescription: 'A collection of interview questions with details',
            schema: z.object({
                questions: z.array(z.string().describe('Interview questions')),
            }),
            prompt,
        });

        return Response.json(object);
    } catch (error) {
        console.error('Error generating interview questions:', error);
        return Response.json(
            { error: 'Failed to generate interview questions' },
            { status: 500 }
        );
    }
}