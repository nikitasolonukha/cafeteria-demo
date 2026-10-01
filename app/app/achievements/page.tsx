"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { useStore } from "@/lib/store";

const badgeHref: Record<string, string> = {
  "bdg-order": "/app/catalog",
  "bdg-charity": "/app/charity",
  "bdg-survey": "/app/surveys",
  "bdg-lottery": "/app/lottery",
  "bdg-transfer": "/app/transfers",
  "bdg-pool": "/app/pools",
};

export default function AchievementsPage() {
  const { me, state } = useStore();
  if (!me) return null;
  if (!state.settings.gamification) {
    return (
      <div>
        <PageHeader title="Достижения" lead="Раздел выключен." />
        <Link href="/app" className="text-base text-stamp">
          На главную
        </Link>
      </div>
    );
  }

  const mine = new Set(me.badgeIds ?? []);

  return (
    <div>
      <PageHeader
        title="Достижения"
        lead="Бейджи за активность. Карточка ведёт к соответствующему разделу."
      />
      <ul className="grid gap-3 sm:grid-cols-2">
        {state.badges.map((b) => {
          const got = mine.has(b.id);
          const href = badgeHref[b.id] ?? "/app";
          return (
            <li key={b.id}>
              <Link
                href={href}
                className={`block border p-4 hover:border-ink ${
                  got ? "border-ink bg-surface" : "border-line bg-surface"
                }`}
              >
                <p className="text-sm font-medium">{b.title}</p>
                <p className="mt-1 text-sm text-muted">{b.description}</p>
                <p className={`mt-3 text-xs ${got ? "text-pine" : "text-muted"}`}>
                  {got ? "получен · открыть раздел" : "ещё нет · как получить"}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
