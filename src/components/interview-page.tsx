"use client"

import React from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function InterviewPage({ interviewId }: { interviewId: string }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold">AI Interview Practice</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                    {/* Placeholder for AI image - Replace with your actual image */}
                    <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                        <span className="text-gray-500">AI Image</span>
                        {/* Example using Next/Image if you have an image file */}
                        {/* <Image src="/ai-avatar.png" alt="AI Interviewer" width={128} height={128} className="rounded-full" /> */}
                    </div>
                    <p className="text-center text-muted-foreground">
                        Prepare for your next interview by practicing with our AI.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button size="lg">Start Practicing</Button>
                </CardFooter>
            </Card>
        </div>
    )
}

