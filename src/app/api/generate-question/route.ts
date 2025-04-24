import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Define the types for request body
type RequestBody = {
    jobRole?: string;
    experience?: string;
    category?: string;
    count?: number;
};

export async function POST(req: Request) {
    try {
        // Parse request body
        const { jobRole, count, category, experience}: RequestBody = await req.json();

        const prompt = `Generate ${count} realistic interview ${category} question for a ${experience} ${jobRole} position. 
                        Make sure the questions are challenging but appropriate for the experience level.`;

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