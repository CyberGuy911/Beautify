"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const ACCEPTED_EXTENSIONS = ".jpg, .jpeg, .png, .webp"

interface UploadZoneProps {
  onFileAccepted: (file: File) => void
  disabled?: boolean
}

function isValidFileType(file: File): boolean {
  return ACCEPTED_TYPES.includes(file.type)
}

export function UploadZone({ onFileAccepted, disabled = false }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounterRef = useRef(0)

  const handleFile = useCallback(
    (file: File) => {
      // Clear previous error
      setError(null)

      if (!isValidFileType(file)) {
        setError("Please upload a JPEG, PNG, or WebP image")
        return
      }

      onFileAccepted(file)
    },
    [onFileAccepted]
  )

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
          disabled={disabled}
        />

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
