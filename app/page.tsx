import { ThemeToggle } from "@/components/theme-toggle"
import { UploadZone } from "@/components/upload-zone"

export default function Home() {
  return (
    <>
      {/* Cosmic animated background */}
      <div className="cosmic-bg">
        <div className="cosmic-orb cosmic-orb-1" />
        <div className="cosmic-orb cosmic-orb-2" />
        <div className="cosmic-orb cosmic-orb-3" />
      </div>

      <div className="min-h-screen flex flex-col relative">
        {/* Header */}
        <header className="relative z-10 flex items-center justify-between px-6 md:px-10 py-6">
          <div className="flex items-center gap-3 animate-fade-in">
            {/* Logo mark */}
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent via-accent-copper to-accent opacity-20 animate-glow-pulse" />
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6 text-accent relative z-10"
                fill="currentColor"
              >
                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
              </svg>
            </div>
            <h1 className="font-[family-name:var(--font-cinzel)] text-2xl font-semibold tracking-wide text-gradient-gold text-glow">
              For Elsa
            </h1>
          </div>
          <ThemeToggle />
        </header>

        {/* Main content area */}
        <main className="flex-1 flex items-center justify-center px-4 md:px-6 pb-8 relative z-10">
          <div className="w-full max-w-3xl mx-auto">
            {/* Hero text */}
            <div className="text-center mb-6 md:mb-8 space-y-4">
              <h2 className="font-[family-name:var(--font-cinzel)] text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight animate-slide-up">
                <span className="text-gradient-gold text-glow">Made</span>
                <br />
                <span className="text-foreground/90">With Love</span>
              </h2>
              <p className="text-muted text-lg md:text-xl max-w-md mx-auto animate-slide-up delay-100 leading-relaxed">
                Something to make your work a little easier, Darlin ♥
              </p>
            </div>

            {/* Upload zone with decorative frame */}
            <div className="relative animate-scale-in delay-200">
              {/* Corner decorations */}
              <div className="corner-decoration top-left" />
              <div className="corner-decoration top-right" />
              <div className="corner-decoration bottom-left" />
              <div className="corner-decoration bottom-right" />

              {/* Glass panel container */}
              <div className="glass-panel rounded-2xl p-4 md:p-6">
                <UploadZone />
              </div>
            </div>

          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 py-6 text-center animate-fade-in delay-300">
          <p className="text-sm text-muted/50 tracking-wide">
            Made with{" "}
            <span className="text-accent/70">♥</span>
            {" "}by Alexander
          </p>
        </footer>
      </div>
    </>
  )
}
