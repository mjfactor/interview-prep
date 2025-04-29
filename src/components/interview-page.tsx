"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, PhoneOff } from 'lucide-react'; // Import Mic and PhoneOff icons
import { vapi } from '@/lib/aivapi.sdk';
import { db, doc, getDoc, Timestamp } from '@/lib/firebase'; // Import necessary firebase functions


// Define an interface for the interview data structure
interface InterviewData {
    jobRole: string;
    experience: string;
    category: string;
    techStack: string[];
    questions: string[];
    createdAt: Timestamp; 
    uid: string;
}

export default function InterviewPage({ id }: { id: string }) {

    const [isCalling, setIsCalling] = useState(false);
    const [statusMessage, setStatusMessage] = useState("Loading interview details...");
    const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Add loading state

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
                }
            } catch (error) {
                console.error("Error fetching interview data:", error);
                setStatusMessage("Error loading interview details.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchInterviewData();
    }, [id]); // Dependency array includes id

    // Setup Vapi event listeners
    useEffect(() => {
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
        };

        vapi.on("call-start", handleCallStart);
        vapi.on("call-end", handleCallEnd);
        vapi.on("error", handleError);

        // Cleanup listeners on component unmount
        return () => {
            vapi.off("call-start", handleCallStart);
            vapi.off("call-end", handleCallEnd);
            vapi.off("error", handleError);
        };
    }, []); // Keep this separate, runs only once

    const startInterview = async () => {
        if (isCalling || isLoading || !interviewData) return; // Prevent starting if loading, already calling, or no data
        setStatusMessage("Starting call...");
        try {
            // Construct the system prompt using fetched data
            const systemPrompt = `You are an AI interviewer named Lily conducting a practice interview for a ${interviewData.experience} ${interviewData.jobRole} position.
            The interview focuses on ${interviewData.category} topics, specifically related to the following technologies: ${interviewData.techStack.join(', ')}.
            Start by introducing yourself briefly.
            Then, ask the candidate the following questions one by one, waiting for their response before moving to the next:
            ${interviewData.questions.map((q, index) => `${index + 1}. ${q}`).join('\n')}
            Keep the conversation natural and provide brief feedback or follow-up questions if appropriate, but primarily focus on asking the prepared questions.
            Conclude the interview after the last question.`;

            await vapi.start({
                name: "Lily",
                firstMessage: "Hello! I'm Lily, your AI interviewer. Ready to begin?", // Adjusted first message
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
                    provider: "google", // Changed provider back if needed, or keep openai
                    model: "gemini-1.5-flash", // Or your preferred model like gpt-4o-mini
                    messages: [
                        {
                            role: "system",
                            content: systemPrompt, // Use the dynamically generated prompt
                        },
                    ],
                },
            });

        } catch (error) {
            console.error("Failed to start Vapi call:", error);
            setIsCalling(false); // Reset state on failure
            setStatusMessage("Failed to start the call. Please try again.");
        }
    }

    const stopInterview = () => {
        if (!isCalling) return;
        setStatusMessage("Stopping call...");
        vapi.stop(); // The 'call-end' event will handle state changes
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-slate-800">
            <Card className="w-full max-w-md shadow-lg rounded-xl border-0">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold text-gray-800 dark:text-white">AI Interview Practice</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-6 pt-1 pb-8"> {/* Added padding */}
                    {/* Microphone/Stop Button */}
                    <Button
                        variant="outline"
                        size="icon"
                        className={`rounded-full w-20 h-20 border-2 transition-colors duration-200 shadow-md ${isCalling
                            ? "border-red-500 text-red-500 hover:bg-red-100 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-900"
                            : "border-blue-500 text-blue-500 hover:bg-blue-100 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900"
                            }`}
                        onClick={isCalling ? stopInterview : startInterview}
                        disabled={isLoading || (!isCalling && statusMessage === "Starting call...") || (!interviewData && !isLoading)} // Disable if loading, starting, or no data
                    >
                        {isCalling ? <PhoneOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />} {/* Toggle icon */}
                        <span className="sr-only">{isCalling ? "Stop Interview" : "Start Interview"}</span> {/* Accessibility */}
                    </Button>
                    <p className="text-center text-gray-600 dark:text-gray-300">{statusMessage}</p>
                </CardContent>
            </Card>
        </div>
    )
}

