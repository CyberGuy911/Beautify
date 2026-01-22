"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Upload, Loader2, Download, RefreshCw, Sparkles, ImageIcon } from "lucide-react"
import { SparkleEffect } from "@/components/sparkle-effect"
import { BeforeAfterSlider } from "@/components/before-after-slider"

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const ACCEPTED_EXTENSIONS = ".jpg, .jpeg, .png, .webp"

interface UploadZoneProps {
  onFileAccepted?: (file: File) => void
  disabled?: boolean
}

function isValidFileType(file: File): boolean {
  return ACCEPTED_TYPES.includes(file.type)
}

export function UploadZone({ onFileAccepted, disabled = false }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isTransforming, setIsTransforming] = useState(false)
  const [transformedUrl, setTransformedUrl] = useState<string | null>(null)
  const [transformError, setTransformError] = useState<string | null>(null)
  const [showSparkles, setShowSparkles] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounterRef = useRef(0)

  const handleFile = useCallback(
    (file: File) => {
      setError(null)
      setPreviewUrl(null)
      setFileName(null)

      if (!isValidFileType(file)) {
        setError("Please upload a JPEG, PNG, or WebP image")
        return
      }

      setIsLoading(true)
      setFileName(file.name)

      const reader = new FileReader()
      reader.onload = () => {
        setPreviewUrl(reader.result as string)
        setIsLoading(false)
      }
      reader.onerror = () => {
        setError("Failed to read file")
        setIsLoading(false)
      }
      reader.readAsDataURL(file)

      onFileAccepted?.(file)
    },
    [onFileAccepted]
  )

  const handleReset = useCallback(() => {
    setPreviewUrl(null)
    setFileName(null)
    setError(null)
    setIsLoading(false)
    setTransformedUrl(null)
    setTransformError(null)
    setIsTransforming(false)
    setShowSparkles(false)
  }, [])

  const handleTransform = useCallback(async () => {
    if (!previewUrl) return

    setIsTransforming(true)
    setTransformError(null)

    try {
      const response = await fetch('/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: previewUrl }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`)
      }

      if (result.success) {
        setTransformedUrl(result.transformedImage)
        setShowSparkles(true)
        setTimeout(() => setShowSparkles(false), 3000)
      } else {
        throw new Error(result.error || 'Transformation failed')
      }
    } catch (err) {
      setTransformError(err instanceof Error ? err.message : 'Transformation failed')
    } finally {
      setIsTransforming(false)
    }
  }, [previewUrl])

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      setIsDragging(false)
      dragCounterRef.current = 0

      if (disabled) return

      const files = e.dataTransfer?.files
      if (files && files.length > 0) {
        handleFile(files[0])
      }
    },
    [disabled, handleFile]
  )

  const handleDragEnter = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (disabled) return

      dragCounterRef.current++
      if (dragCounterRef.current === 1) {
        setIsDragging(true)
      }
    },
    [disabled]
  )

  const handleDragLeave = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      dragCounterRef.current--
      if (dragCounterRef.current === 0) {
        setIsDragging(false)
      }
    },
    []
  )

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  useEffect(() => {
    document.addEventListener("dragenter", handleDragEnter)
    document.addEventListener("dragleave", handleDragLeave)
    document.addEventListener("dragover", handleDragOver)
    document.addEventListener("drop", handleDrop)

    return () => {
      document.removeEventListener("dragenter", handleDragEnter)
      document.removeEventListener("dragleave", handleDragLeave)
      document.removeEventListener("dragover", handleDragOver)
      document.removeEventListener("drop", handleDrop)
    }
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
    e.target.value = ""
  }

  const handleButtonClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  return (
    <>
      {/* Full-viewport drag overlay */}
      {isDragging && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300"
          style={{
            background: "radial-gradient(ellipse at center, rgba(3, 0, 20, 0.9) 0%, rgba(3, 0, 20, 0.95) 100%)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="text-center space-y-6 animate-scale-in">
            <div className="relative inline-block">
              <div className="absolute inset-0 rounded-full bg-accent/20 blur-2xl animate-glow-pulse" />
              <div className="relative w-24 h-24 rounded-full border-2 border-dashed border-accent/50 flex items-center justify-center">
                <Upload className="h-10 w-10 text-accent animate-pulse" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-[family-name:var(--font-cinzel)] text-gradient-gold text-glow">
                Release to Upload
              </p>
              <p className="text-muted/60 mt-2 text-sm">
                Drop your image to begin the transformation
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload zone content */}
      <div className="w-full flex flex-col items-center gap-6">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled || isLoading}
        />

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center gap-6 py-12">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-accent/20 blur-xl animate-glow-pulse" />
              <Loader2 className="h-12 w-12 text-accent animate-spin relative z-10" />
            </div>
            <p className="text-muted/70 text-sm tracking-wide">Preparing your image...</p>
          </div>
        )}

        {/* Preview state */}
        {previewUrl && !isLoading && (
          <div className="flex flex-col items-center gap-8 w-full animate-fade-in">
            {/* Preview or transformed image with comparison slider */}
            <div className="relative w-full flex justify-center">
              <div className="relative image-frame active">
                {transformedUrl ? (
                  <BeforeAfterSlider beforeSrc={previewUrl} afterSrc={transformedUrl} />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className={`max-w-full max-h-[55vh] object-contain rounded-xl transition-all duration-500 ${isTransforming ? 'opacity-40 scale-[0.99]' : 'opacity-100'}`}
                  />
                )}

                {/* Progress overlay */}
                {isTransforming && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center progress-overlay rounded-xl">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 rounded-full bg-accent/30 blur-2xl animate-glow-pulse" />
                      <div className="relative w-20 h-20 rounded-full border border-accent/30 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 text-accent animate-spin" />
                      </div>
                    </div>
                    <p className="text-white/90 text-lg font-[family-name:var(--font-cinzel)] tracking-wide">
                      Creating with Love
                    </p>
                    <p className="text-white/50 text-sm mt-2">
                      Making something beautiful...
                    </p>
                    {/* Animated dots */}
                    <div className="flex gap-1.5 mt-4">
                      <div className="w-2 h-2 rounded-full bg-accent/60 animate-pulse" style={{ animationDelay: '0s' }} />
                      <div className="w-2 h-2 rounded-full bg-accent/60 animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 rounded-full bg-accent/60 animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                )}

                {/* Sparkle effect on completion */}
                <SparkleEffect active={showSparkles} />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 animate-slide-up">
              {!transformedUrl && (
                <button
                  onClick={handleTransform}
                  disabled={isTransforming}
                  className="btn-cosmic px-8 py-3 rounded-xl flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTransforming ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Sparkles className="h-5 w-5" />
                  )}
                  <span className="text-sm font-semibold">
                    {isTransforming ? 'Creating...' : 'Beautify'}
                  </span>
                </button>
              )}
              {transformedUrl && (
                <a
                  href={transformedUrl}
                  download={`MsFrozen-${fileName?.replace(/\.[^/.]+$/, '') || 'image'}.jpg`}
                  className="btn-cosmic px-8 py-3 rounded-xl flex items-center gap-3"
                >
                  <Download className="h-5 w-5" />
                  <span className="text-sm font-semibold">Download</span>
                </a>
              )}
              <button
                onClick={handleReset}
                className="btn-ghost-cosmic px-6 py-3 rounded-xl flex items-center gap-3"
              >
                <RefreshCw className="h-5 w-5" />
                <span className="text-sm font-medium">New</span>
              </button>
            </div>

            {/* Transform error message */}
            {transformError && (
              <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400" role="alert">
                  {transformError}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Upload state (default) */}
        {!previewUrl && !isLoading && (
          <div className="w-full">
            {/* Clickable upload zone */}
            <button
              onClick={handleButtonClick}
              disabled={disabled}
              className="upload-zone w-full py-16 px-8 flex flex-col items-center gap-6 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 group"
            >
              {/* Upload icon with glow */}
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-accent/10 blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative w-20 h-20 rounded-full border border-accent/20 flex items-center justify-center group-hover:border-accent/40 transition-colors duration-300">
                  <ImageIcon className="h-8 w-8 text-accent/60 group-hover:text-accent transition-colors duration-300" />
                </div>
              </div>

              {/* Text */}
              <div className="text-center space-y-2">
                <p className="text-foreground/80 font-medium text-lg">
                  Drop your image here
                </p>
                <p className="text-muted/50 text-sm">
                  or click to browse
                </p>
              </div>

              {/* Format hint */}
              <div className="flex items-center gap-3 text-xs text-muted/40">
                <span className="px-2 py-1 rounded-md bg-accent/5 border border-accent/10">JPG</span>
                <span className="px-2 py-1 rounded-md bg-accent/5 border border-accent/10">PNG</span>
                <span className="px-2 py-1 rounded-md bg-accent/5 border border-accent/10">WebP</span>
              </div>
            </button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          </div>
        )}
      </div>
    </>
  )
}
