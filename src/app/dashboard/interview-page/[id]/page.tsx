"use client"

import InterviewPage from '@/components/interview-page'
import React from 'react'
import { useParams } from 'next/navigation'
export default function Page() {
    const { id } = useParams() as { id: string };
    return (
        <InterviewPage id={id} />
    )
}

