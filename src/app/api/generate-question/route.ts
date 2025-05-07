import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { db, doc, getDoc } from '@/lib/firebase';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Define the types for request body
type RequestBody = {
    name?: string;
    jobRole?: string;
    experience?: string;
    category?: string;
    count?: number;
    techStack?: string[];
    userId?: string
};

export async function POST(req: Request) {
    try {
        // Parse request body 
        const { jobRole, count, category, experience, techStack, userId }: RequestBody = await req.json();

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

        const prompt = `Generate ${count || 3} realistic interview ${category || 'technical'} questions based on the tech stack: ${techStack?.join(', ')} for a ${experience || 'Mid-level'} ${jobRole || 'Software Developer'} position. 
                     IMPORTANT: These questions are for voice interview practice only, so do NOT include interactive tasks like "create a function", "write code", or "draw a diagram". Focus on questions that can be answered verbally.`;

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