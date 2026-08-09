import React from "react";
import { Series, useCurrentFrame, interpolate } from "remotion";
import type { RemotionCompositionProps, RemotionShot } from "./types";
import { CameraMoveWrapper } from "./components/CameraMove";
import { DeviceFrame } from "./components/DeviceFrame";
import { CaptionOverlay } from "./components/CaptionOverlay";

const ShotItem: React.FC<{
  shot: RemotionShot;
  stylePreset: string;
}> = ({ shot, stylePreset }) => {
  const frame = useCurrentFrame();

  // Handle transitionIn === "fade" (first 10 frames fade in from black)
  const fadeInOpacity =
    shot.transitionIn === "fade"
      ? interpolate(frame, [0, 10], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;

  return (
    <div className="w-full h-full relative bg-[#0a0a0a]" style={{ opacity: fadeInOpacity }}>
      <CameraMoveWrapper move={shot.cameraMove} durationInFrames={shot.durationInFrames}>
        <DeviceFrame imageUrl={shot.imageUrl} frameName={shot.frameName} />
      </CameraMoveWrapper>

      <CaptionOverlay
        caption={shot.caption}
        stylePreset={stylePreset}
        durationInFrames={shot.durationInFrames}
      />
    </div>
  );
};

export const UIAnimatorComposition: React.FC<RemotionCompositionProps> = ({
  shots,
  stylePreset,
}) => {
  if (!shots || shots.length === 0) {
    return (
      <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center text-[#f5f5f5]">
        No shots provided
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#0a0a0a] relative overflow-hidden font-sans">
      <Series>
        {shots.map((shot, idx) => (
          <Series.Sequence
            key={shot.shotId ?? `shot-${idx}`}
            durationInFrames={Math.max(1, shot.durationInFrames)}
          >
            <ShotItem shot={shot} stylePreset={stylePreset} />
          </Series.Sequence>
        ))}
      </Series>
    </div>
  );
};
