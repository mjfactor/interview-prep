"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { auth, googleProvider, signInWithPopup, db, doc, setDoc, onAuthStateChanged } from "@/lib/firebase"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Add state to track auth check
  const router = useRouter()

  // Check if user is already logged in when component mounts
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, redirect to interview page
        // The component will likely unmount or redirect, so no need to set isCheckingAuth
        router.push("/interview-page")
      } else {
        // No user is signed in, finished checking
        setIsCheckingAuth(false);
      }
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [router])

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      // Store user in Firestore
      try {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          lastLogin: new Date().toISOString(),
        }, { merge: true });

        toast.success("Authentication successful", {
          description: `Welcome, ${user.displayName || "user"}!`,
        })

        router.push("/interview-page")
      } catch (firestoreError) {
        console.error("Firestore error:", firestoreError)
        toast.warning("Signed in but profile storage failed", {
          description: "You're signed in, but we couldn't update your profile data.",
        })
        router.push("/interview-page")
      }
    } catch (error) {
      console.error("Google sign-in error:", error)
      let errorMessage = "Failed to sign in with Google"
      if (error instanceof Error) {
        errorMessage = error.message
      }
      toast.error("Authentication failed", {
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Don't render anything until the auth check is complete
  if (isCheckingAuth) {
    return null; // Or a loading spinner component
  }

  // Render the login page only if not checking auth and user is not logged in
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          {/* Optional: Add an icon/logo here */}
          {/* <CodeIcon className="mx-auto h-10 w-10 text-primary" /> */}
          <CardTitle className="text-3xl font-bold tracking-tight">Welcome Back</CardTitle>
          <CardDescription>Sign in to your interview prep account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Continue with</span>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                <path
                  d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                  fill="#EA4335"
                />
                <path
                  d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                  fill="#4285F4"
                />
                <path
                  d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                  fill="#FBBC05"
                />
                <path
                  d="M12.0004 24C15.2404 24 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24 12.0004 24Z"
                  fill="#34A853"
                />
              </svg>
            )}
            {isLoading ? "Signing in..." : "Sign in with Google"}
          </Button>
        </CardContent>
        {/* Optional: Add CardFooter if needed */}
      </Card>
    </div>
  )
}

