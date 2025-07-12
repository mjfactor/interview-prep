"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Calendar, Clock, Code, Loader2, MessageSquare, RefreshCw, Search, Trash2 } from "lucide-react"

import { db, collection, getDocs, query, where, orderBy, deleteDoc, doc } from "@/lib/firebase"
import { useUser } from "@/hooks/firebase-hooks"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

// Define the interview data structure
interface InterviewData {
    id: string
    name: string
    jobRole: string
    experience: string
    questions: string[]
    createdAt: {
        toDate: () => Date
    }
    uid: string
    type?: string // Optional type field to distinguish behavioral-star from old data
}

export default function InterviewGeneratedPage() {
    const router = useRouter()
    const { user } = useUser()
    const [interviews, setInterviews] = useState<InterviewData[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [filteredInterviews, setFilteredInterviews] = useState<InterviewData[]>([])
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isRetrying, setIsRetrying] = useState(false)
    const [showRetryButton, setShowRetryButton] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Extract fetch interviews logic into a separate function so it can be reused
    const fetchInterviews = useCallback(async () => {
        if (!user) {
            setLoading(false)
            return
        }

        try {
            setError(null)

            const interviewQuery = query(
                collection(db, "interviewData"),
                where("uid", "==", user.uid),
                orderBy("createdAt", "desc")
            )

            const querySnapshot = await getDocs(interviewQuery)
            const interviewList: InterviewData[] = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            } as InterviewData))

            setInterviews(interviewList)
            setFilteredInterviews(interviewList)

            // Show success message when retrying
            if (isRetrying) {
                toast.success("Practice sessions refreshed", {
                    description: `Found ${interviewList.length} practice session${interviewList.length !== 1 ? 's' : ''}`
                })
            }
        } catch (error) {
            console.error("Error fetching practice sessions:", error)
            setError("Failed to load practice sessions. Please try again.")
            toast.error("Failed to load practice sessions", {
                description: "There was a problem retrieving your practice session data."
            })
        } finally {
            setLoading(false)
            setIsRetrying(false)
            setShowRetryButton(false)
        }
    }, [user, isRetrying])

    // Handle retry button click
    const handleRetry = () => {
        setIsRetrying(true)
        setLoading(true)
        fetchInterviews()
    }

    // Fetch interviews from Firestore on component mount
    useEffect(() => {
        fetchInterviews()

        // Show retry button after 5 seconds if still loading
        const timer = setTimeout(() => {
            if (loading) {
                setShowRetryButton(true)
            }
        }, 5000)

        return () => clearTimeout(timer)
    }, [user, fetchInterviews])

    // Filter interviews based on search term
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredInterviews(interviews)
            return
        }

        const lowerCaseSearch = searchTerm.toLowerCase()
        const filtered = interviews.filter(interview =>
            interview.jobRole.toLowerCase().includes(lowerCaseSearch) ||
            interview.experience.toLowerCase().includes(lowerCaseSearch)
        )

        setFilteredInterviews(filtered)
    }, [searchTerm, interviews])

    // Handle clicking on an interview
    const handleInterviewClick = (interviewId: string) => {
        router.push(`/dashboard/interview-page/${interviewId}`)
    }

    // Handle deleting an interview
    const handleDeleteInterview = async () => {
        if (!deleteId) return

        try {
            await deleteDoc(doc(db, "interviewData", deleteId))

            // Remove from both lists
            const updatedInterviews = interviews.filter(interview => interview.id !== deleteId)
            setInterviews(updatedInterviews)
            setFilteredInterviews(filteredInterviews.filter(interview => interview.id !== deleteId))

            toast.success("Practice session deleted", {
                description: "The practice session has been successfully deleted."
            })
        } catch (error) {
            console.error("Error deleting practice session:", error)
            toast.error("Failed to delete practice session", {
                description: "There was a problem deleting this practice session."
            })
        } finally {
            setDeleteId(null)
            setIsDeleteDialogOpen(false)
        }
    }

    // Display a loading state while fetching
    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col space-y-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold">Your STAR Method Practice</h1>
                    </div>

                    {showRetryButton && (
                        <div className="flex justify-center my-4">
                            <Button
                                onClick={handleRetry}
                                disabled={isRetrying}
                                variant="outline"
                                className="mx-auto"
                            >
                                {isRetrying ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Retrying...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Retry loading
                                    </>
                                )}
                            </Button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                        {[...Array(6)].map((_, i) => (
                            <Card key={i} className="animate-pulse">
                                <CardHeader className="h-24 bg-muted rounded-t-lg" />
                                <CardContent className="h-32 bg-muted mt-2" />
                                <CardFooter className="h-10 bg-muted rounded-b-lg" />
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    // Display error state
    if (error) {
        return (
            <div className="container mx-auto px-4 py-12">
                <Card className="border-dashed border-2">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="rounded-full bg-destructive/10 p-4 mb-4">
                            <RefreshCw className="h-8 w-8 text-destructive" />
                        </div>
                        <h3 className="text-2xl font-medium mb-2">Error loading interviews</h3>
                        <p className="text-muted-foreground text-center max-w-md mb-6">
                            {error}
                        </p>
                        <div className="flex gap-4">
                            <Button
                                onClick={handleRetry}
                                disabled={isRetrying}
                                size="lg"
                                variant="default"
                            >
                                {isRetrying ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Retrying...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Retry
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={() => router.push('/dashboard/generate-question-page')}
                                variant="outline"
                                size="lg"
                            >
                                Generate New Practice Session
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Handle case when no interviews are available
    if (interviews.length === 0) {
        return (
            <div className="container mx-auto px-4 py-12">
                <Card className="border-dashed border-2">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="rounded-full bg-primary/10 p-4 mb-4">
                            <MessageSquare className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-2xl font-medium mb-2">No practice sessions found</h3>
                        <p className="text-muted-foreground text-center max-w-md mb-6">
                            You haven't generated any behavioral interview questions yet. Create your first STAR method practice session to get started!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                onClick={() => router.push('/dashboard/generate-question-page')}
                                size="lg"
                            >
                                Generate Practice Session
                            </Button>
                            <Button
                                onClick={handleRetry}
                                disabled={isRetrying}
                                variant="outline"
                                size="lg"
                            >
                                {isRetrying ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Checking...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Refresh List
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Your STAR Method Practice</h1>
                        <p className="text-muted-foreground mt-1">
                            {filteredInterviews.length} behavioral interview session{filteredInterviews.length !== 1 ? 's' : ''} available
                        </p>
                    </div>

                    <div className="flex w-full md:w-auto gap-2 items-center flex-wrap">
                        <div className="relative flex-grow md:flex-grow-0 w-full md:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by job role or experience..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 w-full"
                            />
                        </div>
                        <Button onClick={() => router.push('/dashboard/generate-question-page')}>
                            New Practice Session
                        </Button>
                        <Button
                            onClick={handleRetry}
                            variant="outline"
                            size="icon"
                            disabled={isRetrying}
                            title="Refresh practice sessions"
                        >
                            {isRetrying ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Mobile view: Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:hidden">
                    {filteredInterviews.map((interview) => (
                        <Card
                            key={interview.id}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => handleInterviewClick(interview.id)}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-xl line-clamp-1">{interview.jobRole}</CardTitle>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <span className="sr-only">Open menu</span>
                                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                                                    <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                                                </svg>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setDeleteId(interview.id)
                                                    setIsDeleteDialogOpen(true)
                                                }}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <CardDescription className="flex gap-2 mt-1 items-center">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {format(interview.createdAt.toDate(), "MMM d, yyyy")}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2">
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <Badge variant="outline">{interview.experience}</Badge>
                                    <Badge variant="secondary">STAR Method</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Behavioral questions for practicing the STAR method
                                </p>
                            </CardContent>
                            <CardFooter className="pt-2">
                                <div className="flex w-full justify-between items-center text-sm text-muted-foreground">
                                    <span className="flex items-center">
                                        <MessageSquare className="h-3.5 w-3.5 mr-1" />
                                        {interview.questions.length} questions
                                    </span>
                                    <span className="text-sm">
                                        Behavioral Practice
                                    </span>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {/* Desktop view: Table */}
                <div className="hidden md:block">
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Job Role</TableHead>
                                        <TableHead>Date Created</TableHead>
                                        <TableHead>Experience Level</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Questions</TableHead>
                                        <TableHead className="w-[80px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredInterviews.map((interview) => (
                                        <TableRow
                                            key={interview.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => handleInterviewClick(interview.id)}
                                        >
                                            <TableCell className="font-medium">{interview.jobRole}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    <span>{format(interview.createdAt.toDate(), "MMM d, yyyy")}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{interview.experience}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">STAR Method</Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {interview.questions.length} questions
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setDeleteId(interview.id)
                                                        setIsDeleteDialogOpen(true)
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                    <span className="sr-only">Delete</span>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Delete confirmation dialog */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Practice Session</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this practice session? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsDeleteDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteInterview}
                            >
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}