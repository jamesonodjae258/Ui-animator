import React from "react";
import { Img } from "remotion";

interface DeviceFrameProps {
  imageUrl: string;
  frameName: string;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ imageUrl, frameName }) => {
  return (
    <div className="w-full h-full flex items-center justify-center p-8 bg-[#0a0a0a]">
      <div className="w-full max-w-[90%] max-h-[85%] bg-[#141414] border border-[#262626] rounded-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Browser Chrome Header */}
        <div className="h-8 bg-[#1f1f1f] border-b border-[#262626] px-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#404040]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#404040]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#404040]" />
          </div>
          <div className="text-[11px] font-sans text-[#a3a3a3] truncate max-w-[200px]">
            {frameName}
          </div>
          <div className="w-10" />
        </div>

        {/* Frame Image Container */}
        <div className="relative flex-1 bg-[#0a0a0a] overflow-hidden flex items-center justify-center">
          <Img
            src={imageUrl}
            alt={frameName}
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};
