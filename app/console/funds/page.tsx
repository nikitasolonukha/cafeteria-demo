"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Field, Input, PageHeader, Points, Textarea } from "@/components/ui";
import { formatPoints } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function FundsPage() {
  const { me, state, toggleFund, createFund } = useStore();
  const [title, setTitle] = useState("Фонд «Школьный портфель»");
  const [description, setDescription] = useState(
    "Сборы на канцтовары детям сотрудников к 1 сентября.",
  );
  const [flash, setFlash] = useState("");

  if (!me || (me.role !== "hr" && me.role !== "admin")) return null;

  const byFund = state.funds.map((f) => {
    const list = state.donations.filter((d) => d.fundId === f.id);
    const sum = list.reduce((s, d) => s + d.amount, 0);
    const match = list.reduce((s, d) => s + d.matchAmount, 0);
    return { f, list, sum, match };
  });

  return (
    <div>
      <PageHeader
        title="Фонды и матчинг"
        lead={`Множитель софинансирования: ×${state.settings.charityMatch}. Меняется в настройках.`}
      />
      {flash ? <p className="mb-4 text-sm text-pine">{flash}</p> : null}
      <ul className="space-y-4">
        {byFund.map(({ f, list, sum, match }) => (
          <li key={f.id} className="border border-line bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{f.title}</p>
                <p className="mt-1 text-sm text-muted">{f.description}</p>
                <p className="mt-3 text-sm">
                  Взносов {list.length} · сумма <Points value={sum} size="sm" /> ·
                  матчинг <Points value={match} size="sm" /> ·{" "}
                  {f.active ? "на витрине" : "скрыт"}
                </p>
              </div>
              <Button
                onClick={() => {
                  toggleFund(f.id);
                  setFlash(f.active ? `${f.title}: скрыт` : `${f.title}: на витрине`);
                }}
              >
                {f.active ? "Скрыть" : "Показать"}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 border border-line bg-surface p-5">
        <p className="text-sm font-medium">Новый фонд</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Field label="Название">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Описание">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
          </div>
        </div>
        <Button
          variant="primary"
          className="mt-4"
          onClick={() => {
            if (!title.trim()) return;
            createFund(title, description);
            setFlash(`Создан: ${title.trim()}`);
            setTitle("Фонд «Новый сбор»");
            setDescription("Целевой сбор по заявке HR.");
          }}
        >
          Создать фонд
        </Button>
      </div>

      <p className="mt-6 text-sm text-muted">
        Комиссия переводов: {Math.round(state.settings.transferCommission * 100)}
        % · минимум {formatPoints(state.settings.transferMin)}
      </p>
      <Link href="/console/settings" className="mt-3 inline-block">
        <Button>К настройкам</Button>
      </Link>
    </div>
  );
}
