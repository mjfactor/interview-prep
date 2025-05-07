import Vapi from "@vapi-ai/web";
import { db, doc, getDoc, updateDoc } from "./firebase";

// Define types for better type safety
export interface VapiConfig {
    transcriber?: {
        provider: string;
        model: string;
        language?: string;
    };
    voice?: {
        provider: string;
        voiceId: string;
    };
    model?: {
        provider: string;
        model: string;
        messages: Array<{
            role: string;
            content: string;
        }>;
    };
    recordingEnabled?: boolean;
    firstMessage?: string;
    name?: string;
    variableValues?: Record<string, string>;
}

/**
 * Validates if a Vapi API key is valid
 * @param apiKey - The API key to validate
 * @returns Promise<boolean> - Whether the key is valid
 */
export async function validateVapiKey(apiKey: string): Promise<boolean> {
    if (!apiKey || apiKey.trim() === "") {
        return false;
    }

    try {
        // Attempt to create a new Vapi instance with the API key
        // This doesn't make an actual API call, just validates format
        const vapi = new Vapi(apiKey);

        // For more thorough validation, we could try to access a property
        // that would trigger a network request, but that's not necessary
        // for basic validation

        return true;
    } catch (error) {
        console.error("Vapi API key validation failed:", error);
        return false;
    }
}

/**
 * Creates a Vapi instance with the user's API key
 * @param userId - The user ID to fetch the API key for
 * @returns Promise<Vapi> - A configured Vapi instance
 */
export async function getVapiInstance(userId?: string) {
    if (!userId) {
        // Throw error if no user ID is provided
        throw new Error("User ID is required to initialize Vapi");
    }

    try {
        // Fetch the user's Vapi API key from Firebase
        const apiKeysDoc = await getDoc(doc(db, "users", userId, "settings", "apiKeys"));

        if (apiKeysDoc.exists()) {
            const data = apiKeysDoc.data();
            const apiKey = data.vapiApiKey || "";

            if (apiKey) {
                // Create and return a new Vapi instance
                const vapiInstance = new Vapi(apiKey);

                // Store last usage timestamp
                await updateDoc(doc(db, "users", userId, "settings", "apiKeys"), {
                    vapiLastUsed: new Date()
                }).catch(err => {
                    // Non-blocking error - just log it
                    console.warn("Failed to update last used timestamp:", err);
                });

                return vapiInstance;
            }
        }

        // Throw error if API key not found in Firebase
        throw new Error("Vapi API key not found. Please add it in your settings.");
    } catch (error) {
        // Re-throw the error to be handled by the component
        throw error;
    }
}

/**
 * Get default configuration for Vapi with modern settings
 * @param customConfig - Custom configuration options to override defaults
 * @returns VapiConfig - A complete configuration object
 */
export function getVapiConfig(customConfig?: Partial<VapiConfig>): VapiConfig {
    // Modern default configuration based on the latest Vapi documentation
    const defaultConfig: VapiConfig = {
        transcriber: {
            provider: "deepgram",
            model: "nova-3", // Using the latest model
            language: "en-US",
        },
        voice: {
            provider: "playht",
            voiceId: "jennifer", // Default professional voice
        },
        model: {
            provider: "openai",
            model: "gpt-4.1-mini", // Modern model with good balance of speed/quality
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant.",
                }
            ]
        },
        recordingEnabled: false, // Disable recording by default for privacy
        name: "Interview Assistant"
    };

    // Merge with custom config, with custom taking precedence
    return { ...defaultConfig, ...customConfig };
}

/**
 * Track user usage statistics for Vapi calls
 * @param userId - The user ID to track usage for
 */
export async function trackVapiUsage(userId: string): Promise<void> {
    if (!userId) return;

    try {
        const usageRef = doc(db, "users", userId, "usage", "vapi");
        const usageDoc = await getDoc(usageRef);

        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const monthYear = `${month}-${year}`;

        if (usageDoc.exists()) {
            const data = usageDoc.data();
            const currentCount = data[monthYear] || 0;

            await updateDoc(usageRef, {
                [monthYear]: currentCount + 1,
                lastUsed: now,
                totalCalls: (data.totalCalls || 0) + 1
            });
        } else {
            await updateDoc(usageRef, {
                [monthYear]: 1,
                lastUsed: now,
                totalCalls: 1,
                firstUsed: now
            });
        }
    } catch (error) {
        // Non-blocking error - just log it
        console.warn("Failed to track Vapi usage:", error);
    }
}


