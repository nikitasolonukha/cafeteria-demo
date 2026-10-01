"use client";

import { Button, PageHeader } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function IntegrationsPage() {
  const { me, state, pingIntegration } = useStore();
  if (!me || me.role !== "admin") return null;

  return (
    <div>
      <PageHeader
        title="Интеграции"
        lead="Статусы каналов. Реальные 1С/SSO/SMTP/Giftery не вызываются — проверка пишет результат в журнал."
      />
      <ul className="divide-y divide-line border border-line bg-surface">
        {state.integrations.map((i) => (
          <li key={i.id} className="px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{i.title}</p>
                <p className="mt-1 text-sm text-muted">{i.detail}</p>
                {i.lastCheckAt ? (
                  <p className="mt-1 text-sm text-pine">
                    Проверено {formatDateTime(i.lastCheckAt)}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-muted">Ещё не проверяли</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <p
                  className={`text-sm ${
                    i.status === "ok"
                      ? "text-pine"
                      : i.status === "warn"
                        ? "text-ink"
                        : "text-danger"
                  }`}
                >
                  {i.status === "ok"
                    ? "доступен"
                    : i.status === "warn"
                      ? "частично"
                      : "недоступен"}
                </p>
                <Button onClick={() => pingIntegration(i.id)}>Проверить</Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
