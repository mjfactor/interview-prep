"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUser } from "@/hooks/firebase-hooks"
import { doc, getDoc, setDoc, db } from "@/lib/firebase"

export default function ApiKeysPage() {
  const [googleApiKey, setGoogleApiKey] = useState("")
  const [vapiApiKey, setVapiApiKey] = useState("")
  const [showGoogleKey, setShowGoogleKey] = useState(false)
  const [showVapiKey, setShowVapiKey] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const { user } = useUser()
  const router = useRouter()

  // Fetch existing API keys if available
  useEffect(() => {
    const fetchApiKeys = async () => {
      if (!user) {
        setIsFetching(false)
        return
      }

      try {
        const apiKeysDoc = await getDoc(doc(db, "users", user.uid, "settings", "apiKeys"))

        if (apiKeysDoc.exists()) {
          const data = apiKeysDoc.data()
          setGoogleApiKey(data.googleApiKey || "")
          setVapiApiKey(data.vapiApiKey || "")
        }
      } catch (error) {
        console.error("Error fetching API keys:", error)
        toast.error("Failed to load saved API keys")
      } finally {
        setIsFetching(false)
      }
    }

    fetchApiKeys()
  }, [user])

  const handleSaveApiKeys = async () => {
    if (!user) {
      toast.error("You must be logged in to save API keys")
      return
    }

    setLoading(true)
    try {
      // Save API keys to Firestore
      await setDoc(
        doc(db, "users", user.uid, "settings", "apiKeys"),
        {
          googleApiKey,
          vapiApiKey,
          updatedAt: new Date()
        },
        { merge: true }
      )

      toast.success("API keys saved successfully")
    } catch (error) {
      console.error("Error saving API keys:", error)
      toast.error("Failed to save API keys")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to be logged in to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/signin")} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Keys Settings</h1>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Google API Key</CardTitle>
            <CardDescription>
              Configure your Google API key for enhanced functionality.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="googleApiKey">API Key</Label>
                <div className="flex relative">
                  <Input
                    id="googleApiKey"
                    value={googleApiKey}
                    onChange={(e) => setGoogleApiKey(e.target.value)}
                    placeholder="Enter your Google API key"
                    type={showGoogleKey ? "text" : "password"}
                    disabled={isFetching || loading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGoogleKey(!showGoogleKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    aria-label={showGoogleKey ? "Hide API key" : "Show API key"}
                  >
                    {showGoogleKey ? (
                      <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vapi API Key</CardTitle>
            <CardDescription>
              Configure your Vapi API key for voice AI integration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="vapiApiKey">API Key</Label>
                <div className="flex relative">
                  <Input
                    id="vapiApiKey"
                    value={vapiApiKey}
                    onChange={(e) => setVapiApiKey(e.target.value)}
                    placeholder="Enter your Vapi API key"
                    type={showVapiKey ? "text" : "password"}
                    disabled={isFetching || loading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowVapiKey(!showVapiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    aria-label={showVapiKey ? "Hide API key" : "Show API key"}
                  >
                    {showVapiKey ? (
                      <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={handleSaveApiKeys}
            disabled={isFetching || loading}
          >
            {loading ? "Saving..." : "Save API Keys"}
          </Button>
        </div>
      </div>
    </div>
  )
}