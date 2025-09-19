"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// Lightweight top progress bar for App Router navigations.
// Shows a thin animated bar for a short duration on route changes.
export default function RouteProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Trigger on every pathname change
    setActive(true);
    // Keep it visible at least 600ms to avoid flicker
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setActive(false);
    }, 800);

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [pathname]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5">
      <div
        className={`h-full bg-primary transition-all duration-500 ${
          active ? "w-full opacity-100" : "w-0 opacity-0"
        }`}
      />
    </div>
  );
}
