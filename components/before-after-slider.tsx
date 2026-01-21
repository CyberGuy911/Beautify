"use client"

import {
  ReactCompareSlider,
  ReactCompareSliderImage,
  ReactCompareSliderHandle,
} from "react-compare-slider"

interface BeforeAfterSliderProps {
  beforeSrc: string
  afterSrc: string
}

export function BeforeAfterSlider({ beforeSrc, afterSrc }: BeforeAfterSliderProps) {
  return (
    <div className="relative group">
      {/* Glow effect on hover */}
      <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-accent/20 via-accent-copper/20 to-accent/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <ReactCompareSlider
        className="relative max-w-full max-h-[55vh] rounded-xl overflow-hidden"
        itemOne={
          <ReactCompareSliderImage
            src={beforeSrc}
            alt="Original"
            style={{ objectFit: "contain" }}
          />
        }
        itemTwo={
          <ReactCompareSliderImage
            src={afterSrc}
            alt="Transformed"
            style={{ objectFit: "contain" }}
          />
        }
        handle={
          <ReactCompareSliderHandle
            buttonStyle={{
              backdropFilter: "blur(8px)",
              background: "linear-gradient(135deg, rgba(212, 175, 55, 0.9), rgba(184, 115, 51, 0.9))",
              border: "none",
              width: 44,
              height: 44,
              boxShadow: "0 4px 20px rgba(212, 175, 55, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
              cursor: "ew-resize",
            }}
            linesStyle={{
              color: "#d4af37",
              width: 3,
              opacity: 0.8,
            }}
          />
        }
        position={50}
        style={{
          maxWidth: "100%",
          maxHeight: "55vh",
        }}
      />

      {/* Labels */}
      <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10">
        <span className="text-xs text-white/70 font-medium tracking-wide uppercase">Original</span>
      </div>
      <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-accent/20 backdrop-blur-sm border border-accent/30">
        <span className="text-xs text-accent font-medium tracking-wide uppercase">Transformed</span>
      </div>
    </div>
  )
}
