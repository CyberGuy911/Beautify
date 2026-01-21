"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Upload, Loader2, Download, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounterRef = useRef(0)

  const handleFile = useCallback(
    (file: File) => {
      // Clear previous state
      setError(null)
      setPreviewUrl(null)
      setFileName(null)

      if (!isValidFileType(file)) {
        setError("Please upload a JPEG, PNG, or WebP image")
        return
      }

      // Start loading
      setIsLoading(true)
      setFileName(file.name)

      // Read file as data URL for preview
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

      // Notify parent if callback provided
      onFileAccepted?.(file)
    },
    [onFileAccepted]
  )

  const handleReset = useCallback(() => {
    setPreviewUrl(null)
    setFileName(null)
    setError(null)
    setIsLoading(false)
  }, [])

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

  // Attach document-level drag listeners
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
    // Reset input so the same file can be selected again
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-all duration-300"
          style={{
            border: "3px dashed var(--color-accent)",
          }}
        >
          <div className="text-center space-y-4">
            <Upload className="h-16 w-16 mx-auto text-accent animate-pulse" />
            <p className="text-xl font-medium text-foreground">
              Drop your image here
            </p>
          </div>
        </div>
      )}

      {/* Upload zone content */}
      <div className="w-full max-w-md flex flex-col items-center gap-4">
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
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-12 w-12 text-accent animate-spin" />
            <p className="text-sm text-muted">Loading preview...</p>
          </div>
        )}

        {/* Preview state */}
        {previewUrl && !isLoading && (
          <div className="flex flex-col items-center gap-6 w-full animate-in fade-in duration-300">
            {/* Preview image */}
            <div className="relative w-full flex justify-center">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg dark:shadow-accent/10"
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button asChild>
                <a href={previewUrl} download={fileName || "image"}>
                  <Download className="h-4 w-4" />
                  Download
                </a>
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RefreshCw className="h-4 w-4" />
                New
              </Button>
            </div>
          </div>
        )}

        {/* Upload state (default) */}
        {!previewUrl && !isLoading && (
          <>
            {/* Upload button */}
            <Button
              onClick={handleButtonClick}
              disabled={disabled}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload
            </Button>

            {/* Accepted formats hint */}
            <p className="text-sm text-muted">
              JPEG, PNG, or WebP
            </p>
          </>
        )}

        {/* Error message */}
        {error && (
          <p className="text-sm text-red-500 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    </>
  )
}
