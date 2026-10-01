"use client";

import { useState } from "react";
import { Button, Field, Input, PageHeader } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function NewsPage() {
  const { me, state, commentNews } = useStore();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);

  if (!me) return null;
  if (!state.settings.news) {
    return (
      <div>
        <PageHeader title="Новости" lead="Раздел выключен." />
      </div>
    );
  }

  const published = state.news.filter((n) => n.published);

  return (
    <div>
      <PageHeader title="Новости" lead="Комментарии видит HR и может скрыть." />
      {msg ? <p className="mb-4 text-sm text-danger">{msg}</p> : null}
      <ul className="space-y-4">
        {published.map((n) => (
          <li id={n.id} key={n.id} className="border border-line bg-surface p-5">
            <p className="text-sm font-medium">{n.title}</p>
            <p className="mt-1 text-xs text-muted">{formatDateTime(n.at)}</p>
            <p className="text-pretty mt-3 text-sm text-muted">{n.body}</p>
            <ul className="mt-4 space-y-2 border-t border-line pt-3">
              {n.comments
                .filter((c) => !c.hidden)
                .map((c) => {
                  const author = state.people.find((p) => p.id === c.personId);
                  return (
                    <li key={c.id} className="text-sm">
                      <span className="font-medium">{author?.name ?? "Сотрудник"}</span>
                      <span className="text-muted"> · {formatDateTime(c.at)}</span>
                      <p className="mt-1 text-muted">{c.body}</p>
                    </li>
                  );
                })}
            </ul>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <Field label="Комментарий">
                <Input
                  value={drafts[n.id] ?? "Спасибо, полезно для выбора пакета."}
                  onChange={(e) =>
                    setDrafts((d) => ({ ...d, [n.id]: e.target.value }))
                  }
                />
              </Field>
              <Button
                onClick={() => {
                  const res = commentNews(
                    n.id,
                    drafts[n.id] ?? "Спасибо, полезно для выбора пакета.",
                  );
                  if (!res.ok) setMsg(res.reason);
                  else {
                    setDrafts((d) => ({
                      ...d,
                      [n.id]: "Принято, спасибо.",
                    }));
                    setMsg(null);
                  }
                }}
              >
                Отправить
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
