"use client";

import { Button, PageHeader, Points } from "@/components/ui";
import { formatDateTime, formatPoints } from "@/lib/format";
import { useStore } from "@/lib/store";
import { useState } from "react";

export default function LotteryPage() {
  const { me, state, lotteryBuy } = useStore();
  const [msg, setMsg] = useState<string | null>(null);

  if (!me) return null;
  if (!state.settings.lottery) {
    return (
      <div>
        <PageHeader title="Лотерея" lead="Раздел выключен." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Лотереи"
        lead="Билет списывает баллы сразу. Результаты публикуются после розыгрыша."
      />
      {msg ? <p className="mb-4 text-sm text-danger">{msg}</p> : null}
      <ul className="space-y-4">
        {state.lotteries.map((lot) => {
          const mine = lot.tickets.filter((t) => t.personId === me.id).length;
          return (
            <li key={lot.id} className="border border-line bg-surface p-5">
              <p className="text-sm font-medium">{lot.title}</p>
              <p className="mt-1 text-sm text-muted">{lot.description}</p>
              <p className="mt-3 text-sm">
                Билет: <Points value={lot.ticketPrice} size="sm" /> · билетов{" "}
                {lot.tickets.length}
                {mine ? ` · ваших ${mine}` : ""}
              </p>
              <ul className="mt-3 space-y-1 text-sm text-muted">
                {lot.prizes.map((p) => (
                  <li key={p.id}>
                    {p.title} ({formatPoints(p.points)})
                  </li>
                ))}
              </ul>
              {lot.drawn ? (
                <div className="mt-4">
                  <p className="text-sm font-medium">Победители</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {lot.winners.map((w) => {
                      const person = state.people.find((p) => p.id === w.personId);
                      const prize = lot.prizes.find((p) => p.id === w.prizeId);
                      return (
                        <li key={`${w.prizeId}-${w.ticketId}`}>
                          {prize?.title}: {person?.name ?? w.personId}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : lot.open ? (
                <Button
                  variant="primary"
                  className="mt-4"
                  onClick={() => {
                    const res = lotteryBuy(lot.id);
                    if (!res.ok) setMsg(res.reason);
                    else setMsg(null);
                  }}
                >
                  Купить билет
                </Button>
              ) : (
                <p className="mt-4 text-sm text-muted">Приём билетов закрыт</p>
              )}
              {mine > 0 ? (
                <p className="mt-3 text-xs text-muted">
                  Последний билет:{" "}
                  {formatDateTime(
                    [...lot.tickets].reverse().find((t) => t.personId === me.id)!
                      .at,
                  )}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
