"use client"

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 text-center"> {/* Removed background classes */}
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-6xl mb-4">
                Prepare for Your Next Interview
            </h1>
            <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mb-8">
                Sharpen your skills and ace your technical interviews with our AI-powered preparation platform.
            </p>
            <Link href="/signin" passHref>
                <Button size="lg">Sign In to Get Started</Button>
            </Link>
        </div>
    )
}
