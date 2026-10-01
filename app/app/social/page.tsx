"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, PageHeader } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function SocialPage() {
  const { me, state, joinSocial } = useStore();
  const [msg, setMsg] = useState<string | null>(null);

  if (!me) return null;
  if (!state.settings.socialProjects) {
    return (
      <div>
        <PageHeader title="Соцпроекты" lead="Раздел выключен." />
        <Link href="/app" className="text-base text-stamp">
          На главную
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Корпоративные инициативы"
        lead="Участие без списания баллов — запись в уведомления."
      />
      {msg ? <p className="mb-4 text-sm text-pine">{msg}</p> : null}
      <ul className="space-y-3">
        {state.socialProjects
          .filter((p) => p.active)
          .map((p) => {
            const joined = (p.joinedIds ?? []).includes(me.id);
            const count = p.joinedIds?.length ?? 0;
            return (
              <li key={p.id} className="border border-line bg-surface p-5">
                <p className="text-sm font-medium">{p.title}</p>
                <p className="mt-2 text-sm text-muted">{p.body}</p>
                <p className="mt-2 text-sm text-muted">
                  Записалось: {count}
                  {joined ? " · вы в списке" : ""}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="primary"
                    onClick={() => {
                      const res = joinSocial(p.id);
                      if (!res.ok) setMsg(res.reason);
                      else
                        setMsg(
                          joined
                            ? `Напоминание отправлено: ${p.title}`
                            : `Вы записаны: ${p.title}`,
                        );
                    }}
                  >
                    {joined ? "Напомнить в ленту" : "Участвовать"}
                  </Button>
                  {joined ? (
                    <Link href="/app/notifications">
                      <Button>К уведомлениям</Button>
                    </Link>
                  ) : null}
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
