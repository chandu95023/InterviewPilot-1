/**
 * useSpeechRecognition.js
 *
 * A robust custom hook for the Web Speech API with:
 *  - Correct browser detection (SpeechRecognition + webkitSpeechRecognition)
 *  - Microphone permission handling
 *  - Graceful error handling (NotAllowedError, network, audio capture)
 *  - Firefox / unsupported browser fallback
 */

import { useState, useRef, useCallback, useEffect } from 'react'

/**
 * Detect browser support for SpeechRecognition.
 * Returns the constructor or null if unsupported.
 */
export function getSpeechRecognitionAPI() {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

export const BROWSER_SUPPORT = (() => {
  const api = getSpeechRecognitionAPI()
  const ua = navigator.userAgent || ''
  const isChrome = /Chrome\//.test(ua) && !/Chromium\//.test(ua) && !/Edg\//.test(ua)
  const isEdge = /Edg\//.test(ua)
  const isFirefox = /Firefox\//.test(ua)
  const isSafari = /Safari\//.test(ua) && !/Chrome\//.test(ua)

  return {
    supported: !!api,
    browser: isChrome ? 'Chrome' : isEdge ? 'Edge' : isFirefox ? 'Firefox' : isSafari ? 'Safari' : 'Unknown',
    api,
  }
})()

/**
 * Mic permission error → human readable message
 */
function mapRecognitionError(errorCode) {
  switch (errorCode) {
    case 'not-allowed':
    case 'NotAllowedError':
      return 'Microphone access was denied. Please allow microphone permission in your browser settings and try again.'
    case 'audio-capture':
      return 'No microphone detected. Please connect a microphone and try again.'
    case 'network':
      return 'A network error occurred during speech recognition. Please check your internet connection.'
    case 'no-speech':
      return 'No speech was detected. Please speak clearly and try again.'
    case 'aborted':
      return null // silent — user stopped it
    default:
      return `Speech recognition error: ${errorCode}`
  }
}

/**
 * useSpeechRecognition hook
 *
 * @param {object} options
 * @param {function} options.onTranscript   Called with each final transcript chunk
 * @param {string}   options.lang           Language code, default 'en-US'
 */
export function useSpeechRecognition({ onTranscript, lang = 'en-US' } = {}) {
  const recognitionRef = useRef(null)
  const [isRecording, setIsRecording] = useState(false)
  const [micError, setMicError] = useState('')       // human readable error
  const [micStatus, setMicStatus] = useState('idle') // idle | requesting | active | error | denied
  const [liveTranscript, setLiveTranscript] = useState('')

  // Build and attach the recognition instance
  const buildRecognition = useCallback(() => {
    const API = BROWSER_SUPPORT.api
    if (!API) return null

    const rec = new API()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = lang

    rec.onstart = () => {
      setIsRecording(true)
      setMicStatus('active')
      setMicError('')
    }

    rec.onresult = (event) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          final += t + ' '
        } else {
          interim += t
        }
      }
      // Show interim in live view
      setLiveTranscript(interim)
      // Emit final chunks upstream
      if (final && typeof onTranscript === 'function') {
        onTranscript(final)
      }
    }

    rec.onerror = (event) => {
      const msg = mapRecognitionError(event.error)
      if (msg) {
        setMicError(msg)
        setMicStatus(event.error === 'not-allowed' ? 'denied' : 'error')
      }
      setIsRecording(false)
    }

    rec.onend = () => {
      setIsRecording(false)
      setLiveTranscript('')
      if (micStatus === 'active') setMicStatus('idle')
    }

    return rec
  }, [lang, onTranscript, micStatus])

  const startRecording = useCallback(async () => {
    if (!BROWSER_SUPPORT.supported) {
      setMicError('Speech Recognition is not supported in this browser. Please use Chrome or Edge, or type your answer below.')
      setMicStatus('error')
      return
    }

    // Pre-flight mic permission check (where supported)
    if (navigator.permissions) {
      try {
        setMicStatus('requesting')
        const result = await navigator.permissions.query({ name: 'microphone' })
        if (result.state === 'denied') {
          setMicError('Microphone permission is blocked. Please allow it in your browser settings and reload.')
          setMicStatus('denied')
          return
        }
      } catch (_) {
        // permissions API not available — proceed anyway
      }
    }

    try {
      if (!recognitionRef.current) {
        recognitionRef.current = buildRecognition()
      }
      setLiveTranscript('')
      recognitionRef.current.start()
    } catch (err) {
      // InvalidStateError means it's already running
      if (err.name !== 'InvalidStateError') {
        setMicError('Could not start speech recognition. Please try again.')
        setMicStatus('error')
      }
    }
  }, [buildRecognition])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (_) {}
    }
    setIsRecording(false)
    setLiveTranscript('')
    setMicStatus('idle')
  }, [])

  const resetMicError = useCallback(() => {
    setMicError('')
    setMicStatus('idle')
  }, [])

  // Rebuild recognition when question changes (caller resets key)
  const resetRecognition = useCallback(() => {
    stopRecording()
    recognitionRef.current = null
    setLiveTranscript('')
  }, [stopRecording])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort() } catch (_) {}
      }
    }
  }, [])

  return {
    isRecording,
    micError,
    micStatus,
    liveTranscript,
    startRecording,
    stopRecording,
    resetRecognition,
    resetMicError,
    browserSupport: BROWSER_SUPPORT,
  }
}
