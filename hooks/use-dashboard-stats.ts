import { useState, useEffect, useCallback } from 'react'

interface DashboardStats {
  totalMembers: number
  totalMinistries: number
  recentRegistrations: number
}

const defaultStats: DashboardStats = {
  totalMembers: 0,
  totalMinistries: 0,
  recentRegistrations: 0
}

// Global state for dashboard stats
let globalStats: DashboardStats = defaultStats
let globalLoading = true
let globalError: string | null = null
const subscribers = new Set<() => void>()

// Function to notify all subscribers
const notifySubscribers = () => {
  subscribers.forEach(callback => callback())
}

// Function to fetch stats from API
const fetchStatsFromAPI = async (): Promise<{ stats: DashboardStats; error: string | null }> => {
  try {
    const response = await fetch('/api/dashboard/stats', {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
    if (!response.ok) {
      console.error('Stats response not OK:', response.status, response.statusText)
      throw new Error(`Failed to fetch stats: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('Dashboard stats response:', data)
    
    if (data.success) {
      return { stats: data.stats, error: null }
    } else {
      return { stats: data.stats || defaultStats, error: 'Failed to load statistics' }
    }
  } catch (err) {
    console.error('Error fetching dashboard stats:', err)
    return { stats: defaultStats, error: 'Failed to load statistics' }
  }
}

// Function to refresh global stats
const refreshGlobalStats = async () => {
  globalLoading = true
  notifySubscribers()
  
  const { stats, error } = await fetchStatsFromAPI()
  globalStats = stats
  globalError = error
  globalLoading = false
  
  notifySubscribers()
}

// Initialize stats on first load
let initialized = false
if (!initialized && typeof window !== 'undefined') {
  initialized = true
  refreshGlobalStats()
  
  // Set up periodic refresh
  setInterval(refreshGlobalStats, 30000) // Refresh every 30 seconds
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>(globalStats)
  const [loading, setLoading] = useState(globalLoading)
  const [error, setError] = useState<string | null>(globalError)

  // Subscribe to global state changes
  useEffect(() => {
    const updateLocalState = () => {
      setStats(globalStats)
      setLoading(globalLoading)
      setError(globalError)
    }

    subscribers.add(updateLocalState)
    updateLocalState() // Update immediately

    return () => {
      subscribers.delete(updateLocalState)
    }
  }, [])

  // Function to manually refresh stats
  const refreshStats = useCallback(async () => {
    await refreshGlobalStats()
  }, [])

  return {
    stats,
    loading,
    error,
    refreshStats
  }
}

// Export function to refresh stats from anywhere in the app
export const refreshDashboardStats = refreshGlobalStats