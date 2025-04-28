"use client"

import { useEffect } from 'react' // Import useEffect
import { useRouter } from 'next/navigation'

export default function Page() {
    const router = useRouter()

    // Use useEffect to perform the redirect after the component mounts
    useEffect(() => {
        router.push("/generate-question-page")
    }, [router]) // Add router to dependency array
    return null 
}