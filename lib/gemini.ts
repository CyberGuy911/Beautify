import 'server-only'

import { GoogleGenAI } from '@google/genai'
import { getGeminiApiKey } from '@/lib/data'
import { generateMysticalPrompt } from '@/lib/prompt-engineering'

/**
 * Retry configuration for Gemini API calls
 */
const RETRY_CONFIG = {
  maxRetries: 5,
  baseDelay: 1000,
  maxDelay: 60000
}

/**
 * Error patterns that should trigger a retry
 */
const RETRYABLE_ERRORS = ['429', '503', 'RESOURCE_EXHAUSTED', 'UNAVAILABLE']

/**
 * Check if an error should be retried
 */
function isRetryableError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return RETRYABLE_ERRORS.some(pattern => message.includes(pattern))
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(attempt: number): number {
  const exponentialDelay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt)
  const jitter = Math.random() * 1000
  return Math.min(exponentialDelay + jitter, RETRY_CONFIG.maxDelay)
}

/**
 * Execute a function with exponential backoff retry logic
 */
async function callWithRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Don't retry if it's not a retryable error
      if (!isRetryableError(error)) {
        throw error
      }

      // Don't retry if we've exhausted attempts
      if (attempt === RETRY_CONFIG.maxRetries) {
        throw error
      }

      // Wait before retrying
      const delay = calculateDelay(attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

/**
 * Transform result type
 */
export interface TransformResult {
  success: boolean
  transformedImage?: string
  error?: string
}

/**
 * Map error to user-friendly message
 */
function getErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)

  if (message.includes('429') || message.includes('RESOURCE_EXHAUSTED')) {
    return 'Service is busy. Please try again in a moment.'
  }

  if (message.includes('503') || message.includes('UNAVAILABLE')) {
    return 'Service temporarily unavailable. Please try again.'
  }

  if (message.includes('403') || message.includes('PERMISSION_DENIED')) {
    return 'API authentication failed. Please contact support.'
  }

  if (message.includes('GEMINI_API_KEY is not configured')) {
    return message
  }

  return 'Transformation failed. Please try again.'
}

/**
 * Transform an image using Gemini API
 *
 * @param imageBase64 - Base64 encoded image (with or without data URI prefix)
 * @param mimeType - Image MIME type (e.g., 'image/jpeg', 'image/png')
 * @returns Transform result with success status and transformed image or error
 */
export async function transformImage(
  imageBase64: string,
  mimeType: string
): Promise<TransformResult> {
  try {
    // Get API key (will throw if not configured)
    const apiKey = getGeminiApiKey()

    // Initialize the client
    const genAI = new GoogleGenAI({ apiKey })

    // Strip data URI prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')

    // Get the transformation prompt
    const prompt = generateMysticalPrompt()

    // Call Gemini API with retry logic
    const response = await callWithRetry(async () => {
      return await genAI.models.generateContent({
        model: 'gemini-2.0-pro-exp-image-generation',
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: base64Data
                }
              }
            ]
          }
        ],
        config: {
          responseModalities: ['image', 'text']
        }
      })
    })

    // Check for input safety block
    if (response.promptFeedback?.blockReason) {
      return {
        success: false,
        error: `Image was blocked: ${response.promptFeedback.blockReason}. Please try a different image.`
      }
    }

    // Check for output safety block
    const candidate = response.candidates?.[0]
    if (candidate?.finishReason === 'SAFETY') {
      return {
        success: false,
        error: 'Generated image was blocked by safety filters. Please try a different image.'
      }
    }

    // Extract transformed image from response
    const parts = candidate?.content?.parts
    if (!parts || parts.length === 0) {
      return {
        success: false,
        error: 'No image was generated. Please try again.'
      }
    }

    // Find the image part in the response
    const imagePart = parts.find(part => part.inlineData?.data)
    if (!imagePart?.inlineData?.data) {
      return {
        success: false,
        error: 'No image data in response. Please try again.'
      }
    }

    // Return with data URI prefix
    const transformedData = imagePart.inlineData.data
    const responseMimeType = imagePart.inlineData.mimeType || 'image/png'

    return {
      success: true,
      transformedImage: `data:${responseMimeType};base64,${transformedData}`
    }
  } catch (error) {
    console.error('Gemini transform error:', error)
    return {
      success: false,
      error: getErrorMessage(error)
    }
  }
}
