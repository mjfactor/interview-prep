"use client"

import React, { useState, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { toast } from 'sonner';
import { z } from 'zod'
import { X, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { db, collection, addDoc, serverTimestamp } from '@/lib/firebase';
import { useUser } from '@/hooks/firebase-hooks';

// Experience levels
const experienceLevels = [
    { value: "Entry-level", label: "Entry-level" },
    { value: "Junior", label: "Junior" },
    { value: "Mid-level", label: "Mid-level" },
    { value: "Senior", label: "Senior" },
    { value: "Lead", label: "Lead" },
    { value: "Manager", label: "Manager" },
]

// Question categories
const categories = [
    { value: "technical", label: "Technical" },
    { value: "behavioral", label: "Behavioral" },
    { value: "system-design", label: "System Design" },
    { value: "problem-solving", label: "Problem Solving" },
    { value: "leadership", label: "Leadership" },
]

// Common tech stack options for suggestions
const techStackSuggestions = [
    "React", "Next.js", "TypeScript", "JavaScript", "Node.js",
    "Python", "Java", "C#", ".NET", "Angular", "Vue.js",
    "Express", "Django", "Flask", "Spring Boot", "GraphQL",
    "REST API", "AWS", "Azure", "Docker", "Kubernetes",
    "PostgreSQL", "MongoDB", "MySQL", "Redis", "Firebase"
]

export default function Page() {
    const router = useRouter()
    const { user } = useUser();

    // Form state
    const [jobRole, setJobRole] = useState<string>('Software Developer')
    const [experience, setExperience] = useState<string>('Mid-level')
    const [category, setCategory] = useState<string>('technical')
    const [count, setCount] = useState<number>(5)

    // Tech stack state
    const [techStack, setTechStack] = useState<string[]>(['React', 'TypeScript'])
    const [techInput, setTechInput] = useState<string>('')
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false)

    // Validation error states
    const [jobRoleError, setJobRoleError] = useState<string>('')
    const [techStackError, setTechStackError] = useState<string>('')
    const [countError, setCountError] = useState<string>('')

    // Overall submission state - tracks the entire submission process
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    // Filtered suggestions based on current input
    const filteredSuggestions = techStackSuggestions.filter(tech =>
        tech.toLowerCase().includes(techInput.toLowerCase()) &&
        !techStack.includes(tech)
    ).slice(0, 5) // Limit to 5 suggestions

    // Handle adding a new tech to the stack
    const addTech = (tech: string) => {
        const trimmedTech = tech.trim()
        if (trimmedTech && !techStack.includes(trimmedTech)) {
            setTechStack([...techStack, trimmedTech])
            setTechInput('')
            // Clear any tech stack error when adding technologies
            if (techStackError) setTechStackError('')
        }
    }

    // Handle removing a tech from the stack
    const removeTech = (tech: string) => {
        setTechStack(techStack.filter(t => t !== tech))
    }

    // Handle key press in tech input
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            addTech(techInput)
        } else if (e.key === 'Escape') {
            setShowSuggestions(false)
        }
    }

    // Form validation function
    const validateForm = (): boolean => {
        let isValid = true

        // Reset all errors first
        setJobRoleError('')
        setTechStackError('')
        setCountError('')

        // Validate job role
        if (!jobRole.trim()) {
            setJobRoleError('Job role is required')
            isValid = false
        }

        // Validate tech stack
        if (techStack.length === 0) {
            setTechStackError('At least one technology is required')
            isValid = false
        }

        // Validate count
        if (count < 1 || count > 10) {
            setCountError('Number of questions must be between 1 and 10')
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
                console.error("No questions generated.");
                setIsSubmitting(false); // Reset submission state if we get an empty response
                toast.error('Failed to generate interview questions', {
                    description: 'No questions were returned. Please try again.'
                });
                return;
            }
            try {
                const interviewData = {
                    name: user!.displayName,
                    jobRole: jobRole,
                    experience: experience,
                    category: category,
                    count: count,
                    techStack: techStack,
                    questions: object.questions,
                    createdAt: serverTimestamp(),
                    uid: user!.uid
                };

                const docRef = await addDoc(collection(db, "interviewData"), interviewData);
                router.push(`/dashboard/interview-page/${docRef.id}`);
                // Note: We don't reset isSubmitting here because navigation will unmount this component
            } catch (dbError) {
                console.error('Error storing questions in database:', dbError);
                setIsSubmitting(false); // Reset submission state on error
                toast.error('Failed to create interview', {
                    description: 'There was an error saving your interview data. Please try again.'
                });
            }
        },
        onError(error) {
            console.error("Error generating questions:", error);
            setIsSubmitting(false); // Reset submission state on error

            // Check if the error is about missing API key
            if (error instanceof Error) {
                const errorMessage = error.message;
                if (errorMessage.includes('Google API key not found')) {
                    toast.error('Google API key not found. Please add it in your settings.', {
                        description: 'Go to Settings > API Keys to add your Google API key.',
                        action: {
                            label: 'Settings',
                            onClick: () => router.push('/dashboard/api-keys')
                        }
                    });
                } else {
                    toast.error('Failed to generate interview questions', {
                        description: 'An error occurred while generating questions. Please try again.'
                    });
                }
            } else {
                toast.error('Failed to generate interview questions', {
                    description: 'An error occurred while generating questions. Please try again.'
                });
            }
        },
    });

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Validate form before submission
        if (!validateForm()) {
            return; // Stop if validation fails
        }

        // Set submission state to true at the start
        setIsSubmitting(true);

        // Structure the data to pass to the AI API
        const requestBody = {
            jobRole,
            count,
            category,
            experience,
            techStack,
            userId: user!.uid,
        };

        submit(requestBody);
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-md mx-auto">
                {/* Form Section */}
                <div className="space-y-6">
                    <div className="bg-card p-6 rounded-lg shadow-sm border">
                        <h2 className="text-xl font-semibold mb-4">Question Settings</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="jobRole" className={jobRoleError ? "text-destructive" : ""}>
                                    Job Role
                                </Label>
                                <Input
                                    id="jobRole"
                                    value={jobRole}
                                    onChange={(e) => {
                                        setJobRole(e.target.value);
                                        if (jobRoleError) setJobRoleError('');
                                    }}
                                    placeholder="e.g. Frontend Developer"
                                    className={jobRoleError ? "border-destructive" : ""}
                                    disabled={isSubmitting}
                                    aria-invalid={!!jobRoleError}
                                    aria-describedby={jobRoleError ? "jobRoleError" : undefined}
                                />
                                {jobRoleError && (
                                    <div id="jobRoleError" className="text-destructive text-sm flex items-center gap-1">
                                        <AlertCircle size={14} />
                                        <span>{jobRoleError}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="experience">Experience Level</Label>
                                <select
                                    id="experience"
                                    value={experience}
                                    onChange={(e) => setExperience(e.target.value)}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={isSubmitting}
                                >
                                    {experienceLevels.map((level) => (
                                        <option key={level.value} value={level.value}>
                                            {level.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Question Category</Label>
                                <select
                                    id="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={isSubmitting}
                                >
                                    {categories.map((cat) => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Tech Stack Input */}
                            <div className="space-y-2">
                                <Label htmlFor="techStack" className={techStackError ? "text-destructive" : ""}>
                                    Tech Stack
                                </Label>
                                <div className="relative">
                                    <div className={`flex flex-wrap gap-2 p-2 rounded-md border ${techStackError ? "border-destructive" : "border-input"} bg-transparent mb-1`}>
                                        {techStack.map((tech) => (
                                            <div
                                                key={tech}
                                                className="flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs"
                                            >
                                                <span>{tech}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeTech(tech)}
                                                    className="hover:bg-secondary-foreground/10 rounded-full p-0.5"
                                                    disabled={isSubmitting}
                                                >
                                                    <X size={12} />
                                                    <span className="sr-only">Remove {tech}</span>
                                                </button>
                                            </div>
                                        ))}
                                        <Input
                                            id="techInput"
                                            value={techInput}
                                            onChange={(e) => {
                                                setTechInput(e.target.value)
                                                setShowSuggestions(true)
                                                if (techStackError) setTechStackError('');
                                            }}
                                            onKeyDown={handleKeyDown}
                                            onBlur={() => {
                                                // Delay hiding suggestions to allow clicking them
                                                setTimeout(() => setShowSuggestions(false), 200)
                                            }}
                                            onFocus={() => setShowSuggestions(true)}
                                            placeholder="Add technology..."
                                            className="flex-grow border-0 shadow-none focus-visible:ring-0 p-0 h-7 min-w-[120px]"
                                            disabled={isSubmitting}
                                            aria-invalid={!!techStackError}
                                            aria-describedby={techStackError ? "techStackError" : undefined}
                                        />
                                    </div>

                                    {/* Tech suggestions dropdown */}
                                    {showSuggestions && techInput.length > 0 && filteredSuggestions.length > 0 && !isSubmitting && (
                                        <div className="absolute z-10 w-full mt-1 rounded-md border border-input bg-background shadow-md">
                                            <ul className="py-1">
                                                {filteredSuggestions.map((suggestion) => (
                                                    <li key={suggestion}>
                                                        <button
                                                            type="button"
                                                            className="w-full text-left px-3 py-1.5 text-sm hover:bg-secondary/50"
                                                            onClick={() => {
                                                                addTech(suggestion)
                                                                setShowSuggestions(false)
                                                            }}
                                                        >
                                                            {suggestion}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Press Enter to add a technology or select from suggestions
                                    </p>
                                    {techStackError && (
                                        <div id="techStackError" className="text-destructive text-sm flex items-center gap-1 mt-1">
                                            <AlertCircle size={14} />
                                            <span>{techStackError}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="count" className={countError ? "text-destructive" : ""}>
                                    Number of Questions
                                </Label>
                                <Input
                                    id="count"
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={count}
                                    onChange={(e) => {
                                        setCount(parseInt(e.target.value) || 1);
                                        if (countError) setCountError('');
                                    }}
                                    className={countError ? "border-destructive" : ""}
                                    disabled={isSubmitting}
                                    aria-invalid={!!countError}
                                    aria-describedby={countError ? "countError" : undefined}
                                />
                                {countError && (
                                    <div id="countError" className="text-destructive text-sm flex items-center gap-1">
                                        <AlertCircle size={14} />
                                        <span>{countError}</span>
                                    </div>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Processing...' : 'Generate Questions'}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
