"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Button, Field, Input, PageHeader, Panel, Points, Textarea } from "@/components/ui";
import {
  formatDateTime,
  ledgerKindLabels,
  orderStatusLabels,
  roleLabels,
} from "@/lib/format";
import { totalBalance } from "@/lib/rules";
import { useStore } from "@/lib/store";

type FeedItem = {
  id: string;
  at: string;
  title: string;
  detail: string;
  amount?: number;
  signed?: number;
};

export default function PersonPage() {
  const params = useParams<{ id: string }>();
  const {
    state,
    me,
    manualPoints,
    setFrozen,
    setExclusion,
    fulfillOrder,
    cancelOrder,
  } = useStore();
  const [amount, setAmount] = useState("500");
  const [comment, setComment] = useState("Корректировка по заявлению");
  const [otp, setOtp] = useState("4242");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const person = state.people.find((p) => p.id === params.id);

  const feed = useMemo(() => {
    if (!person) return [] as FeedItem[];
    const items: FeedItem[] = [];

    for (const o of state.orders.filter((x) => x.personId === person.id)) {
      items.push({
        id: `o-${o.id}`,
        at: o.createdAt,
        title: o.title,
        detail: [
          orderStatusLabels[o.status],
          o.note,
          o.code ? `код ${o.code}` : null,
        ]
          .filter(Boolean)
          .join(" · "),
        amount: o.price,
        signed: o.price > 0 ? -o.price : undefined,
      });
    }

    for (const l of state.ledger.filter((x) => x.personId === person.id)) {
      if (l.kind === "spend" || l.kind === "refund") continue;
      const signed =
        l.kind === "manual_spend" ? -l.amount : l.amount;
      const split = [
        l.burnableDelta ? `сгор. ${l.burnableDelta > 0 ? "+" : ""}${l.burnableDelta}` : null,
        l.durableDelta ? `несгор. ${l.durableDelta > 0 ? "+" : ""}${l.durableDelta}` : null,
      ]
        .filter(Boolean)
        .join(", ");
      items.push({
        id: `l-${l.id}`,
        at: l.at,
        title: l.comment,
        detail: [ledgerKindLabels[l.kind] ?? l.kind, split || null]
          .filter(Boolean)
          .join(" · "),
        amount: l.amount,
        signed,
      });
    }

    for (const t of state.tickets.filter((x) => x.personId === person.id)) {
      items.push({
        id: `t-${t.id}`,
        at: t.createdAt,
        title: t.topic,
        detail: `${t.status === "done" ? "закрыто" : "открыто"} · ${t.body}`,
      });
    }

    return items.sort((a, b) => (a.at < b.at ? 1 : -1));
  }, [person, state.orders, state.ledger, state.tickets]);

  if (!me || (me.role !== "hr" && me.role !== "admin")) return null;
  if (!person) return <PageHeader title="Сотрудник не найден" />;

  const orders = state.orders.filter((o) => o.personId === person.id);

  return (
    <div>
      <PageHeader
        title={person.name}
        lead={`${person.title} · ${person.department} · ${roleLabels[person.role]}`}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="p-5">
          <p className="text-sm text-muted">Баланс</p>
          <div className="mt-2">
            <Points value={totalBalance(person)} size="lg" accent />
          </div>
          <p className="mt-3 text-sm text-muted">
            сгораемые {person.burnable} · несгораемые {person.durable}
            {person.frozen ? " · заморожен" : ""}
            {person.exclusion ? " · exclusion" : ""}
            {person.dmsStatus && person.dmsStatus !== "none"
              ? ` · ДМС ${person.dmsStatus}`
              : ""}
            {person.flexibleSchedule ? " · гибкий график" : ""}
            {!person.onboardingDone ? " · онбординг" : ""}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant={person.frozen ? "primary" : "danger"}
              onClick={() => {
                setMsg("");
                setErr("");
                const res = setFrozen(person.id, !person.frozen);
                if (!res.ok) {
                  setErr(res.reason);
                  return;
                }
                setMsg(
                  person.frozen
                    ? "Баллы разморожены."
                    : "Баллы заморожены — оформление недоступно.",
                );
              }}
            >
              {person.frozen ? "Разморозить" : "Заморозить баллы"}
            </Button>
            <Button
              variant={person.exclusion ? "primary" : "danger"}
              onClick={() => {
                setExclusion(person.id, !person.exclusion);
                setMsg(
                  person.exclusion
                    ? "Сотрудник возвращён в аудиторию."
                    : "Сотрудник в группе Exclusion («хламовник»).",
                );
              }}
            >
              {person.exclusion ? "Снять Exclusion" : "В Exclusion"}
            </Button>
          </div>

          <div className="mt-6 grid gap-3">
            <Field label="Сумма (+ начисление / − списание)">
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="numeric"
                name="manual-amount"
                autoComplete="off"
              />
            </Field>
            <Field label="Комментарий">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Обязателен для ручной операции…"
                name="manual-comment"
                autoComplete="off"
              />
            </Field>
            <Field label="Код 2FA (демо: 4242)">
              <Input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                name="manual-otp"
                autoComplete="one-time-code"
              />
            </Field>
            <Button
              variant="primary"
              onClick={() => {
                setMsg("");
                setErr("");
                const n = Number(amount);
                if (!Number.isFinite(n) || n === 0) {
                  setErr("Укажите ненулевую сумму");
                  return;
                }
                const res = manualPoints(person.id, n, comment, otp);
                if (!res.ok) {
                  setErr(res.reason);
                  return;
                }
                setComment("");
                setOtp("");
                setMsg("Операция записана в аудит.");
              }}
            >
              Провести
            </Button>
            <div aria-live="polite">
              {err ? <p className="text-sm text-danger">{err}</p> : null}
              {msg ? <p className="text-sm text-pine">{msg}</p> : null}
            </div>
          </div>
        </Panel>

        <Panel className="p-5">
          <p className="text-sm font-medium">Лента</p>
          <p className="mt-1 text-xs text-muted">
            Заказы, движения баллов и обращения — в одном списке.
          </p>
          {feed.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Пока пусто.</p>
          ) : (
            <ul className="mt-3 max-h-[28rem] space-y-0 overflow-auto">
              {feed.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between gap-3 border-b border-line py-3 text-sm last:border-0"
                >
                  <span className="min-w-0">
                    <span className="block font-medium">{item.title}</span>
                    <span className="mt-1 block text-xs text-muted">
                      {formatDateTime(item.at)}
                      {item.detail ? ` · ${item.detail}` : ""}
                    </span>
                  </span>
                  {item.signed !== undefined ? (
                    <span
                      className={`shrink-0 font-points tabular-nums ${
                        item.signed < 0 ? "text-danger" : "text-pine"
                      }`}
                    >
                      {item.signed > 0 ? "+" : ""}
                      {item.signed}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <h2 className="mt-8 section-title">Действия по заказам</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {orders.map((o) => (
          <li
            key={o.id}
            className="flex flex-wrap items-center justify-between gap-3 border border-line bg-surface px-4 py-3"
          >
            <span className="min-w-0">
              <span className="font-medium">{o.title}</span>
              {o.note ? (
                <span className="mt-1 block text-xs text-muted">{o.note}</span>
              ) : null}
            </span>
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-muted">{orderStatusLabels[o.status]}</span>
              {o.status === "processing" || o.status === "created" ? (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setMsg("");
                    setErr("");
                    const res = fulfillOrder(o.id);
                    if (!res.ok) setErr(res.reason);
                    else setMsg(`Выполнен: ${o.title}`);
                  }}
                >
                  Исполнить
                </Button>
              ) : null}
              {o.status === "processing" || o.status === "awaiting_approval" ? (
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (!window.confirm(`Отменить «${o.title}»?`)) return;
                    setMsg("");
                    setErr("");
                    const res = cancelOrder(o.id);
                    if (!res.ok) setErr(res.reason);
                    else setMsg(`Отменён: ${o.title}`);
                  }}
                >
                  Отменить
                </Button>
              ) : null}
            </span>
          </li>
        ))}
        {orders.length === 0 ? <li className="text-muted">Нет заказов.</li> : null}
      </ul>
    </div>
  );
}
