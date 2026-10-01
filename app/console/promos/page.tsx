"use client";

import { useState } from "react";
import { Button, Field, Input, PageHeader, Select } from "@/components/ui";
import { formatPoints, sectionLabels } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { SectionId } from "@/lib/types";

export default function ConsolePromosPage() {
  const { me, state, createPromo, togglePromo } = useStore();
  const [title, setTitle] = useState("Кэшбэк на обучение");
  const [section, setSection] = useState<SectionId | "all">("growth");
  const [pct, setPct] = useState("10");
  const [budget, setBudget] = useState("20000");

  if (!me || (me.role !== "hr" && me.role !== "admin")) return null;

  return (
    <div>
      <PageHeader
        title="Промо-акции"
        lead="Кэшбэк, бюджет акции и эффективность (срабатывания / spend)."
      />

      <div className="border border-line bg-surface p-5">
        <p className="text-sm font-medium">Новая акция</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Field label="Название">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Раздел">
            <Select
              value={section}
              onChange={(e) => setSection(e.target.value as SectionId | "all")}
            >
              <option value="all">Все</option>
              {Object.entries(sectionLabels).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Кэшбэк %">
            <Input value={pct} onChange={(e) => setPct(e.target.value)} />
          </Field>
          <Field label="Бюджет акции">
            <Input value={budget} onChange={(e) => setBudget(e.target.value)} />
          </Field>
        </div>
        <Button
          variant="primary"
          className="mt-4"
          onClick={() => {
            if (!title.trim()) return;
            createPromo({
              title: title.trim(),
              section,
              cashbackPct: Number(pct) || 0,
              budgetLeft: Number(budget) || 0,
              start: "2026-10-01",
              end: "2026-10-31",
              active: true,
            });
            setTitle("Кэшбэк на обучение");
          }}
        >
          Создать
        </Button>
      </div>

      <ul className="mt-6 space-y-3">
        {state.promos.map((p) => (
          <li key={p.id} className="border border-line bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{p.title}</p>
                <p className="mt-1 text-sm text-muted">
                  {p.cashbackPct}% · бюджет {formatPoints(p.budgetLeft)} · spend{" "}
                  {formatPoints(p.spent)} · срабатываний {p.redemptions}
                </p>
              </div>
              <Button onClick={() => togglePromo(p.id)}>
                {p.active ? "Остановить" : "Включить"}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
