import Vapi from "@vapi-ai/web";
import { db, doc, getDoc } from "./firebase";

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


