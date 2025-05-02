"use client"

import { useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/firebase-hooks"; // Import the hook

interface AuthProtectionProps {
    children: ReactNode
}

export default function AuthProtection({ children }: AuthProtectionProps) {
    const { user, loading } = useUser(); // Use the hook
    const router = useRouter()

    useEffect(() => {
        // Redirect if loading is finished and there is no user
        if (!loading && !user) {
            router.push("/signin")
        }
    }, [user, loading, router])

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }

    // If authenticated (user exists), render children
    return user ? <>{children}</> : null // Render children only if user exists
}