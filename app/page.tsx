import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
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
          {/* Upload area will be added in Phase 2 */}
          <div className="w-full max-w-md h-64 border-2 border-dashed border-border rounded-lg flex items-center justify-center mt-8">
            <p className="text-muted">Upload area coming soon</p>
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
