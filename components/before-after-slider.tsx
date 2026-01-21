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
    <ReactCompareSlider
      className="max-w-full max-h-[60vh] rounded-lg shadow-lg dark:shadow-accent/10"
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
            backdropFilter: "blur(4px)",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            border: "2px solid #d4af37",
            width: 36,
            height: 36,
          }}
          linesStyle={{
            color: "#d4af37",
            width: 2,
          }}
        />
      }
      position={50}
      style={{
        maxWidth: "100%",
        maxHeight: "60vh",
      }}
    />
  )
}
