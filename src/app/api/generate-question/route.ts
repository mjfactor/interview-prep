import { google } from '@ai-sdk/google';
import { generateObject } from 'ai'; // Changed back to generateObject
import { z } from 'zod';
import { db, collection, addDoc, serverTimestamp } from '@/lib/fireabase';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Define the types for request body
type RequestBody = {
    jobRole?: string;
    experience?: string;
    category?: string;
    count?: number;
    techStack?: string[];
    userId: string; // Add userId to identify the current user
};

export async function POST(req: Request) {
    try {
        // Parse request body 
        const { jobRole, count, category, experience, techStack }: RequestBody = await req.json();


        const prompt = `Generate ${count || 3} realistic interview ${category || 'technical'} questions based on the tech stack: ${techStack?.join(', ')} for a ${experience || 'Mid-level'} ${jobRole || 'Software Developer'} position. 
                        Make sure the questions are challenging but appropriate for the experience level.`;

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

        // Store the generated questions and parameters in Firestore
        try {
            const questionData = {
                jobRole: jobRole,
                experience: experience,
                category: category,
                count: count,
                techStack: techStack,
                questions: object.questions,
                createdAt: serverTimestamp(),
            };

            // Add to the interviewQuestions collection
            await addDoc(collection(db, "interviewQuestions"), questionData);

            return Response.json(object)
        } catch (dbError) {
            console.error('Error storing questions in database:', dbError);


        }
    } catch (error) {
        console.error('Error generating interview questions:', error);
        return Response.json(
            { error: 'Failed to generate interview questions' },
            { status: 500 }
        );
    }
}