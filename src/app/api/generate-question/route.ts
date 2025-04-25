import { google } from '@ai-sdk/google';
import { streamObject } from 'ai'; // Changed from generateObject to streamObject
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Define the types for request body
type RequestBody = {
    jobRole?: string;
    experience?: string;
    category?: string;
    count?: number;
    techStack?: string[]; // Fixed the casing to match the client-side
};

export async function POST(req: Request) {
    try {
        // Parse request body
        const { jobRole, count, category, experience, techStack }: RequestBody = await req.json();

        const prompt = `Generate ${count || 3} realistic interview ${category || 'technical'} questions based on the tech stack: ${techStack?.join(', ')} for a ${experience || 'Mid-level'} ${jobRole || 'Software Developer'} position. 
                        Make sure the questions are challenging but appropriate for the experience level.`;

        // Use streamObject instead of generateObject for streaming responses
        const result = streamObject({
            model: google('gemini-2.0-flash-lite'),
            schemaName: 'InterviewQuestions',
            schemaDescription: 'A collection of interview questions with details',
            schema: z.object({
                questions: z.array(z.string().describe('Interview questions')),
            }),
            prompt,
        });

        // Return a streaming response
        return result.toTextStreamResponse();
    } catch (error) {
        console.error('Error generating interview questions:', error);
        return Response.json(
            { error: 'Failed to generate interview questions' },
            { status: 500 }
        );
    }
}