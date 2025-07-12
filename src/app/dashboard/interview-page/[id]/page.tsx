"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, PhoneOff } from 'lucide-react'; // Import Mic and PhoneOff icons
import { toast } from "sonner";
import { getVapiInstance } from '@/lib/aivapi.sdk';
import { db, doc, getDoc, Timestamp } from '@/lib/firebase'; // Import necessary firebase functions
import { useUser } from '@/hooks/firebase-hooks'; // Import useUser hook
import { useParams, useRouter } from 'next/navigation';

// Define an interface for the practice session data structure
interface InterviewData {
    name: string;
    jobRole: string;
    experience: string;
    questions: string[];
    createdAt: Timestamp;
    uid: string;
    type?: string; // Optional field for backward compatibility
}

export default function InterviewPage() {
    const { id }: { id: string } = useParams(); // Get the interview ID from the URL parameters
    const router = useRouter();
    const { user } = useUser(); // Get current authenticated user
    const [isCalling, setIsCalling] = useState(false);
    const [statusMessage, setStatusMessage] = useState("Loading practice session details...");
    const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Add loading state
    const [vapi, setVapi] = useState<any>(null);
    const [vapiLoading, setVapiLoading] = useState(true);

    // Initialize Vapi with user ID when available
    useEffect(() => {
        const initializeVapi = async () => {
            try {
                setVapiLoading(true);

                // Only attempt to initialize Vapi if the user exists and has a uid
                if (user && user.uid) {
                    const instance = await getVapiInstance(user.uid);
                    setVapi(instance);
                } else {
                    // We're still waiting for auth state or user isn't logged in
                    console.log("Waiting for user authentication state...");
                }
            } catch (error) {
                console.error("Error initializing Vapi:", error);

                // Show toast notification for API key errors
                if (error instanceof Error) {
                    if (error.message.includes('Vapi API key not found')) {
                        toast.error('Vapi API key not found', {
                            description: 'Please add your Vapi API key in settings to use the practice session feature.',
                            action: {
                                label: 'Settings',
                                onClick: () => router.push('/dashboard/api-keys')
                            }
                        });
                    } else {
                        toast.error('Failed to initialize Vapi', {
                            description: 'An error occurred while setting up the interview system. Check your API key and try again.',
                        });
                    }
                }
            } finally {
                setVapiLoading(false);
            }
        };

        initializeVapi();
    }, [user, router]); // Listen to user object changes, not just user?.uid

    // Fetch interview data from Firestore
    useEffect(() => {
        const fetchInterviewData = async () => {
            if (!id) {
                setStatusMessage("Error: No practice session ID provided.");
                setIsLoading(false);
                return;
            }
            try {
                const docRef = doc(db, "interviewData", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setInterviewData(docSnap.data() as InterviewData);
                    setStatusMessage("Press the microphone to start your practice session.");
                } else {
                    console.error("No such document!");
                    setStatusMessage("Error: Practice session not found.");
                    toast.error('Practice session not found', {
                        description: 'The requested practice session could not be found.'
                    });
                }
            } catch (error) {
                console.error("Error fetching practice session data:", error);
                setStatusMessage("Error loading practice session details.");
                toast.error('Failed to load practice session', {
                    description: 'There was a problem loading the practice session data.'
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchInterviewData();
    }, [id]); // Dependency array includes id

    // Setup Vapi event listeners when vapi is available
    useEffect(() => {
        // Skip if vapi is not initialized yet
        if (!vapi) return;

        const handleCallStart = () => {
            setIsCalling(true);
            setStatusMessage("Call started. Connecting...");
            console.log("Call has started.");
        };

        const handleCallEnd = () => {
            setIsCalling(false);
            setStatusMessage("Call ended. Press the microphone to start again.");
            console.log("Call has ended.");
        };

        const handleError = (e: unknown) => {
            setIsCalling(false);
            setStatusMessage("An error occurred. Please try again.");
            console.error("Vapi error:", e);

            toast.error('Practice session error', {
                description: 'An error occurred during the practice session. Please try again.'
            });
        };

        vapi.on("call-start", handleCallStart);
        vapi.on("call-end", handleCallEnd);
        vapi.on("error", handleError);

        // Cleanup listeners on component unmount or when vapi changes
        return () => {
            vapi.off("call-start", handleCallStart);
            vapi.off("call-end", handleCallEnd);
            vapi.off("error", handleError);
        };
    }, [vapi]); // Only run when vapi changes

    const startInterview = async () => {
        if (isCalling || isLoading || !interviewData || !vapi || vapiLoading) return;
        setStatusMessage("Starting call...");
        try {
            // Construct the system prompt using fetched data
            const systemPrompt = `You are a behavioral interview coach named Eubert helping candidates practice for a ${interviewData.experience} ${interviewData.jobRole} position.
            Your role is to guide the candidate through behavioral questions using the STAR method (Situation, Task, Action, Result).
            Start by introducing yourself briefly and explaining the STAR method format.
            Then, ask the candidate the following behavioral questions one by one, waiting for their response before moving to the next:
            ${interviewData.questions.map((q, index) => `${index + 1}. ${q}`).join('\n')}
            After each response, provide brief feedback on how well they followed the STAR format and encourage them to elaborate on any missing components.
            Keep the conversation supportive and educational, focusing on helping them improve their behavioral interview skills.
            Conclude the session after the last question with encouragement and summary feedback.`;

            await vapi.start({
                name: "Lily",
                firstMessage: `Hello ${interviewData.name}! I'm Lily, your behavioral interview coach. Ready to practice some STAR method questions?`, // Updated first message
                transcriber: {
                    provider: "deepgram",
                    model: "nova-3",
                    language: "en-US",
                },
                voice: {
                    provider: "vapi",
                    voiceId: "Lily",
                },
                model: {
                    provider: "openai",
                    model: "gpt-4.1-mini",
                    messages: [
                        {
                            role: "system",
                            content: systemPrompt,
                        },
                    ],
                },
            });

        } catch (error) {
            console.error("Failed to start Vapi call:", error);
            setIsCalling(false); // Reset state on failure
            setStatusMessage("Failed to start the call. Please try again.");

            toast.error('Failed to start practice session', {
                description: 'Could not start the practice session. Please try again.'
            });
        }
    }

    const stopInterview = () => {
        if (!isCalling || !vapi) return;
        setStatusMessage("Stopping call...");
        vapi.stop(); // The 'call-end' event will handle state changes
    }

    // Show loading state if Vapi is not initialized yet
    if (vapiLoading) {
        return (
            <div className="flex flex-col items-center justify-center pt-40">
                <Card className="w-full max-w-md shadow-lg rounded-xl border-0">
                    <CardHeader>
                        <CardTitle className="text-center text-2xl font-bold text-gray-800 dark:text-white">STAR Method Practice</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center space-y-6 pt-1 pb-8">
                        <p className="text-center text-gray-600 dark:text-gray-300">Initializing practice session system...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center pt-40">
            <Card className="w-full max-w-md shadow-lg rounded-xl border-0">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold text-gray-800 dark:text-white">STAR Method Practice</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-6 pt-1 pb-8">
                    {/* Microphone/Stop Button */}
                    <Button
                        variant="outline"
                        size="icon"
                        className={`rounded-full w-20 h-20 border-2 transition-colors duration-200 shadow-md ${isCalling
                            ? "border-red-500 text-red-500 hover:bg-red-100 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900"
                            : "border-blue-500 text-blue-500 hover:bg-blue-100 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900"
                            }`}
                        onClick={isCalling ? stopInterview : startInterview}
                        disabled={isLoading || (!isCalling && statusMessage === "Starting call...") || (!interviewData && !isLoading) || !vapi}
                    >
                        {isCalling ? <PhoneOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
                        <span className="sr-only">{isCalling ? "Stop Practice Session" : "Start Practice Session"}</span>
                    </Button>
                    <p className="text-center text-gray-600 dark:text-gray-300">{statusMessage}</p>
                </CardContent>
            </Card>
        </div>
    )
}

