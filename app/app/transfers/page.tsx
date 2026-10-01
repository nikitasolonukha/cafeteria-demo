"use client";

import { useMemo, useState } from "react";
import { Button, Field, Input, PageHeader } from "@/components/ui";
import { MenuSelect } from "@/components/menu-select";
import { formatDateTime, formatPoints } from "@/lib/format";
import { totalBalance } from "@/lib/rules";
import { useStore } from "@/lib/store";

export default function TransfersPage() {
  const { me, state, transfer } = useStore();
  const [toId, setToId] = useState("dmitry");
  const [amount, setAmount] = useState("500");
  const [comment, setComment] = useState("Часть баллов на отель");
  const [msg, setMsg] = useState<string | null>(null);

  const options = useMemo(
    () =>
      state.people
        .filter((p) => p.id !== me?.id && p.role !== "vip" && !p.exclusion)
        .map((p) => ({
          value: p.id,
          label: `${p.name} · ${p.department}`,
        })),
    [state.people, me?.id],
  );
  const selectedTo = options.some((o) => o.value === toId)
    ? toId
    : (options[0]?.value ?? "");

  if (!me) return null;
  if (!state.settings.transfers) {
    return (
      <div>
        <PageHeader title="Переводы" lead="Раздел выключен в настройках платформы." />
      </div>
    );
  }

  const feeRate = state.settings.transferCommission;
  const sum = Number(amount) || 0;
  const fee = Math.ceil(sum * feeRate);
  const total = sum + fee;

  return (
    <div>
      <PageHeader
        title="Перевод баллов"
        lead={`Комиссия ${Math.round(feeRate * 100)}%. Минимум ${formatPoints(state.settings.transferMin)} баллов.`}
      />
      <div className="border border-line bg-surface p-5">
        <p className="text-sm text-muted">
          Ваш остаток: {formatPoints(totalBalance(me))} · с получателя комиссия не берётся
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium">Кому</p>
            <MenuSelect
              value={selectedTo}
              onChange={setToId}
              options={options}
              placeholder="Выберите сотрудника"
            />
          </div>
          <Field label="Сумма перевода">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Комментарий">
              <Input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </Field>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted">
          К списанию: {formatPoints(total)} (перевод {formatPoints(sum)} + комиссия{" "}
          {formatPoints(fee)})
        </p>
        {msg ? <p className="mt-3 text-sm text-danger">{msg}</p> : null}
        <Button
          variant="primary"
          className="mt-4"
          onClick={() => {
            const res = transfer(selectedTo, sum, comment);
            if (!res.ok) setMsg(res.reason);
            else {
              setMsg(null);
              setAmount("500");
              setComment("Часть баллов на отель");
            }
          }}
        >
          Перевести
        </Button>
      </div>

      <section className="mt-8">
        <h2 className="section-title">Мои переводы</h2>
        <ul className="mt-3 divide-y divide-line border border-line bg-surface">
          {state.transfers
            .filter((t) => t.fromId === me.id || t.toId === me.id)
            .map((t) => {
              const other = state.people.find(
                (p) => p.id === (t.fromId === me.id ? t.toId : t.fromId),
              );
              return (
                <li key={t.id} className="px-4 py-3 text-sm">
                  <p className="font-medium">
                    {t.fromId === me.id ? "→" : "←"} {other?.name ?? "коллега"} ·{" "}
                    {formatPoints(t.amount)}
                  </p>
                  <p className="mt-1 text-muted">
                    {formatDateTime(t.at)}
                    {t.fromId === me.id ? ` · комиссия ${formatPoints(t.fee)}` : ""}
                    {t.comment ? ` · ${t.comment}` : ""}
                  </p>
                </li>
              );
            })}
          {!state.transfers.some((t) => t.fromId === me.id || t.toId === me.id) ? (
            <li className="px-4 py-6 text-sm text-muted">Пока пусто</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
