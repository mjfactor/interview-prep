"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, PhoneOff, Volume2, Loader2, SkipForward, MessageSquare, Save, VolumeX } from 'lucide-react'; // Import additional icons
import { toast } from "sonner";
import { getVapiInstance, getVapiConfig, trackVapiUsage } from '@/lib/aivapi.sdk';
import { db, doc, getDoc, Timestamp, setDoc } from '@/lib/firebase'; // Added setDoc
import { useUser } from '@/hooks/firebase-hooks';
import { useParams, useRouter } from 'next/navigation';
import { Progress } from "@/components/ui/progress"; // Import Progress component

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

// Define transcript message types
interface TranscriptMessage {
    text: string;
    sender: 'user' | 'assistant';
    timestamp: number;
}

// Add a component for visualizing audio levels
const VolumeVisualizer = ({ level }: { level: number }) => {
    const bars = 5;
    const activeBars = Math.round(level * bars);

    return (
        <div className="flex items-center gap-[2px] h-6">
            {Array.from({ length: bars }).map((_, i) => (
                <div
                    key={i}
                    className={`w-1 rounded-full ${i < activeBars ? 'bg-blue-500 dark:bg-blue-400' : 'bg-gray-300 dark:bg-gray-700'}`}
                    style={{
                        height: `${Math.max(30, (i + 1) * 20)}%`,
                        transition: 'background-color 0.1s ease-in-out'
                    }}
                />
            ))}
        </div>
    );
};

