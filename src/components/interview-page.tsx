"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic } from 'lucide-react'; // Import Mic icon

export default function InterviewPage({ interviewId }: { interviewId: string }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-slate-800">
            <Card className="w-full max-w-md shadow-lg rounded-xl border-0">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold text-gray-800 dark:text-white">AI Interview Practice</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-6 pt-1 pb-8"> {/* Added padding */}
                    {/* Microphone Button */}
                    <Button variant="outline" size="icon" className="rounded-full w-20 h-20 border-2 border-blue-500 text-blue-500 hover:bg-blue-100 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900 transition-colors duration-200 shadow-md">
                        <Mic className="w-10 h-10" /> {/* Increased icon size */}
                        <span className="sr-only">Start Interview</span> {/* Accessibility */}
                    </Button>
                    <p className="text-center text-gray-600 dark:text-gray-300">Press the microphone to start your interview.</p>
                </CardContent>
                {/* CardFooter removed */}
            </Card>
        </div>
    )
}

