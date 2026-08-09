import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

interface CaptionOverlayProps {
  caption?: string;
  stylePreset: string;
  durationInFrames: number;
}

export const CaptionOverlay: React.FC<CaptionOverlayProps> = ({
  caption,
  stylePreset,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();

  if (!caption || !caption.trim()) return null;

  // Entrance animation (0 - 15 frames)
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const translateY = interpolate(frame, [0, 15], [12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Exit fade (last 10 frames)
  const exitOpacity = interpolate(
    frame,
    [Math.max(0, durationInFrames - 10), durationInFrames],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const finalOpacity = opacity * exitOpacity;

  const isBold = stylePreset === "bold_launch";

  return (
    <div
      className={`absolute inset-x-0 ${
        isBold ? "bottom-12 flex justify-center" : "bottom-8 flex justify-center"
      } px-6 pointer-events-none z-20`}
    >
      <div
        style={{
          opacity: finalOpacity,
          transform: `translateY(${translateY}px)`,
        }}
        className={`${
          isBold
            ? "px-6 py-3 bg-[#0a0a0a]/90 text-[#f5f5f5] text-xl font-bold border border-[#404040]"
            : "px-4 py-2 bg-[#141414]/90 text-[#f5f5f5] text-sm font-medium border border-[#262626]"
        } rounded-lg shadow-lg tracking-tight max-w-[80%] text-center backdrop-blur-md`}
      >
        {caption}
      </div>
    </div>
  );
};
