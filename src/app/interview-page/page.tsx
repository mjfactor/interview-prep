"use client"

import React, { useState, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'

// Experience level options
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

export default function InterviewPage() {
    // Form state
    const [jobRole, setJobRole] = useState<string>('Software Developer')
    const [experience, setExperience] = useState<string>('Mid-level')
    const [category, setCategory] = useState<string>('technical')
    const [count, setCount] = useState<number>(3)
    const [isLoading, setIsLoading] = useState<boolean>(false)

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

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        console.log({
            jobRole,
            experience,
            category,
            count,
            techStack
        })

        // Simulate API call delay
        setTimeout(() => {
            setIsLoading(false)
        }, 2000)
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">Interview Question Generator</h1>
                <p className="text-muted-foreground mt-2">
                    Generate tailored interview questions for your next job interview
                </p>
            </header>

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
                                disabled={isLoading}
                            >
                                {isLoading ? 'Generating...' : 'Generate Questions'}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
