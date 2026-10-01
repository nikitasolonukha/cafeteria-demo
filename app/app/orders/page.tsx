"use client";

import { useState } from "react";
import { Notice } from "@/components/notice";
import { Button, Empty, PageHeader, Panel, Points, StatusWord } from "@/components/ui";
import { formatDateTime, orderStatusLabels, deliveryStatusLabels } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function OrdersPage() {
  const { me, state, cancelOrder, resendCode } = useStore();
  const [flash, setFlash] = useState<{ text: string; tone: "ok" | "danger" } | null>(
    null,
  );
  if (!me) return null;

  const orders = state.orders.filter((o) => o.personId === me.id);

  return (
    <div>
      <PageHeader title="Мои заказы" lead="Статусы, коды и отмена где доступна." />
      {flash ? (
        <div className="mb-4">
          <Notice tone={flash.tone} onClear={() => setFlash(null)}>
            {flash.text}
          </Notice>
        </div>
      ) : null}
      {orders.length === 0 ? (
        <Empty>Заказов пока нет.</Empty>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => {
            const benefit = state.benefits.find((b) => b.id === order.benefitId);
            const canCancel =
              !order.code &&
              benefit?.type !== "certificate" &&
              (order.status === "awaiting_approval" ||
                order.status === "processing" ||
                order.status === "created");
            const metaLine = [
              order.meta?.familyName
                ? `${order.meta.familyName}, ${order.meta.relation ?? ""}`
                : null,
              order.meta?.childName,
              order.meta?.size ? `размер ${order.meta.size}` : null,
            ]
              .filter(Boolean)
              .join(" · ");

            return (
              <li key={order.id}>
                <Panel className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-base font-medium">{order.title}</p>
                      <p className="mt-1.5 text-sm text-muted">
                        {formatDateTime(order.createdAt)}
                        {order.note ? ` · ${order.note}` : ""}
                        {metaLine ? ` · ${metaLine}` : ""}
                      </p>
                    {order.code ? (
                      <div className="mt-3 inline-flex items-center gap-2 border border-line bg-paper px-3 py-2">
                        <span className="text-sm text-muted">Код</span>
                        <span className="font-points text-base tracking-wide text-ink" translate="no">
                          {order.code}
                        </span>
                      </div>
                    ) : null}
                    {benefit?.type === "certificate" && order.status === "done" ? (
                      <p className="mt-2 text-sm text-muted">
                        Отмена после выдачи кода недоступна.
                      </p>
                    ) : null}
                    {order.deliveryStatus ? (
                      <p className="mt-2 text-sm text-muted">
                        Доставка: {deliveryStatusLabels[order.deliveryStatus]}
                      </p>
                    ) : null}
                    {benefit?.archived ? (
                      <p className="mt-2 text-sm text-muted">
                        Позиция в архиве каталога — заказ сохранён.
                      </p>
                    ) : null}
                    </div>
                    <div className="text-right">
                      <Points value={order.price} size="sm" />
                      <div className="mt-2">
                        <StatusWord
                          tone={
                            order.status === "done"
                              ? "pine"
                              : order.status === "rejected" ||
                                  order.status === "cancelled"
                                ? "danger"
                                : "ink"
                          }
                        >
                          {orderStatusLabels[order.status]}
                        </StatusWord>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                  {canCancel ? (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          if (
                            !window.confirm(
                              `Отменить «${order.title}» и вернуть баллы?`,
                            )
                          ) {
                            return;
                          }
                          const res = cancelOrder(order.id);
                          if (!res.ok) {
                            setFlash({ text: res.reason, tone: "danger" });
                            return;
                          }
                          setFlash({
                            text: `Отменено, баллы возвращены: ${order.title}`,
                            tone: "ok",
                          });
                        }}
                      >
                        Отменить и вернуть баллы
                      </Button>
                  ) : null}
                  {order.code ? (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        const res = resendCode(order.id);
                        setFlash(
                          res.ok
                            ? {
                                text: `Код отправлен повторно: ${order.code}`,
                                tone: "ok",
                              }
                            : { text: res.reason, tone: "danger" },
                        );
                      }}
                    >
                      Отправить код снова
                    </Button>
                  ) : null}
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
