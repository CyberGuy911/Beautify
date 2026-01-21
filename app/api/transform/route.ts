import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { validateBase64Image } from '@/lib/image-validation'
import { transformImage } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    // Get client identifier for rate limiting
    const identifier =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // Check rate limit (5 requests per minute)
    const rateLimit = checkRateLimit(identifier, 5, 60000)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Please try again later.'
        },
        { status: 429 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { image } = body

    if (!image || typeof image !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request: image field required'
        },
        { status: 400 }
      )
    }

    // Validate base64 image
    const validation = validateBase64Image(image)
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error || 'Invalid image data'
        },
        { status: 400 }
      )
    }

    // Determine MIME type from data URL prefix
    const mimeTypeMatch = image.match(/^data:(image\/\w+);base64,/)
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg'

    // Call Gemini for real transformation
    const result = await transformImage(image, mimeType)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Transformation failed'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      transformedImage: result.transformedImage
    })
  } catch (error) {
    // Handle JSON parse errors specifically
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body'
        },
        { status: 400 }
      )
    }

    console.error('Transform error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
}
