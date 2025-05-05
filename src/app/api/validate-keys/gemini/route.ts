import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

/**
 * API route for validating Google Gemini API keys
 * POST endpoint that accepts an API key and validates it by making a minimal request
 */
export async function POST(req: Request) {
    try {
        // Get API key from request body
        const { apiKey } = await req.json();

        // Handle missing API key
        if (!apiKey || apiKey.trim() === '') {
            return Response.json(
                { valid: false, error: 'API key is required' },
                { status: 400 }
            );
        }

        // Create a custom Google provider instance with the API key
        const google = createGoogleGenerativeAI({
            apiKey
        });

        // Try to generate a minimal text response to verify API key
        // Using minimal tokens to reduce unnecessary usage
        await generateText({
            model: google('gemini-1.5-flash'),
            prompt: 'test',
            maxTokens: 1,
        });

        // If we got here without errors, the key is valid
        return Response.json({ valid: true });
    } catch (error) {
        console.error('Google Gemini API key validation failed:', error);

        // Extract relevant error message if possible
        let errorMessage = 'Invalid API key';
        if (error instanceof Error) {
            errorMessage = error.message;
        }

        return Response.json(
            { valid: false, error: errorMessage },
            { status: 401 }
        );
    }
}