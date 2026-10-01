"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

export type MenuOption = {
  value: string;
  label: string;
  meta?: string;
};

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
  const rootRef = useRef<HTMLDivElement>(null);
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
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
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

      {open ? (
        <ul
          id={listId}
          role="listbox"
          className={`menu-panel absolute z-50 mt-1 overflow-hidden py-1 ${
            align === "end" ? "right-0" : "left-0"
          }`}
          style={{
            minWidth: "max(100%, 17rem)",
            width: "max-content",
            maxWidth: "min(22rem, calc(100vw - 1.5rem))",
          }}
        >
          {options.map((option) => {
            const active = option.value === value;
            return (
              <li key={option.value} role="option" aria-selected={active}>
                <button
                  type="button"
                  className={`menu-row flex w-full items-center gap-2 whitespace-nowrap px-3 py-3 text-left text-base ${
                    active ? "menu-row-active" : ""
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <span className="font-medium">{option.label}</span>
                  {option.meta ? (
                    <span className={active ? "opacity-75" : "text-muted"}>
                      · {option.meta}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
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
