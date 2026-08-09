"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface FigmaConnectionCardProps {
  isConnected: boolean;
  figmaUserName: string | null;
  returnUrl: string;
}

/**
 * Shows either a "Connect Figma" CTA or a "Connected as..." indicator
 * with a disconnect option.
 */
export function FigmaConnectionCard({
  isConnected,
  figmaUserName,
  returnUrl,
}: FigmaConnectionCardProps) {
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  async function handleDisconnect() {
    setIsDisconnecting(true);
    try {
      const response = await fetch("/api/figma/disconnect", {
        method: "POST",
      });

      if (response.ok) {
        // Hard reload to refresh server-fetched connection state
        window.location.reload();
      }
    } catch {
      setIsDisconnecting(false);
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">
              Connect Figma
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Link your Figma account to import prototype frames
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => {
              const url = new URL("/api/auth/figma", window.location.origin);
              url.searchParams.set("returnUrl", returnUrl);
              window.location.href = url.toString();
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 3H9v6h6V3z" />
              <path d="M9 9H3v6h6V9z" />
              <path d="M9 15H3v3a3 3 0 003 3h3v-6z" />
              <path d="M15 9H9v6h6V9z" />
              <path d="M15 3h3a3 3 0 010 6h-3V3z" />
            </svg>
            Connect Figma
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Connected indicator */}
          <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-text-primary">
              Connected as {figmaUserName ?? "Figma user"}
            </p>
            <p className="text-xs text-text-muted">
              Your Figma account is linked
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDisconnect}
          disabled={isDisconnecting}
        >
          {isDisconnecting ? "Disconnecting…" : "Disconnect"}
        </Button>
      </div>
    </Card>
  );
}
