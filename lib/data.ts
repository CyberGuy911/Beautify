import 'server-only'

// This file can only be imported in Server Components or API Routes
// Importing in a Client Component will cause a build error

/**
 * Get the Gemini API key from environment variables.
 * This function enforces server-only access to the API key.
 *
 * @throws Error if GEMINI_API_KEY is not configured
 */
export function getGeminiApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey || apiKey === 'your-api-key-here') {
    throw new Error(
      'GEMINI_API_KEY is not configured. ' +
      'Get your key from https://aistudio.google.com/apikey ' +
      'and add it to .env.local'
    )
  }

  return apiKey
}

/**
 * Validate that the environment is properly configured.
 * Call this at app startup to fail fast if misconfigured.
 */
export function validateEnvironment(): void {
  // List all required env vars here
  const required = ['GEMINI_API_KEY']
  const missing = required.filter(
    key => !process.env[key] || process.env[key] === 'your-api-key-here'
  )

  if (missing.length > 0) {
    console.warn(
      `Missing environment variables: ${missing.join(', ')}. ` +
      'Some features will not work until configured.'
    )
  }
}
