"use client";

import { useState } from "react";
import { Button, Field, Input, PageHeader, Points } from "@/components/ui";
import { formatPoints } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function PoolsPage() {
  const { me, state, poolContribute, createPool } = useStore();
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [title, setTitle] = useState("Выезд на сплав");
  const [description, setDescription] = useState("Сбор отдела на сплав по Чусовой в июне.");
  const [goal, setGoal] = useState("5000");
  const [msg, setMsg] = useState<string | null>(null);

  if (!me) return null;
  if (!state.settings.teamPools) {
    return (
      <div>
        <PageHeader title="Командные сборы" lead="Раздел выключен." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Командные сборы"
        lead="Складывайте баллы на общую активность отдела."
      />

      <ul className="space-y-4">
        {state.pools.map((pool) => {
          const raised = pool.contributions.reduce((s, c) => s + c.amount, 0);
          const pct = Math.min(100, Math.round((raised / pool.goal) * 100));
          return (
            <li key={pool.id} className="border border-line bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{pool.title}</p>
                  <p className="mt-1 text-sm text-muted">{pool.description}</p>
                </div>
                <p className="text-sm tabular-nums">
                  <Points value={raised} size="sm" /> / {formatPoints(pool.goal)}
                </p>
              </div>
              <div className="mt-4 h-2 w-full bg-paper">
                <div className="h-2 bg-pine" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted">
                {pool.contributions.length} взносов · {pct}%
                {!pool.open ? " · закрыт" : ""}
              </p>
              {pool.open ? (
                <div className="mt-4 flex flex-wrap items-end gap-3">
                  <Field label="Взнос">
                    <Input
                      type="number"
                      value={amounts[pool.id] ?? "300"}
                      onChange={(e) =>
                        setAmounts((a) => ({ ...a, [pool.id]: e.target.value }))
                      }
                    />
                  </Field>
                  <Button
                    variant="primary"
                    onClick={() => {
                      const res = poolContribute(
                        pool.id,
                        Number(amounts[pool.id] ?? 300),
                      );
                      if (!res.ok) setMsg(res.reason);
                      else setMsg(null);
                    }}
                  >
                    Внести
                  </Button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      {msg ? <p className="mt-4 text-sm text-danger">{msg}</p> : null}

      <div className="mt-8 border border-line bg-surface p-5">
        <p className="text-sm font-medium">Создать сбор</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Field label="Название">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Цель, баллы">
            <Input
              type="number"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Описание">
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
          </div>
        </div>
        <Button
          className="mt-4"
          onClick={() => {
            const res = createPool(title, description, Number(goal) || 0);
            if (!res.ok) setMsg(res.reason);
            else {
              setTitle("Выезд на сплав");
              setDescription("Сбор отдела на сплав по Чусовой в июне.");
              setMsg(null);
            }
          }}
        >
          Создать
        </Button>
      </div>
    </div>
  );
}
