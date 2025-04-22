import { google } from '@ai-sdk/google';
import { streamText, generateText, generateObject } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = streamText({
        model: google('gemini-2.0-flash-lite'),
        messages,
    });
    
    return result.toDataStreamResponse();
}