"use client";

import { useEffect, useState } from "react";

export function Notice({
  tone = "ok",
  children,
  onClear,
}: {
  tone?: "ok" | "danger" | "muted";
  children: React.ReactNode;
  onClear?: () => void;
}) {
  const color =
    tone === "danger" ? "text-danger" : tone === "ok" ? "text-pine" : "text-muted";

  useEffect(() => {
    if (!onClear) return;
    const t = window.setTimeout(onClear, 4500);
    return () => window.clearTimeout(t);
  }, [onClear, children]);

  return (
    <p
      role="status"
      aria-live="polite"
      className={`border border-line bg-surface px-4 py-3 text-base ${color}`}
    >
      {children}
    </p>
  );
}

export function useFlash() {
  const [message, setMessage] = useState<{
    text: string;
    tone: "ok" | "danger" | "muted";
  } | null>(null);

  return {
    message,
    flash: (text: string, tone: "ok" | "danger" | "muted" = "ok") =>
      setMessage({ text, tone }),
    clear: () => setMessage(null),
  };
}
