"use client"

import React, { useState, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { experimental_useObject as useObject } from '@ai-sdk/react'
import { toast } from 'sonner'
import { z } from 'zod'
import { X, AlertCircle, Cpu, Briefcase, Brain, Users, Plus, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { db, collection, addDoc, serverTimestamp } from '@/lib/firebase'
import { useUser } from '@/hooks/firebase-hooks'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// Experience levels
const experienceLevels = [
    { value: "Entry-level", label: "Entry-level" },
    { value: "Junior", label: "Junior" },
    { value: "Mid-level", label: "Mid-level" },
    { value: "Senior", label: "Senior" },
    { value: "Lead", label: "Lead" },
    { value: "Manager", label: "Manager" },
]

// Question categories with icons
const categories = [
    { value: "technical", label: "Technical", icon: <Cpu className="h-4 w-4" /> },
    { value: "behavioral", label: "Behavioral", icon: <Users className="h-4 w-4" /> },
    { value: "critical-thinking", label: "Critical Thinking", icon: <Brain className="h-4 w-4" /> },
    { value: "leadership", label: "Leadership", icon: <Briefcase className="h-4 w-4" /> },
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
    const { user } = useUser()

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
                console.error("No questions generated.")
                setIsSubmitting(false) // Reset submission state if we get an empty response
                toast.error('Failed to generate interview questions', {
                    description: 'No questions were returned. Please try again.'
                })
                return
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
                    toast.error('Failed to generate interview questions', {
                        description: 'An error occurred while generating questions. Please try again.'
                    })
                }
            } else {
                toast.error('Failed to generate interview questions', {
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
            count,
            category,
            experience,
            techStack,
            userId: user!.uid,
        }

        submit(requestBody)
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <Card className="border-border shadow-md">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-2xl font-bold">Generate Interview Questions</CardTitle>
                        <CardDescription>
                            Customize your interview questions based on job role, experience level, and technologies.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} id="question-form">
                            <div className="space-y-6">
                                {/* Basic Info Section */}
                                <div>
                                    <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                                    <div className="space-y-4">
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

                                        {/* Question Category */}
                                        <div className="space-y-2">
                                            <Label htmlFor="category">Question Category</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {categories.map((cat) => (
                                                    <Button
                                                        key={cat.value}
                                                        type="button"
                                                        variant={category === cat.value ? "default" : "outline"}
                                                        className={`justify-start gap-2 ${category === cat.value ? "" : "border-input"}`}
                                                        onClick={() => setCategory(cat.value)}
                                                        disabled={isSubmitting}
                                                    >
                                                        {cat.icon}
                                                        {cat.label}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Number of Questions */}
                                        <div className="space-y-2">
                                            <Label htmlFor="count" className={countError ? "text-destructive" : ""}>
                                                Number of Questions
                                            </Label>
                                            <div className="flex items-center">
                                                <Input
                                                    id="count"
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    value={count}
                                                    onChange={(e) => {
                                                        setCount(parseInt(e.target.value) || 1)
                                                        if (countError) setCountError('')
                                                    }}
                                                    className={`${countError ? "border-destructive" : ""} w-24`}
                                                    disabled={isSubmitting}
                                                    aria-invalid={!!countError}
                                                    aria-describedby={countError ? "countError" : undefined}
                                                />
                                                <span className="ml-3 text-sm text-muted-foreground">
                                                    (Max: 10 questions)
                                                </span>
                                            </div>
                                            {countError && (
                                                <div id="countError" className="text-destructive text-sm flex items-center gap-1">
                                                    <AlertCircle size={14} />
                                                    <span>{countError}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Tech Stack Section */}
                                <div>
                                    <h3 className="text-lg font-medium mb-4">Tech Stack</h3>
                                    <div className="space-y-5">
                                        {/* Tech Stack Input */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <Label htmlFor="techStack" className={techStackError ? "text-destructive" : ""}>
                                                    Technologies
                                                </Label>
                                                {techStack.length > 0 && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {techStack.length} {techStack.length === 1 ? 'technology' : 'technologies'} selected
                                                    </span>
                                                )}
                                            </div>

                                            {/* Tech Input Field - Moved outside the tech display area */}
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <Input
                                                        id="techInput"
                                                        value={techInput}
                                                        onChange={(e) => {
                                                            setTechInput(e.target.value)
                                                            setShowSuggestions(true)
                                                            if (techStackError) setTechStackError('')
                                                        }}
                                                        onKeyDown={handleKeyDown}
                                                        onBlur={() => {
                                                            // Delay hiding suggestions to allow clicking them
                                                            setTimeout(() => setShowSuggestions(false), 200)
                                                        }}
                                                        onFocus={() => setShowSuggestions(true)}
                                                        placeholder="Enter a technology..."
                                                        className={`${techStackError ? "border-destructive" : ""}`}
                                                        disabled={isSubmitting}
                                                        aria-invalid={!!techStackError}
                                                        aria-describedby={techStackError ? "techStackError" : undefined}
                                                    />

                                                    {/* Tech suggestions dropdown - Now positioned below the input */}
                                                    {showSuggestions && techInput.length > 0 && filteredSuggestions.length > 0 && !isSubmitting && (
                                                        <div className="absolute z-10 w-full mt-1 rounded-md border border-input bg-background shadow-md">
                                                            <ul className="py-1">
                                                                {filteredSuggestions.map((suggestion) => (
                                                                    <li key={suggestion}>
                                                                        <button
                                                                            type="button"
                                                                            className="w-full text-left px-3 py-2 text-sm hover:bg-secondary/50 flex items-center gap-2"
                                                                            onClick={() => {
                                                                                addTech(suggestion)
                                                                                setShowSuggestions(false)
                                                                            }}
                                                                        >
                                                                            <Plus size={14} className="text-muted-foreground" />
                                                                            {suggestion}
                                                                        </button>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                                <Button
                                                    type="button"
                                                    onClick={() => addTech(techInput)}
                                                    disabled={!techInput.trim() || isSubmitting}
                                                    variant="secondary"
                                                >
                                                    Add
                                                </Button>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Press Enter to add a technology or select from suggestions
                                            </p>
                                        </div>

                                        {techStackError && (
                                            <div id="techStackError" className="text-destructive text-sm flex items-center gap-1">
                                                <AlertCircle size={14} />
                                                <span>{techStackError}</span>
                                            </div>
                                        )}

                                        {/* Selected Technologies Display */}
                                        {techStack.length > 0 && (
                                            <div className="rounded-md bg-muted/40 p-3 border border-muted">
                                                <h4 className="text-sm font-medium text-foreground/80 mb-2">Selected Technologies</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {techStack.map((tech) => (
                                                        <div
                                                            key={tech}
                                                            className="group flex items-center gap-1 px-2.5 py-1 rounded-md bg-background border border-border shadow-sm transition-all hover:shadow-md hover:border-primary/30"
                                                        >
                                                            <span className="text-sm">{tech}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeTech(tech)}
                                                                className="bg-muted/50 hover:bg-destructive/10 transition-colors rounded-full p-0.5 ml-1 group-hover:bg-destructive/10"
                                                                disabled={isSubmitting}
                                                            >
                                                                <X size={14} className="text-muted-foreground group-hover:text-destructive" />
                                                                <span className="sr-only">Remove {tech}</span>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Common Technologies */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <Label className="text-sm font-medium">Common Technologies</Label>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-7 text-xs"
                                                                onClick={() => setTechStack([])}
                                                                disabled={techStack.length === 0 || isSubmitting}
                                                            >
                                                                Clear all
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Remove all selected technologies
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                                {techStackSuggestions.slice(0, 12).map((tech) => {
                                                    const isSelected = techStack.includes(tech);
                                                    return (
                                                        <TooltipProvider key={tech}>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant={isSelected ? "default" : "outline"}
                                                                        className={`justify-start h-8 text-xs ${isSelected ? 'border-primary/50' : 'border-input'}`}
                                                                        onClick={() => {
                                                                            if (!isSelected) {
                                                                                addTech(tech)
                                                                            } else {
                                                                                removeTech(tech)
                                                                            }
                                                                        }}
                                                                        disabled={isSubmitting}
                                                                    >
                                                                        {isSelected && <span className="mr-1 opacity-70">✓</span>}
                                                                        {tech}
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="bottom">
                                                                    {isSelected ? 'Remove technology' : 'Add technology'}
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    );
                                                })}
                                            </div>
                                            
                                        </div>
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
                                'Generate Interview Questions'
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
