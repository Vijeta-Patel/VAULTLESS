// ============================================================
// FILE: src/lib/VaultlessContext.jsx
// ============================================================
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { connectWallet as connectWalletEth } from './ethereum.js'

const VaultlessContext = createContext(null)

const STORAGE_KEY = 'vaultless_enrollment'

export function VaultlessProvider({ children }) {
  const [walletAddress, setWalletAddress] = useState(null)
  const [enrollmentVector, setEnrollmentVector] = useState(null)
  const [enrollmentHash, setEnrollmentHash] = useState(null)
  const [enrollmentRhythmVariance, setEnrollmentRhythmVariance] = useState(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [lastScore, setLastScore] = useState(null)
  const [isDuress, setIsDuress] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [txHistory, setTxHistory] = useState([])

  // Restore enrollment from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        if (data.enrollmentVector) {
          setEnrollmentVector(new Float32Array(data.enrollmentVector))
        }
        if (data.enrollmentHash) setEnrollmentHash(data.enrollmentHash)
        if (data.walletAddress) setWalletAddress(data.walletAddress)
        if (data.enrollmentRhythmVariance != null) setEnrollmentRhythmVariance(data.enrollmentRhythmVariance)
        setIsEnrolled(true)
        console.log('[VAULTLESS] Enrollment restored from localStorage')
      }
    } catch (e) {
      console.warn('[VAULTLESS] Failed to restore enrollment:', e)
    }
  }, [])

  const connectWallet = useCallback(async () => {
    const address = await connectWalletEth()
    setWalletAddress(address)
    return address
  }, [])

  const setEnrollmentData = useCallback(({ vector, hash, rhythmVariance }) => {
    setEnrollmentVector(vector)
    setEnrollmentHash(hash)
    setEnrollmentRhythmVariance(rhythmVariance)
    setIsEnrolled(true)
    // Persist to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        enrollmentVector: Array.from(vector),
        enrollmentHash: hash,
        walletAddress,
        enrollmentRhythmVariance: rhythmVariance,
      }))
      console.log('[VAULTLESS] Enrollment saved to localStorage')
    } catch (e) {
      console.warn('[VAULTLESS] Failed to save enrollment:', e)
    }
  }, [walletAddress])

  const setAuthResult = useCallback(({ score, duress, authenticated }) => {
    setLastScore(score)
    setIsDuress(duress || false)
    setIsAuthenticated(authenticated || false)
    console.log('[VAULTLESS] Auth result:', { score, duress, authenticated })
  }, [])

  const addTxEvent = useCallback((event) => {
    setTxHistory(prev => [
      { ...event, id: Date.now() + Math.random() },
      ...prev.slice(0, 9) // keep last 10
    ])
  }, [])

  const resetAuth = useCallback(() => {
    setLastScore(null)
    setIsDuress(false)
    setIsAuthenticated(false)
  }, [])

  const clearEnrollment = useCallback(() => {
    setEnrollmentVector(null)
    setEnrollmentHash(null)
    setEnrollmentRhythmVariance(null)
    setIsEnrolled(false)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <VaultlessContext.Provider value={{
      walletAddress,
      enrollmentVector,
      enrollmentHash,
      enrollmentRhythmVariance,
      isEnrolled,
      lastScore,
      isDuress,
      isAuthenticated,
      txHistory,
      connectWallet,
      setEnrollmentData,
      setAuthResult,
      addTxEvent,
      resetAuth,
      clearEnrollment,
    }}>
      {children}
    </VaultlessContext.Provider>
  )
}

export function useVaultless() {
  const ctx = useContext(VaultlessContext)
  if (!ctx) throw new Error('useVaultless must be used within VaultlessProvider')
  return ctx
}
