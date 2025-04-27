"use client"

import InterviewPage from '@/components/generate-question-page'

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
    return (
        <InterviewPage
            experienceLevels={experienceLevels}
            categories={categories}
            techStackSuggestions={techStackSuggestions}
        />
    )
}
