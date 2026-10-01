"use client";

import { Button, PageHeader } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function AnomaliesPage() {
  const { me, state, resolveAnomaly } = useStore();
  if (!me || (me.role !== "hr" && me.role !== "admin")) return null;

  return (
    <div>
      <PageHeader
        title="Аномалии"
        lead="Подозрительные операции по порогам из настроек. «Блокировать» замораживает баллы."
      />
      <ul className="divide-y divide-line border border-line bg-surface">
        {state.anomalies.map((a) => {
          const person = state.people.find((p) => p.id === a.personId);
          return (
            <li key={a.id} className="px-4 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">
                    {a.rule} · {person?.name ?? a.personId}
                  </p>
                  <p className="mt-1 text-sm text-muted">{a.detail}</p>
                  <p className="mt-1 text-xs text-muted">
                    {formatDateTime(a.at)} · статус {a.status}
                  </p>
                </div>
                {a.status === "open" ? (
                  <div className="flex gap-2">
                    <Button onClick={() => resolveAnomaly(a.id, "ok")}>
                      Легитимно
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => resolveAnomaly(a.id, "blocked")}
                    >
                      Блокировать
                    </Button>
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
        {!state.anomalies.length ? (
          <li className="px-4 py-6 text-sm text-muted">Журнал пуст</li>
        ) : null}
      </ul>
    </div>
  );
}
