"use client";

import { Empty, PageHeader } from "@/components/ui";
import { auditActionLabels, formatDateTime } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function AuditPage() {
  const { me, state } = useStore();
  if (!me || (me.role !== "hr" && me.role !== "admin")) return null;

  return (
    <div>
      <PageHeader
        title="Журнал аудита"
        lead="Начисления, заказы, архив и смена окна выбора."
      />
      {state.audit.length === 0 ? (
        <Empty>Пока пусто.</Empty>
      ) : (
        <ul className="menu-panel divide-y divide-line overflow-hidden">
          {state.audit.map((a) => {
            const actor =
              a.actorId === "system"
                ? "Система"
                : state.people.find((p) => p.id === a.actorId)?.name ?? a.actorId;
            const action = auditActionLabels[a.action] ?? a.action;
            return (
              <li key={a.id} className="menu-row px-4 py-3 text-sm">
                <div className="flex flex-wrap justify-between gap-2">
                  <p className="font-medium">
                    {actor} · {action}
                  </p>
                  <p className="text-xs text-muted">{formatDateTime(a.at)}</p>
                </div>
                <p className="mt-1 text-muted">{a.detail}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
