"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button, Empty, PageHeader, Panel, StatusWord } from "@/components/ui";
import { formatDateTime, orderStatusLabels, deliveryStatusLabels } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { OrderStatus } from "@/lib/types";

const statuses: Array<OrderStatus | "all"> = [
  "all",
  "created",
  "processing",
  "awaiting_approval",
  "done",
  "cancelled",
  "rejected",
];

export default function ConsoleOrdersPage() {
  const { me, state, fulfillOrder, cancelOrder, setDeliveryStatus, compensateOrder } =
    useStore();
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [q, setQ] = useState("");
  const [flash, setFlash] = useState("");
  const [otp, setOtp] = useState("4242");

  if (!me || (me.role !== "hr" && me.role !== "admin")) return null;

  const rows = useMemo(() => {
    return state.orders.filter((o) => {
      if (status !== "all" && o.status !== status) return false;
      const person = state.people.find((p) => p.id === o.personId);
      const hay = `${o.title} ${person?.name ?? ""} ${o.note ?? ""}`.toLowerCase();
      return !q || hay.includes(q.toLowerCase());
    });
  }, [state.orders, state.people, status, q]);

  return (
    <div>
      <PageHeader
        title="Заказы"
        lead="Фильтры по статусу и сотруднику. Исполнение и отмена."
      />
      {flash ? <p className="mb-4 text-sm text-pine">{flash}</p> : null}
      <div className="mb-4 flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            type="button"
            className={`h-10 rounded-[8px] border px-3 text-sm ${
              status === s
                ? "border-ink bg-ink text-surface"
                : "border-line bg-surface text-ink"
            }`}
            onClick={() => setStatus(s)}
          >
            {s === "all" ? "Все" : orderStatusLabels[s]}
          </button>
        ))}
      </div>
      <input
        className="control-field mb-4 max-w-sm"
        placeholder="Поиск по ФИО или льготе…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <input
        className="control-field mb-4 ml-0 max-w-[10rem] sm:ml-2"
        placeholder="2FA 4242"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />
      {rows.length === 0 ? (
        <Empty>Нет заказов по фильтру.</Empty>
      ) : (
        <ul className="space-y-3">
          {rows.map((o) => {
            const person = state.people.find((p) => p.id === o.personId);
            const canFulfill = o.status === "processing" || o.status === "created";
            const canCancel =
              o.status === "processing" ||
              o.status === "created" ||
              o.status === "awaiting_approval";
            return (
              <li key={o.id}>
                <Panel className="flex flex-wrap items-start justify-between gap-3 p-5">
                  <div>
                    <p className="text-base font-medium">{o.title}</p>
                    <p className="mt-1 text-sm text-muted">
                      {person?.name} · {o.id}
                      {o.note ? ` · ${o.note}` : ""}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {formatDateTime(o.createdAt)}
                      {o.deliveryStatus
                        ? ` · ${deliveryStatusLabels[o.deliveryStatus]}`
                        : ""}
                    </p>
                    <div className="mt-2">
                      <StatusWord
                        tone={
                          o.status === "done"
                            ? "pine"
                            : o.status === "rejected" || o.status === "cancelled"
                              ? "danger"
                              : "ink"
                        }
                      >
                        {orderStatusLabels[o.status]}
                      </StatusWord>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {canFulfill ? (
                      <Button
                        variant="primary"
                        onClick={() => {
                          const res = fulfillOrder(o.id);
                          setFlash(res.ok ? `Исполнено: ${o.title}` : res.reason);
                        }}
                      >
                        Исполнить
                      </Button>
                    ) : null}
                    {canCancel && !o.code ? (
                      <Button
                        variant="danger"
                        onClick={() => {
                          const res = cancelOrder(o.id);
                          setFlash(res.ok ? `Отменено: ${o.title}` : res.reason);
                        }}
                      >
                        Отменить
                      </Button>
                    ) : null}
                    {o.deliveryStatus && o.deliveryStatus !== "delivered" ? (
                      <Button
                        onClick={() => {
                          const next =
                            o.deliveryStatus === "print" ? "shipped" : "delivered";
                          const res = setDeliveryStatus(o.id, next);
                          setFlash(
                            res.ok
                              ? `Доставка: ${deliveryStatusLabels[next]}`
                              : res.reason,
                          );
                        }}
                      >
                        {o.deliveryStatus === "print" ? "В доставку" : "Доставлен"}
                      </Button>
                    ) : null}
                    {o.status === "done" || o.status === "processing" ? (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          const res = compensateOrder(o.id, otp);
                          setFlash(
                            res.ok
                              ? `Компенсация: ${o.title}`
                              : res.reason,
                          );
                        }}
                      >
                        Компенсировать
                      </Button>
                    ) : null}
                    <Link href={`/console/people/${o.personId}`}>
                      <Button variant="ghost">Карточка</Button>
                    </Link>
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
