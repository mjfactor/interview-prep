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
import { validateVapiKey } from "@/lib/aivapi.sdk"

export default function ApiKeysPage() {
  const [googleApiKey, setGoogleApiKey] = useState("")
  const [vapiApiKey, setVapiApiKey] = useState("")
  const [showGoogleKey, setShowGoogleKey] = useState(false)
  const [showVapiKey, setShowVapiKey] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validatingGoogle, setValidatingGoogle] = useState(false)
  const [validatingVapi, setValidatingVapi] = useState(false)
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

  // Validate Gemini API key using the API endpoint
  const validateGeminiKey = async (apiKey: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/validate-keys/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey }),
      });

      const data = await response.json();
      return data.valid;
    } catch (error) {
      console.error("Error validating Gemini key:", error);
      return false;
    }
  };

  // Validate Vapi API key using the function from aivapi.sdk.ts
  const validateVapiKeyLocal = async (apiKey: string): Promise<boolean> => {
    try {
      return await validateVapiKey(apiKey);
    } catch (error) {
      console.error("Error validating Vapi key:", error);
      return false;
    }
  };

  const handleSaveApiKeys = async () => {
    if (!user) {
      toast.error("You must be logged in to save API keys")
      return
    }

    setLoading(true)
    let googleKeyValid = true
    let vapiKeyValid = true
    const keysToSave: { googleApiKey?: string; vapiApiKey?: string; updatedAt: Date } = {
      updatedAt: new Date()
    }

    // Validate Google API key (if provided)
    if (googleApiKey.trim()) {
      setValidatingGoogle(true)
      try {
        googleKeyValid = await validateGeminiKey(googleApiKey)
        if (!googleKeyValid) {
          toast.error("Invalid Google API key", {
            description: "The provided Google API key could not be validated."
          })
        } else {
          keysToSave.googleApiKey = googleApiKey
        }
      } catch (error) {
        console.error("Error validating Google API key:", error)
        toast.error("Failed to validate Google API key")
        googleKeyValid = false
      } finally {
        setValidatingGoogle(false)
      }
    } else if (googleApiKey === "") {
      // If field is empty, it means the user wants to clear the key
      keysToSave.googleApiKey = ""
    }

    // Validate Vapi API key (if provided)
    if (vapiApiKey.trim()) {
      setValidatingVapi(true)
      try {
        vapiKeyValid = await validateVapiKeyLocal(vapiApiKey)
        if (!vapiKeyValid) {
          toast.error("Invalid Vapi API key", {
            description: "The provided Vapi API key could not be validated."
          })
        } else {
          keysToSave.vapiApiKey = vapiApiKey
        }
      } catch (error) {
        console.error("Error validating Vapi API key:", error)
        toast.error("Failed to validate Vapi API key")
        vapiKeyValid = false
      } finally {
        setValidatingVapi(false)
      }
    } else if (vapiApiKey === "") {
      // If field is empty, it means the user wants to clear the key
      keysToSave.vapiApiKey = ""
    }

    // Save valid keys to database
    if (googleKeyValid && vapiKeyValid && (keysToSave.googleApiKey !== undefined || keysToSave.vapiApiKey !== undefined)) {
      try {
        await setDoc(
          doc(db, "users", user.uid, "settings", "apiKeys"),
          keysToSave,
          { merge: true }
        )
        toast.success("API keys saved successfully", {
          description: "Only valid keys were saved to your account."
        })
      } catch (error) {
        console.error("Error saving API keys:", error)
        toast.error("Failed to save API keys")
      }
    }

    setLoading(false)
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

  const isValidating = validatingGoogle || validatingVapi
  const buttonText = isValidating
    ? "Validating..."
    : loading
      ? "Saving..."
      : "Save API Keys"

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Keys Settings</h1>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Google API Key</CardTitle>
            <CardDescription>
              Configure your Google API key for enhanced functionality.
              {validatingGoogle && <span className="text-yellow-600 ml-2">Validating...</span>}
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
                    disabled={isFetching || loading || isValidating}
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
              {validatingVapi && <span className="text-yellow-600 ml-2">Validating...</span>}
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
                    disabled={isFetching || loading || isValidating}
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
            disabled={isFetching || loading || isValidating}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  )
}