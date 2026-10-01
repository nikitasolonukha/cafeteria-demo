"use client";

import Link from "next/link";
import { PageHeader, Points } from "@/components/ui";
import { formatPoints, sectionLabels } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function PromosPage() {
  const { me, state } = useStore();
  if (!me) return null;

  return (
    <div>
      <PageHeader
        title="Акции"
        lead="Кэшбэк начисляется несгораемыми при покупке из подходящего раздела."
      />
      <ul className="space-y-3">
        {state.promos.map((p) => (
          <li key={p.id}>
            <Link
              href="/app/catalog"
              className="block border border-line bg-surface p-5 hover:border-ink"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{p.title}</p>
                  <p className="mt-1 text-sm text-muted">
                    {p.section === "all" ? "Все разделы" : sectionLabels[p.section]} ·{" "}
                    {p.cashbackPct}% · до {p.end}
                  </p>
                </div>
                <p className={`text-sm ${p.active ? "text-pine" : "text-muted"}`}>
                  {p.active ? "активна · в каталог" : "завершена"}
                </p>
              </div>
              <p className="mt-3 text-sm text-muted">
                Бюджет акции: {formatPoints(p.budgetLeft)} · использовано{" "}
                <Points value={p.spent} size="sm" /> · срабатываний {p.redemptions}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/app/catalog" className="mt-4 inline-block text-sm text-muted hover:text-ink">
        В каталог
      </Link>
    </div>
  );
}
