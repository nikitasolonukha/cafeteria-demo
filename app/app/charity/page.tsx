"use client";

import { useState } from "react";
import { Button, Field, Input, PageHeader, Points } from "@/components/ui";
import { formatDateTime, formatPoints } from "@/lib/format";
import { totalBalance } from "@/lib/rules";
import { useStore } from "@/lib/store";

export default function CharityPage() {
  const { me, state, donate } = useStore();
  const [fundId, setFundId] = useState(state.funds[0]?.id ?? "");
  const [amount, setAmount] = useState("500");
  const [msg, setMsg] = useState<string | null>(null);

  if (!me) return null;
  if (!state.settings.charity) {
    return (
      <div>
        <PageHeader
          title="Благотворительность"
          lead="Раздел выключен в настройках платформы."
        />
      </div>
    );
  }

  const sum = Number(amount) || 0;
  const match = Math.round(sum * state.settings.charityMatch);
  const myDonations = state.donations.filter((d) => d.personId === me.id);

  return (
    <div>
      <PageHeader
        title="Благотворительность"
        lead={`Матчинг компании ×${state.settings.charityMatch}. Можно отдать весь остаток.`}
      />

      <div className="grid gap-3 md:grid-cols-3">
        {state.funds
          .filter((f) => f.active)
          .map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFundId(f.id)}
              className={`border p-4 text-left ${
                fundId === f.id
                  ? "border-ink bg-surface"
                  : "border-line bg-surface hover:border-ink"
              }`}
            >
              <p className="text-sm font-medium">{f.title}</p>
              <p className="mt-2 text-sm text-muted">{f.description}</p>
            </button>
          ))}
      </div>

      <div className="mt-6 border border-line bg-surface p-5">
        <p className="text-sm text-muted">
          Остаток: {formatPoints(totalBalance(me))} баллов
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <Field label="Сумма">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>
          <Button onClick={() => setAmount(String(totalBalance(me)))}>
            100% баланса
          </Button>
        </div>
        <p className="mt-3 text-sm text-muted">
          Компания добавит ещё {formatPoints(match)} баллов к взносу
        </p>
        {msg ? <p className="mt-3 text-sm text-danger">{msg}</p> : null}
        <Button
          variant="primary"
          className="mt-4"
          onClick={() => {
            const res = donate(fundId, sum);
            if (!res.ok) setMsg(res.reason);
            else {
              setMsg(null);
              setAmount("500");
            }
          }}
        >
          Подтвердить взнос
        </Button>
      </div>

      <section className="mt-8">
        <h2 className="section-title">Мои сертификаты</h2>
        <ul className="mt-3 divide-y divide-line border border-line bg-surface">
          {myDonations.map((d) => {
            const fund = state.funds.find((f) => f.id === d.fundId);
            return (
              <li key={d.id} className="px-4 py-3 text-sm">
                <p className="font-medium">
                  {fund?.title} · код {d.certificateCode}
                </p>
                <p className="mt-1 text-muted">
                  {formatDateTime(d.at)} · взнос{" "}
                  <Points value={d.amount} size="sm" /> · матчинг{" "}
                  <Points value={d.matchAmount} size="sm" />
                </p>
              </li>
            );
          })}
          {!myDonations.length ? (
            <li className="px-4 py-6 text-sm text-muted">Пока нет взносов</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
