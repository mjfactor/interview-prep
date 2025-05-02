"use client"

import { useEffect, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { auth, onAuthStateChanged } from "@/lib/firebase"
interface AuthProtectionProps {
    children: ReactNode
}

export default function AuthProtection({ children }: AuthProtectionProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsAuthenticated(true)
            } else {
                router.push("/signin")
            }
            setIsLoading(false)
        })

        // Cleanup subscription on unmount
        return () => unsubscribe()
    }, [router])

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }

    // If authenticated, render children
    return isAuthenticated ? <>{children}</> : null
}