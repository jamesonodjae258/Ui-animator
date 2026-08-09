import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import type { CameraMove } from "@/lib/shot-planner/types";

interface CameraMoveWrapperProps {
  move: CameraMove;
  durationInFrames: number;
  children: React.ReactNode;
}

export const CameraMoveWrapper: React.FC<CameraMoveWrapperProps> = ({
  move,
  durationInFrames,
  children,
}) => {
  const frame = useCurrentFrame();

  let scale = 1.0;
  let translateX = 0;
  let translateY = 0;

  const progress = interpolate(frame, [0, Math.max(1, durationInFrames - 1)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.25, 0.1, 0.25, 1.0), // Smooth cubic-bezier
  });

  switch (move) {
    case "zoom_in_center":
      scale = interpolate(progress, [0, 1], [1.0, 1.15]);
      break;

    case "zoom_out":
      scale = interpolate(progress, [0, 1], [1.15, 1.0]);
      break;

    case "pan_left_to_right":
      scale = 1.12; // Slight scale up so background edges stay hidden during pan
      translateX = interpolate(progress, [0, 1], [-4, 4]);
      break;

    case "ken_burns_subtle":
      scale = interpolate(progress, [0, 1], [1.0, 1.08]);
      translateX = interpolate(progress, [0, 1], [-2, 2]);
      translateY = interpolate(progress, [0, 1], [-1, 1]);
      break;

    case "static_hold":
    default:
      scale = 1.0;
      break;
  }

  return (
    <div className="w-full h-full overflow-hidden bg-[#0a0a0a]">
      <div
        className="w-full h-full"
        style={{
          transform: `scale(${scale}) translate(${translateX}%, ${translateY}%)`,
          transformOrigin: "center center",
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  );
};
