"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"

interface ApiStatus {
  isOnline: boolean
  isConnected: boolean
  lastChecked: Date | null
  error: string | null
}

export function useApiStatus() {
  const [status, setStatus] = useState<ApiStatus>({
    isOnline: navigator.onLine,
    isConnected: false,
    lastChecked: null,
    error: null,
  })

  const checkConnection = async () => {
    try {
      const isConnected = await apiClient.healthCheck()
      setStatus((prev) => ({
        ...prev,
        isConnected,
        lastChecked: new Date(),
        error: isConnected ? null : "API server is not responding",
      }))
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        isConnected: false,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : "Connection failed",
      }))
    }
  }

  useEffect(() => {
    // Initial check
    checkConnection()

    // Set up periodic checks
    const interval = setInterval(checkConnection, 30000) // Check every 30 seconds

    // Listen for online/offline events
    const handleOnline = () => {
      setStatus((prev) => ({ ...prev, isOnline: true }))
      checkConnection()
    }

    const handleOffline = () => {
      setStatus((prev) => ({
        ...prev,
        isOnline: false,
        isConnected: false,
        error: "No internet connection",
      }))
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      clearInterval(interval)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return {
    ...status,
    checkConnection,
  }
}
