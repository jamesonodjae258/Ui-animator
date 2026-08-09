import React from "react";
import { Composition } from "remotion";
import { UIAnimatorComposition } from "./Composition";
import type { RemotionCompositionProps, RemotionShot } from "./types";

const defaultProps: RemotionCompositionProps = {
  stylePreset: "clean_saas",
  fps: 30,
  totalDurationInFrames: 900, // 30 seconds * 30 fps
  shots: [
    {
      shotId: "s1",
      frameId: "f1",
      frameName: "Dashboard Overview",
      imageUrl: "https://placehold.co/1920x1080/141414/f5f5f5?text=Dashboard",
      narrativeBeat: "hook",
      cameraMove: "zoom_in_center",
      durationInFrames: 180, // 6 seconds
      caption: "Every case, one unified timeline",
      transitionIn: "fade",
    },
    {
      shotId: "s2",
      frameId: "f2",
      frameName: "Inbox View",
      imageUrl: "https://placehold.co/1920x1080/141414/f5f5f5?text=Inbox",
      narrativeBeat: "reveal",
      cameraMove: "pan_left_to_right",
      durationInFrames: 180,
      caption: "Real-time client update feed",
      transitionIn: "fade",
    },
    {
      shotId: "s3",
      frameId: "f3",
      frameName: "Analytics Summary",
      imageUrl: "https://placehold.co/1920x1080/141414/f5f5f5?text=Analytics",
      narrativeBeat: "payoff",
      cameraMove: "zoom_out",
      durationInFrames: 240,
      caption: "Case closed. Nothing missed.",
      transitionIn: "fade",
    },
  ],
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="UIAnimatorVideo"
        component={UIAnimatorComposition}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultProps}
        calculateMetadata={({ props }) => {
          const compProps = props as RemotionCompositionProps;
          const fps = compProps.fps ?? 30;
          const totalMs = (compProps.shots ?? []).reduce(
            (sum: number, shot: RemotionShot) =>
              sum + Math.round((shot.durationInFrames / fps) * 1000),
            0,
          );
          const durationInFrames = Math.max(1, Math.round((totalMs / 1000) * fps));

          return {
            durationInFrames,
            props: compProps,
          };
        }}
      />
    </>
  );
};
