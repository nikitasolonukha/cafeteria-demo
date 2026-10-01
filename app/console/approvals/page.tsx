"use client";

import { useState } from "react";
import { Notice } from "@/components/notice";
import { Button, Empty, PageHeader, Panel, Points } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function ApprovalsPage() {
  const { me, state, decideLeave } = useStore();
  const [flash, setFlash] = useState<{ text: string; tone: "ok" | "danger" } | null>(
    null,
  );
  if (!me) return null;

  const queue = state.orders.filter((o) => {
    if (o.status !== "awaiting_approval") return false;
    if (me.role === "hr" || me.role === "admin") return true;
    return o.approverId === me.id;
  });

  return (
    <div>
      <PageHeader
        title="Согласования"
        lead="Доп. отпуск и другие позиции с маршрутом руководителя."
      />
      {flash ? (
        <div className="mb-4">
          <Notice tone={flash.tone} onClear={() => setFlash(null)}>
            {flash.text}
          </Notice>
        </div>
      ) : null}
      {queue.length === 0 ? (
        <Empty>Очередь пуста.</Empty>
      ) : (
        <ul className="space-y-3">
          {queue.map((order) => {
            const person = state.people.find((p) => p.id === order.personId);
            return (
              <li key={order.id}>
                <Panel className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{order.title}</p>
                      <p className="mt-1 text-sm text-muted">
                        {person?.name} · {order.note ?? "без комментария"}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                    <Points value={order.price} size="sm" />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      variant="primary"
                      onClick={() => {
                        const res = decideLeave(order.id, "approve");
                        if (!res.ok) {
                          setFlash({ text: res.reason, tone: "danger" });
                          return;
                        }
                        setFlash({
                          text: `Одобрено: ${order.title}`,
                          tone: "ok",
                        });
                      }}
                    >
                      Одобрить
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        const res = decideLeave(order.id, "reject");
                        if (!res.ok) {
                          setFlash({ text: res.reason, tone: "danger" });
                          return;
                        }
                        setFlash({
                          text: `Отклонено, баллы возвращены: ${order.title}`,
                          tone: "ok",
                        });
                      }}
                    >
                      Отклонить
                    </Button>
                  </div>
                </Panel>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
