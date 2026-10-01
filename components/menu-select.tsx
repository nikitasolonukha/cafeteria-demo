"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export type MenuOption = {
  value: string;
  label: string;
  meta?: string;
};

type PanelPos = {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  maxHeight: number;
};

function measurePanel(
  trigger: HTMLElement,
  align: "start" | "end",
): PanelPos {
  const rect = trigger.getBoundingClientRect();
  const gap = 6;
  const pad = 12;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const below = vh - rect.bottom - gap - pad;
  const above = rect.top - gap - pad;
  const openUp = below < 240 && above > below;
  const maxHeight = Math.max(160, Math.floor(openUp ? above : below));
  const width = Math.min(
    Math.max(rect.width, 280),
    Math.min(360, vw - pad * 2),
  );
  let left = align === "end" ? rect.right - width : rect.left;
  left = Math.max(pad, Math.min(left, vw - width - pad));
  if (openUp) {
    return { bottom: vh - rect.top + gap, left, width, maxHeight };
  }
  return { top: rect.bottom + gap, left, width, maxHeight };
}

export function MenuSelect({
  value,
  options,
  onChange,
  "aria-label": ariaLabel,
  className = "",
  placeholder = "Выбрать",
  align = "start",
  compactTrigger = false,
}: {
  value: string;
  options: MenuOption[];
  onChange: (value: string) => void;
  "aria-label"?: string;
  className?: string;
  placeholder?: string;
  align?: "start" | "end";
  compactTrigger?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<PanelPos | null>(null);
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value);
  const triggerLabel = compactTrigger
    ? selected?.label.split(" ")[0] ?? placeholder
    : selected
      ? selected.meta
        ? `${selected.label} · ${selected.meta}`
        : selected.label
      : placeholder;

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePos = () => {
    if (!triggerRef.current) return;
    setPos(measurePanel(triggerRef.current, align));
  };

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    updatePos();
  }, [open, align, options.length]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const node = e.target as Node;
      if (rootRef.current?.contains(node)) return;
      if (listRef.current?.contains(node)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", updatePos);
    window.addEventListener("scroll", updatePos, true);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos, true);
    };
  }, [open, align]);

  const panel =
    open && mounted && pos
      ? createPortal(
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            className="menu-panel fixed z-[70] overflow-y-auto overflow-x-hidden py-1"
            style={{
              top: pos.top,
              bottom: pos.bottom,
              left: pos.left,
              width: pos.width,
              maxHeight: pos.maxHeight,
            }}
          >
            {options.map((option) => {
              const active = option.value === value;
              return (
                <li key={option.value} role="option" aria-selected={active}>
                  <button
                    type="button"
                    className={`menu-row flex w-full items-center px-3 py-2.5 text-left text-base ${
                      active ? "menu-row-active" : ""
                    }`}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <span className="min-w-0 truncate">
                      <span className="font-medium">{option.label}</span>
                      {option.meta ? (
                        <span className={active ? "opacity-75" : "text-muted"}>
                          {" "}
                          · {option.meta}
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        className="control-trigger pressable flex h-10 w-full items-center justify-between gap-2 px-3 text-left text-base text-ink"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="min-w-0 truncate font-medium">{triggerLabel}</span>
        <Chevron open={open} />
      </button>
      {panel}
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`shrink-0 text-muted ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function MenuList({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <ul className={`menu-panel divide-y divide-line overflow-hidden ${className}`}>
      {children}
    </ul>
  );
}

export function MenuListButton({
  active = false,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={`menu-row flex w-full items-start justify-between gap-3 px-4 py-4 text-left text-base ${
        active ? "menu-row-active" : ""
      } ${className}`}
      {...props}
    />
  );
}
