"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { UploadZone } from "@/components/upload-zone"

export default function Home() {
  const handleFileAccepted = (file: File) => {
    // Temporary: log file to console for verification
    console.log("File accepted:", file.name, file.type, file.size)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h1 className="text-xl font-semibold text-accent">Beautify</h1>
        <ThemeToggle />
      </header>

      {/* Main content area */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">
            Transform Your Photos
          </h2>
          <p className="text-muted max-w-md mx-auto">
            Upload an image and watch it transform into a mystical cosmic portrait.
          </p>
          {/* Upload zone */}
          <div className="mt-8">
            <UploadZone onFileAccepted={handleFileAccepted} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-muted border-t border-border">
        <p>
          Built with{" "}
          <span className="text-accent">Gemini</span> AI
        </p>
      </footer>
    </div>
  )
}
