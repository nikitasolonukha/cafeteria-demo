"use client";

import { useState } from "react";
import { Button } from "./ui";
import { sheetForAttachment } from "@/lib/documents";
import type { BenefitAttachment } from "@/lib/types";

export function DocumentPreview({
  attachment,
  onClose,
}: {
  attachment: BenefitAttachment;
  onClose: () => void;
}) {
  const sheet = sheetForAttachment(attachment);
  const [copied, setCopied] = useState(false);

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-ink/25 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="doc-title"
        className="mx-auto mt-8 w-full max-w-2xl border border-ink bg-surface p-6"
      >
        <p className="text-sm text-muted">{sheet.kicker}</p>
        <h2 id="doc-title" className="mt-1 text-xl font-semibold">
          {sheet.title}
        </h2>
        {sheet.kind === "image" ? (
          <div className="mt-5 border border-line bg-paper px-6 py-16 text-center">
            <p className="text-base font-medium">{sheet.title}</p>
            <p className="mt-2 text-sm text-muted">Макет 1600×900 · витрина Альтаир</p>
          </div>
        ) : (
          <div className="mt-5 border border-line bg-paper p-5">
            <p className="text-xs text-muted">PDF · 2 стр.</p>
            <div className="mt-3 space-y-3 text-base leading-relaxed">
              {sheet.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
        )}
        {sheet.kind === "image" ? (
          <div className="mt-4 space-y-2 text-base leading-relaxed text-muted">
            {sheet.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-2">
          <Button
            variant="primary"
            onClick={async () => {
              const text = [sheet.title, sheet.kicker, ...sheet.paragraphs].join(
                "\n\n",
              );
              try {
                await navigator.clipboard.writeText(text);
              } catch {
                /* ignore */
              }
              setCopied(true);
            }}
          >
            {copied ? "Текст скопирован" : "Скопировать текст"}
          </Button>
          <Button onClick={onClose}>Закрыть</Button>
        </div>
      </div>
    </div>
  );
}

export function fileAsAttachment(name: string): BenefitAttachment {
  const image = /\.(png|jpe?g|webp|gif)$/i.test(name);
  return {
    id: `file-${name}`,
    title: name,
    kind: image ? "image" : "pdf",
    href: name,
  };
}

export function AttachmentButtons({
  items,
}: {
  items: BenefitAttachment[];
}) {
  const [open, setOpen] = useState<BenefitAttachment | null>(null);
  if (!items.length) return null;
  return (
    <>
      <ul className="mt-2 space-y-1 text-sm">
        {items.map((a) => (
          <li key={a.id}>
            <button
              type="button"
              className="text-left text-ink underline-offset-2 hover:underline"
              onClick={() => setOpen(a)}
            >
              {a.title} ({a.kind === "pdf" ? "PDF" : "изображение"})
            </button>
          </li>
        ))}
      </ul>
      {open ? (
        <DocumentPreview attachment={open} onClose={() => setOpen(null)} />
      ) : null}
    </>
  );
}

export function FilenameButtons({ names }: { names: string[] }) {
  const [open, setOpen] = useState<string | null>(null);
  if (!names.length) return null;
  return (
    <>
      <ul className="mt-2 space-y-1 text-sm">
        {names.map((name) => (
          <li key={name}>
            <button
              type="button"
              className="text-left text-ink underline-offset-2 hover:underline"
              onClick={() => setOpen(name)}
            >
              {name}
            </button>
          </li>
        ))}
      </ul>
      {open ? (
        <DocumentPreview
          attachment={fileAsAttachment(open)}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </>
  );
}
