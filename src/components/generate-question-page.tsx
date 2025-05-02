"use client"

import React, { useState, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { experimental_useObject as useObject } from '@ai-sdk/react';

import { z } from 'zod'
import { X, } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { db, collection, addDoc, serverTimestamp } from '@/lib/firebase';
import { useUser } from '@/hooks/firebase-hooks';
// Define the props interface
type GenerateQuestionProps = {
    experienceLevels: Array<{ value: string, label: string }>;
    categories: Array<{ value: string, label: string }>;
    techStackSuggestions: string[];
}

export default function GenerateQuestion({
    experienceLevels,
    categories,
    techStackSuggestions
}: GenerateQuestionProps) {
    const router = useRouter()
    const user = useUser();
    // Form state
    const [jobRole, setJobRole] = useState<string>('Software Developer')
    const [experience, setExperience] = useState<string>('Mid-level')
    const [category, setCategory] = useState<string>('technical')
    const [count, setCount] = useState<number>(10)

    // Tech stack state
    const [techStack, setTechStack] = useState<string[]>(['React', 'TypeScript'])
    const [techInput, setTechInput] = useState<string>('')
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false)

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

    // Using Vercel AI SDK's useObject to handle structured data generation
    const { submit, isLoading: isGenerating } = useObject({
        api: '/api/generate-question',
        schema: z.object({
            questions: z.array(z.string().describe('Interview questions')),
        }),

        async onFinish({ object }) { // Add async here
            if (!object?.questions) {
                console.error("No questions generated.");
                // Optionally, show an error message to the user
                return;
            }
            try {
                const questionData = {
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

                const docRef = await addDoc(collection(db, "interviewQuestions"), questionData);
                router.push(`/dashboard/interview-page/${docRef.id}`);
            } catch (dbError) {
                console.error('Error storing questions in database:', dbError);
            }
        },
        onError(error) {
            console.error("Error generating questions:", error)
        },
    });

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Structure the data to pass to the AI API
        const requestBody = {
            jobRole,
            count,
            category,
            experience,
            techStack,
            userId: user!.uid, // Use the user state
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
                                <Label htmlFor="jobRole">Job Role</Label>
                                <Input
                                    id="jobRole"
                                    value={jobRole}
                                    onChange={(e) => setJobRole(e.target.value)}
                                    placeholder="e.g. Frontend Developer"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="experience">Experience Level</Label>
                                <select
                                    id="experience"
                                    value={experience}
                                    onChange={(e) => setExperience(e.target.value)}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
                                <Label htmlFor="techStack">Tech Stack</Label>
                                <div className="relative">
                                    <div className="flex flex-wrap gap-2 p-2 rounded-md border border-input bg-transparent mb-1">
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
                                            }}
                                            onKeyDown={handleKeyDown}
                                            onBlur={() => {
                                                // Delay hiding suggestions to allow clicking them
                                                setTimeout(() => setShowSuggestions(false), 200)
                                            }}
                                            onFocus={() => setShowSuggestions(true)}
                                            placeholder="Add technology..."
                                            className="flex-grow border-0 shadow-none focus-visible:ring-0 p-0 h-7 min-w-[120px]"
                                        />
                                    </div>

                                    {/* Tech suggestions dropdown */}
                                    {showSuggestions && techInput.length > 0 && filteredSuggestions.length > 0 && (
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
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="count">Number of Questions</Label>
                                <Input
                                    id="count"
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={count}
                                    onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isGenerating}
                            >
                                {isGenerating ? 'Generating...' : 'Generate Questions'}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}