import { useRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";

export function Button({
  variant = "secondary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const base =
    "pressable inline-flex h-10 items-center justify-center gap-2 rounded-[8px] px-4 text-base font-medium disabled:cursor-not-allowed disabled:opacity-45";
  const styles = {
    primary: "bg-stamp text-stamp-ink hover:brightness-[0.96]",
    secondary: "border border-line bg-surface text-ink hover:bg-paper",
    ghost: "text-ink hover:bg-surface",
    danger: "border border-danger/40 bg-surface text-danger hover:bg-paper",
  }[variant];
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2 text-base">
      <span className="text-muted">{label}</span>
      {children}
    </label>
  );
}

export function FilePickButton({
  onName,
}: {
  onName: (name: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <span className="inline-flex shrink-0">
      <input
        ref={ref}
        type="file"
        className="hidden"
        aria-hidden
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onName(file.name);
          e.target.value = "";
        }}
      />
      <Button type="button" onClick={() => ref.current?.click()}>
        Выбрать файл
      </Button>
    </span>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`control-field ${props.className ?? ""}`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`control-field ${props.className ?? ""}`}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-28 w-full rounded-[8px] border border-line bg-surface px-3.5 py-3 text-base text-ink placeholder:text-muted/70 hover:bg-paper ${props.className ?? ""}`}
    />
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`ui-panel ${className}`}>{children}</div>
  );
}

export function PageHeader({
  title,
  lead,
  actions,
}: {
  title: string;
  lead?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-ink">
          {title}
        </h1>
        {lead ? (
          <p className="text-pretty mt-2 max-w-2xl text-base leading-relaxed text-muted">
            {lead}
          </p>
        ) : null}
      </div>
      {actions}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="border border-dashed border-line bg-surface px-5 py-10 text-base leading-relaxed text-muted">
      {children}
    </div>
  );
}

export function Points({
  value,
  size = "md",
  accent = false,
}: {
  value: number;
  size?: "sm" | "md" | "lg" | "hero";
  accent?: boolean;
}) {
  const sizeClass = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
    hero: "text-6xl md:text-7xl",
  }[size];
  return (
    <span
      className={`font-points tabular-nums ${sizeClass} ${accent ? "text-stamp" : "text-ink"}`}
    >
      {new Intl.NumberFormat("ru-RU").format(value)}
    </span>
  );
}

export function StatusWord({
  children,
  tone = "ink",
}: {
  children: ReactNode;
  tone?: "ink" | "muted" | "pine" | "danger";
}) {
  const color = {
    ink: "text-ink",
    muted: "text-muted",
    pine: "text-pine",
    danger: "text-danger",
  }[tone];
  return <span className={`text-base ${color}`}>{children}</span>;
}

export function Section({
  title,
  lead,
  actions,
  children,
  className = "",
}: {
  title: string;
  lead?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`mt-10 ${className}`}>
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-3">
        <div className="min-w-0">
          <h2 className="text-pretty text-xl font-semibold tracking-tight">{title}</h2>
          {lead ? (
            <p className="text-pretty mt-1 text-base text-muted">{lead}</p>
          ) : null}
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
}
