"use client";

import { useState } from "react";
import { Button, Field, Input, PageHeader, Points } from "@/components/ui";
import { formatPoints } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function ConsoleLotteryPage() {
  const { me, state, lotteryDraw, createLottery } = useStore();
  const [msg, setMsg] = useState<string | null>(null);
  const [title, setTitle] = useState("Новогодний розыгрыш");
  const [price, setPrice] = useState("250");

  if (!me || (me.role !== "hr" && me.role !== "admin")) return null;

  return (
    <div>
      <PageHeader title="Лотереи" lead="Розыгрыш и публикация победителей." />
      {msg ? <p className="mb-4 text-sm text-pine">{msg}</p> : null}

      <div className="mb-6 border border-line bg-surface p-5">
        <p className="text-sm font-medium">Новая лотерея</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Field label="Название">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Цена билета">
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </Field>
        </div>
        <Button
          variant="primary"
          className="mt-4"
          onClick={() => {
            if (!title.trim()) return;
            createLottery(title, Number(price) || 200);
            setMsg(`Опубликована: ${title.trim()}`);
            setTitle("Розыгрыш квартала");
          }}
        >
          Опубликовать
        </Button>
      </div>

      <ul className="space-y-4">
        {state.lotteries.map((lot) => (
          <li key={lot.id} className="border border-line bg-surface p-5">
            <p className="text-sm font-medium">{lot.title}</p>
            <p className="mt-2 text-sm text-muted">
              Билет <Points value={lot.ticketPrice} size="sm" /> · продано{" "}
              {lot.tickets.length} · {lot.open ? "приём открыт" : "закрыта"}
            </p>
            <ul className="mt-3 text-sm text-muted">
              {lot.prizes.map((p) => (
                <li key={p.id}>
                  {p.title} ({formatPoints(p.points)})
                </li>
              ))}
            </ul>
            {lot.drawn ? (
              <ul className="mt-4 space-y-1 text-sm">
                {lot.winners.map((w) => {
                  const person = state.people.find((p) => p.id === w.personId);
                  const prize = lot.prizes.find((p) => p.id === w.prizeId);
                  return (
                    <li key={`${w.prizeId}-${w.ticketId}`}>
                      {prize?.title}: {person?.name ?? "участник"}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <Button
                variant="primary"
                className="mt-4"
                onClick={() => {
                  const res = lotteryDraw(lot.id);
                  if (!res.ok) setMsg(res.reason);
                  else setMsg(`Розыгрыш проведён: ${lot.title}`);
                }}
              >
                Провести розыгрыш
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
