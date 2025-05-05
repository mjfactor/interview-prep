import Vapi from "@vapi-ai/web";
import { db, doc, getDoc } from "./firebase";

// Function to validate if a Vapi API key is valid
export async function validateVapiKey(apiKey: string): Promise<boolean> {
    if (!apiKey || apiKey.trim() === "") {
        return false;
    }

    try {
        // Attempt to create a new Vapi instance with the API key
        const vapi = new Vapi(apiKey);

        // If no error is thrown, the key format is valid
        // Note: This doesn't guarantee the key has permissions, just that it's in valid format
        return true;
    } catch (error) {
        console.error("Vapi API key validation failed:", error);
        return false;
    }
}

// Create a function to initialize Vapi with user's API key
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
                return new Vapi(apiKey);
            }
        }

        // Throw error if API key not found in Firebase
        throw new Error("Vapi API key not found. Please add it in your settings.");
    } catch (error) {
        // Re-throw the error to be handled by the component
        throw error;
    }
}