export default function InterviewPage() {
    const { id }: { id: string } = useParams();
    const router = useRouter();
    const { user } = useUser();
    const [isCalling, setIsCalling] = useState(false);
    const [statusMessage, setStatusMessage] = useState("Loading interview details...");
    const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [vapi, setVapi] = useState<any>(null);
    const [vapiLoading, setVapiLoading] = useState(true);

    // New state variables for enhanced interactivity
    const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
    const [partialTranscript, setPartialTranscript] = useState("");
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);
    const [volumeLevel, setVolumeLevel] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showQuestions, setShowQuestions] = useState(false);
    const [savingTranscript, setSavingTranscript] = useState(false);

    // Refs
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    // Function to scroll transcript to bottom
    const scrollToBottom = () => {
        transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

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
                            description: 'Please add your Vapi API key in settings to use the interview feature.',
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
                setStatusMessage("Error: No interview ID provided.");
                setIsLoading(false);
                return;
            }
            try {
                const docRef = doc(db, "interviewData", id);
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

            // Reset transcript when call starts
            setTranscript([]);
            setPartialTranscript("");
        };

        const handleCallEnd = () => {
            setIsCalling(false);
            setStatusMessage("Call ended. Press the microphone to start again.");
            setIsAiSpeaking(false);
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

        // Add handlers for speech events
        const handleSpeechStart = () => {
            setIsAiSpeaking(true);
            console.log("Assistant started speaking");
        };

        const handleSpeechEnd = () => {
            setIsAiSpeaking(false);
            console.log("Assistant stopped speaking");
        };

        // Add handler for volume level events
        const handleVolumeLevel = (level: number) => {
            setVolumeLevel(level);
        };

        // Add handler for transcript messages
        const handleMessage = (message: any) => {
            // Handle transcript messages
            if (message.type === "transcript") {
                const text = message.transcript;

                if (message.transcriptType === "partial") {
                    // Update partial transcript for user's speech
                    setPartialTranscript(text);
                }

                if (message.transcriptType === "final") {
                    // Add final transcript to the history
                    setPartialTranscript("");
                    setTranscript(prev => [...prev, {
                        text,
                        sender: 'user',
                        timestamp: Date.now()
                    }]);
                    // Scroll to the latest message
                    setTimeout(scrollToBottom, 100);
                }
            }

            // Handle AI responses
            if (message.type === "message" && message.message?.role === "assistant") {
                setTranscript(prev => [...prev, {
                    text: message.message.content,
                    sender: 'assistant',
                    timestamp: Date.now()
                }]);
                // Scroll to the latest message
                setTimeout(scrollToBottom, 100);

                // Check for question transitions in the message
                if (interviewData && interviewData.questions) {
                    // Simple heuristic: if the message contains one of the questions, update current question index
                    const nextQuestionIndex = interviewData.questions.findIndex(
                        (question, idx) => idx > currentQuestionIndex && message.message.content.includes(question)
                    );

                    if (nextQuestionIndex > currentQuestionIndex) {
                        setCurrentQuestionIndex(nextQuestionIndex);
                    }
                }
            }
        };

        vapi.on("call-start", handleCallStart);
        vapi.on("call-end", handleCallEnd);
        vapi.on("error", handleError);
        vapi.on("speech-start", handleSpeechStart);
        vapi.on("speech-end", handleSpeechEnd);
        vapi.on("volume-level", handleVolumeLevel);
        vapi.on("message", handleMessage);

        // Cleanup listeners on component unmount or when vapi changes
        return () => {
            vapi.off("call-start", handleCallStart);
            vapi.off("call-end", handleCallEnd);
            vapi.off("error", handleError);
            vapi.off("speech-start", handleSpeechStart);
            vapi.off("speech-end", handleSpeechEnd);
            vapi.off("volume-level", handleVolumeLevel);
            vapi.off("message", handleMessage);
        };
    }, [vapi, interviewData, currentQuestionIndex]); // Update dependencies

    const startInterview = async () => {
        if (isCalling || isLoading || !interviewData || !vapi || vapiLoading) return;
        setStatusMessage("Starting call...");
        try {
            // Track usage for analytics
            if (user?.uid) {
                trackVapiUsage(user.uid).catch(err => console.warn("Failed to track usage:", err));
            }

            // Construct the system prompt using fetched data
            const systemPrompt = `You are a professional interviewer named Lily from a tech company conducting a practice interview for a ${interviewData.experience} ${interviewData.jobRole} position.
            The interview focuses on ${interviewData.category} topics, specifically related to the following technologies: ${interviewData.techStack.join(', ')}.
            Start by introducing yourself briefly, mentioning that this is a practice interview for ${interviewData.name}.
            Then, ask the candidate the following questions one by one, waiting for their response before moving to the next:
            ${interviewData.questions.map((q, index) => `${index + 1}. ${q}`).join('\n')}

            For each response:
            1. Provide brief, constructive feedback about the answer's strengths
            2. Suggest one improvement if appropriate
            3. Wait for acknowledgment before moving to the next question

            Be conversational but professional. Listen carefully to answers and ask follow-up questions if responses are unclear.
            After the final question, summarize the overall interview performance and provide encouragement.`;

            // Get customized Vapi config with our specific settings
            const vapiConfig = getVapiConfig({
                name: "Lily",
                firstMessage: `Hello ${interviewData.name}! I'm Lily, your interviewer today. This practice interview will help you prepare for your ${interviewData.jobRole} role. Are you ready to begin?`,
                transcriber: {
                    provider: "deepgram",
                    model: "nova-3",
                    language: "en-US",
                },
                voice: {
                    provider: "eleven_labs", // Using ElevenLabs for better voice quality
                    voiceId: "Rachel", // Professional female voice
                },
                model: {
                    provider: "openai",
                    model: "gpt-4", // Using GPT-4 for higher quality interview responses
                    messages: [
                        {
                            role: "system",
                            content: systemPrompt,
                        },
                    ],
                },
                recordingEnabled: false, // Ensure no recordings for privacy
            });

            await vapi.start(vapiConfig);

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

    // Function to save transcript for later review
    const saveTranscript = async () => {
        if (!user || !interviewData || transcript.length === 0) return;

        setSavingTranscript(true);
        try {
            // Create a collection for saved transcripts
            const transcriptRef = doc(db, "users", user.uid, "savedTranscripts", id);
            await setDoc(transcriptRef, {
                interviewId: id,
                interviewName: interviewData.name,
                jobRole: interviewData.jobRole,
                transcript: transcript,
                savedAt: Timestamp.now(),
            });

            toast.success('Transcript saved', {
                description: 'Your interview transcript has been saved for later review.'
            });
        } catch (error) {
            console.error("Failed to save transcript:", error);
            toast.error('Failed to save transcript', {
                description: 'There was a problem saving your interview transcript.'
            });
        } finally {
            setSavingTranscript(false);
        }
    };

    // Function to skip to next question
    const skipToNextQuestion = () => {
        if (!vapi || !interviewData || !interviewData.questions) return;

        // Only if we have more questions
        if (currentQuestionIndex < interviewData.questions.length - 1) {
            const nextIndex = currentQuestionIndex + 1;
            setCurrentQuestionIndex(nextIndex);

            // Send a system message to tell the assistant to move to the next question
            vapi.send({
                type: "add-message",
                message: {
                    role: "system",
                    content: `Skip the current question and move to question #${nextIndex + 1}: ${interviewData.questions[nextIndex]}`
                }
            });

            toast.info('Skipping to next question', {
                description: `Moving to question ${nextIndex + 1}`
            });
        }
    };

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
        <div className="flex flex-col items-center justify-center pt-10 px-4 w-full max-w-4xl mx-auto">
            <Card className="w-full shadow-lg rounded-xl border-0 mb-6">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold text-gray-800 dark:text-white">
                        AI Interview Practice
                        {interviewData && ` - ${interviewData.jobRole}`}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-6 pt-1 pb-4">
                    {/* Interview progress indicator */}
                    {interviewData?.questions && interviewData.questions.length > 0 && (
                        <div className="w-full mb-4">
                            <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>{currentQuestionIndex + 1}/{interviewData.questions.length} questions</span>
                            </div>
                            <Progress
                                value={((currentQuestionIndex + 1) / interviewData.questions.length) * 100}
                                className="h-2"
                            />
                        </div>
                    )}

                    {/* Transcript display area */}
                    {(transcript.length > 0 || partialTranscript) && (
                        <div className="w-full border rounded-lg p-4 h-64 overflow-y-auto mb-4 bg-gray-50 dark:bg-gray-900">
                            {transcript.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`mb-3 ${msg.sender === 'assistant' ? 'pl-2' : 'pl-6'}`}
                                >
                                    <div className={`text-sm font-semibold ${msg.sender === 'assistant' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'
                                        }`}>
                                        {msg.sender === 'assistant' ? 'Interviewer' : 'You'}:
                                    </div>
                                    <div className={`p-2 rounded-lg ${msg.sender === 'assistant'
                                        ? 'bg-blue-100 dark:bg-blue-900/30 text-gray-800 dark:text-gray-200'
                                        : 'bg-green-100 dark:bg-green-900/30 text-gray-800 dark:text-gray-200'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}

                            {/* Partial transcript (what user is currently saying) */}
                            {partialTranscript && (
                                <div className="pl-6 mb-3">
                                    <div className="text-sm font-semibold text-gray-500">
                                        You (typing...):
                                    </div>
                                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500">
                                        {partialTranscript}
                                    </div>
                                </div>
                            )}

                            {/* Auto-scroll anchor */}
                            <div ref={transcriptEndRef} />
                        </div>
                    )}

                    {/* AI Speaking indicator with volume visualization */}
                    {isCalling && (
                        <div className="flex items-center justify-center space-x-2 text-slate-700 dark:text-slate-300">
                            {isAiSpeaking ? (
                                <>
                                    <Volume2 className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-pulse" />
                                    <span className="text-blue-600 dark:text-blue-400 animate-pulse">Interviewer speaking</span>
                                    <VolumeVisualizer level={volumeLevel} />
                                </>
                            ) : (
                                <>
                                    <VolumeX className="h-5 w-5" />
                                    <span>Listening...</span>
                                </>
                            )}
                        </div>
                    )}

                    {/* Controls area */}
                    <div className="flex flex-wrap justify-center gap-3 mt-2">
                        {/* Microphone/Stop Button */}
                        <Button
                            variant={isCalling ? "destructive" : "default"}
                            size="lg"
                            className={`rounded-full px-5 flex items-center gap-2`}
                            onClick={isCalling ? stopInterview : startInterview}
                            disabled={isLoading || (!isCalling && statusMessage === "Starting call...") || (!interviewData && !isLoading) || !vapi}
                        >
                            {isCalling ? (
                                <>
                                    <PhoneOff className="w-5 h-5" />
                                    <span>End Interview</span>
                                </>
                            ) : (
                                <>
                                    <Mic className="w-5 h-5" />
                                    <span>Start Interview</span>
                                </>
                            )}
                        </Button>

                        {/* Show/hide questions button */}
                        {interviewData?.questions && interviewData.questions.length > 0 && (
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full w-10 h-10"
                                onClick={() => setShowQuestions(!showQuestions)}
                                title={showQuestions ? "Hide questions" : "Show questions"}
                            >
                                <MessageSquare className="w-5 h-5" />
                            </Button>
                        )}

                        {/* Save transcript button */}
                        {transcript.length > 0 && (
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full w-10 h-10"
                                onClick={saveTranscript}
                                disabled={savingTranscript}
                                title="Save transcript"
                            >
                                {savingTranscript ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            </Button>
                        )}

                        {/* Skip question button (only visible during call) */}
                        {isCalling && interviewData?.questions && currentQuestionIndex < interviewData.questions.length - 1 && (
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full w-10 h-10"
                                onClick={skipToNextQuestion}
                                title="Skip to next question"
                            >
                                <SkipForward className="w-5 h-5" />
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Questions display area (conditionally shown) */}
            {showQuestions && interviewData?.questions && (
                <Card className="w-full shadow-lg rounded-xl border-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Interview Questions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ol className="list-decimal pl-5 space-y-2">
                            {interviewData.questions.map((question, idx) => (
                                <li key={idx} className={idx === currentQuestionIndex ? 'font-bold text-blue-600 dark:text-blue-400' : ''}>
                                    {question}
                                </li>
                            ))}
                        </ol>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

