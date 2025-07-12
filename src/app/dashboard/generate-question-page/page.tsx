"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { experimental_useObject as useObject } from '@ai-sdk/react'
import { toast } from 'sonner'
import { z } from 'zod'
import { AlertCircle, Loader2, Info } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { db, collection, addDoc, serverTimestamp } from '@/lib/firebase'
import { useUser } from '@/hooks/firebase-hooks'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

// Experience levels
const experienceLevels = [
    { value: "Entry-level", label: "Entry-level" },
    { value: "Junior", label: "Junior" },
    { value: "Mid-level", label: "Mid-level" },
    { value: "Senior", label: "Senior" },
    { value: "Lead", label: "Lead" },
    { value: "Manager", label: "Manager" },
]

export default function Page() {
    const router = useRouter()
    const { user } = useUser()

    // Form state
    const [jobRole, setJobRole] = useState<string>('Software Developer')
    const [experience, setExperience] = useState<string>('Mid-level')

    // Validation error states
    const [jobRoleError, setJobRoleError] = useState<string>('')

    // Overall submission state - tracks the entire submission process
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    // Form validation function
    const validateForm = (): boolean => {
        let isValid = true

        // Reset all errors first
        setJobRoleError('')

        // Validate job role
        if (!jobRole.trim()) {
            setJobRoleError('Job role is required')
            isValid = false
        }

        return isValid
    }

    // Using Vercel AI SDK's useObject to handle structured data generation
    const { submit } = useObject({
        api: '/api/generate-question',
        schema: z.object({
            questions: z.array(z.string().describe('Interview questions')),
        }),

        async onFinish({ object }) {
            if (!object?.questions) {
                console.error("No questions generated.")
                setIsSubmitting(false) // Reset submission state if we get an empty response
                toast.error('Failed to generate behavioral questions', {
                    description: 'No questions were returned. Please try again.'
                })
                return
            }
            try {
                const interviewData = {
                    name: user!.displayName,
                    jobRole: jobRole,
                    experience: experience,
                    questions: object.questions,
                    createdAt: serverTimestamp(),
                    uid: user!.uid,
                    type: 'behavioral-star' // Add type to distinguish from previous data
                }

                const docRef = await addDoc(collection(db, "interviewData"), interviewData)
                router.push(`/dashboard/interview-page/${docRef.id}`)
                // Note: We don't reset isSubmitting here because navigation will unmount this component
            } catch (dbError) {
                console.error('Error storing questions in database:', dbError)
                setIsSubmitting(false) // Reset submission state on error
                toast.error('Failed to create interview', {
                    description: 'There was an error saving your interview data. Please try again.'
                })
            }
        },
        onError(error) {
            console.error("Error generating questions:", error)
            setIsSubmitting(false) // Reset submission state on error

            // Check if the error is about missing API key
            if (error instanceof Error) {
                const errorMessage = error.message
                if (errorMessage.includes('Google API key not found')) {
                    toast.error('Google API key not found. Please add it in your settings.', {
                        description: 'Go to Settings > API Keys to add your Google API key.',
                        action: {
                            label: 'Settings',
                            onClick: () => router.push('/dashboard/api-keys')
                        }
                    })
                } else {
                    toast.error('Failed to generate behavioral questions', {
                        description: 'An error occurred while generating questions. Please try again.'
                    })
                }
            } else {
                toast.error('Failed to generate behavioral questions', {
                    description: 'An error occurred while generating questions. Please try again.'
                })
            }
        },
    })

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Validate form before submission
        if (!validateForm()) {
            return // Stop if validation fails
        }

        // Set submission state to true at the start
        setIsSubmitting(true)

        // Structure the data to pass to the AI API
        const requestBody = {
            jobRole,
            experience,
            userId: user!.uid,
        }

        submit(requestBody)
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <Card className="border-border shadow-md">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-2xl font-bold">STAR Method Practice</CardTitle>
                        <CardDescription>
                            Practice behavioral interview questions using the STAR method (Situation, Task, Action, Result).
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} id="question-form">
                            <div className="space-y-6">
                                {/* Job Role Input */}
                                <div className="space-y-2">
                                    <Label htmlFor="jobRole" className={jobRoleError ? "text-destructive" : ""}>
                                        Job Role
                                    </Label>
                                    <Input
                                        id="jobRole"
                                        value={jobRole}
                                        onChange={(e) => {
                                            setJobRole(e.target.value)
                                            if (jobRoleError) setJobRoleError('')
                                        }}
                                        placeholder="e.g. Software Developer, Product Manager, Marketing Manager"
                                        className={jobRoleError ? "border-destructive" : ""}
                                        disabled={isSubmitting}
                                        aria-invalid={!!jobRoleError}
                                        aria-describedby={jobRoleError ? "jobRoleError" : undefined}
                                    />
                                    {jobRoleError && (
                                        <div id="jobRoleError" className="text-destructive text-sm flex items-center gap-1">
                                            <AlertCircle size={14} />
                                            {jobRoleError}
                                        </div>
                                    )}
                                </div>

                                {/* Experience Level */}
                                <div className="space-y-2">
                                    <Label htmlFor="experience">Experience Level</Label>
                                    <div className="relative">
                                        <select
                                            id="experience"
                                            value={experience}
                                            onChange={(e) => setExperience(e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            disabled={isSubmitting}
                                        >
                                            {experienceLevels.map((level) => (
                                                <option key={level.value} value={level.value}>
                                                    {level.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </CardContent>

                    <Separator />

                    <CardFooter className="p-6">
                        <Button
                            type="submit"
                            form="question-form"
                            className="w-full"
                            disabled={isSubmitting}
                            size="lg"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating Questions...
                                </>
                            ) : (
                                'Generate Behavioral Questions'
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
