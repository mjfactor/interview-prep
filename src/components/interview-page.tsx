"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, PhoneOff } from 'lucide-react'; // Import Mic and PhoneOff icons
import { toast } from "sonner";
import { getVapiInstance } from '@/lib/aivapi.sdk';
import { db, doc, getDoc, Timestamp } from '@/lib/firebase'; // Import necessary firebase functions
import { useUser } from '@/hooks/firebase-hooks'; // Import useUser hook
import { useRouter } from 'next/navigation';

// Define an interface for the interview data structure
interface InterviewData {
    name: string;
    jobRole: string;
    experience: string;
    category: string;
    techStack: string[];
    questions: string[];
    createdAt: Timestamp;
    uid: string;
}

export default function InterviewPage({ id }: { id: string }) {
    const router = useRouter();
    const { user } = useUser(); // Get current authenticated user
    const [isCalling, setIsCalling] = useState(false);
    const [statusMessage, setStatusMessage] = useState("Loading interview details...");
    const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Add loading state
    const [vapi, setVapi] = useState<any>(null);
    const [vapiLoading, setVapiLoading] = useState(true);

    // Initialize Vapi with user ID when available
    useEffect(() => {
        const initializeVapi = async () => {
            try {
                setVapiLoading(true);
                const instance = await getVapiInstance(user?.uid);
                setVapi(instance);
            } catch (error) {
                console.error("Error initializing Vapi:", error);

                // Show toast notification for API key errors
                if (error instanceof Error) {
                    if (error.message.includes('Vapi API key not found')) {
                        toast.error('Vapi API key not found', {
                            description: 'Please add your Vapi API key in settings to use the interview feature.',
                            action: {
                                label: 'Settings',
                                onClick: () => router.push('/dashboard/api-keys')
                            }
                        });
                    } else if (error.message.includes('User ID is required')) {
                        toast.error('Authentication required', {
                            description: 'Please sign in to use the interview feature.'
                        });
                    } else {
                        toast.error('Failed to initialize Vapi', {
                            description: 'An error occurred while setting up the interview system.'
                        });
                    }
                }
            } finally {
                setVapiLoading(false);
            }
        };

        initializeVapi();
    }, [user?.uid, router]); // Re-initialize if user changes

    // Fetch interview data from Firestore
    useEffect(() => {
        const fetchInterviewData = async () => {
            if (!id) {
                setStatusMessage("Error: No interview ID provided.");
                setIsLoading(false);
                return;
            }
            try {
                const docRef = doc(db, "interviewQuestions", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setInterviewData(docSnap.data() as InterviewData);
                    setStatusMessage("Press the microphone to start your interview.");
                } else {
                    console.error("No such document!");
                    setStatusMessage("Error: Interview not found.");
                    toast.error('Interview not found', {
                        description: 'The requested interview could not be found.'
                    });
                }
            } catch (error) {
                console.error("Error fetching interview data:", error);
                setStatusMessage("Error loading interview details.");
                toast.error('Failed to load interview', {
                    description: 'There was a problem loading the interview data.'
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

            toast.error('Interview error', {
                description: 'An error occurred during the interview. Please try again.'
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
            const systemPrompt = `You are a interviewer named Eubert from a certain company conducting a practice for a ${interviewData.experience} ${interviewData.jobRole} position.
            The interview focuses on ${interviewData.category} topics, specifically related to the following technologies: ${interviewData.techStack.join(', ')}.
            Start by introducing yourself briefly. Then, layout the users inputted information and explain the interview process.
            Then, ask the candidate the following questions one by one, waiting for their response before moving to the next:
            ${interviewData.questions.map((q, index) => `${index + 1}. ${q}`).join('\n')}
            Keep the conversation natural and provide brief feedback or follow-up questions if appropriate, but primarily focus on asking the prepared questions.
            Conclude the interview after the last question.`;

            await vapi.start({
                name: "Lily",
                firstMessage: `Hello ${interviewData.name}! I'm Lily, your interviewer for Today. Ready to begin?`, // Adjusted first message
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

            toast.error('Failed to start interview', {
                description: 'Could not start the interview. Please try again.'
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
                        <CardTitle className="text-center text-2xl font-bold text-gray-800 dark:text-white">AI Interview Practice</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center space-y-6 pt-1 pb-8">
                        <p className="text-center text-gray-600 dark:text-gray-300">Initializing interview system...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center pt-40">
            <Card className="w-full max-w-md shadow-lg rounded-xl border-0">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold text-gray-800 dark:text-white">AI Interview Practice</CardTitle>
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
                        <span className="sr-only">{isCalling ? "Stop Interview" : "Start Interview"}</span>
                    </Button>
                    <p className="text-center text-gray-600 dark:text-gray-300">{statusMessage}</p>
                </CardContent>
            </Card>
        </div>
    )
}

