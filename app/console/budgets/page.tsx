"use client";

import { useMemo, useState } from "react";
import { MenuSelect } from "@/components/menu-select";
import { Button, PageHeader } from "@/components/ui";
import { formatPoints } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function BudgetsPage() {
  const { me, state, applyMassBudget } = useStore();
  const [msg, setMsg] = useState<string | null>(null);
  const [period, setPeriod] = useState("2026");
  const rows = useMemo(() => {
    const gradeMap = { A: 8000, B: 5000, C: 3500 } as const;
    return state.people
      .filter((p) => p.grade)
      .map((p) => ({
        id: p.id,
        name: p.name,
        from: p.burnable,
        to: gradeMap[p.grade!],
      }))
      .filter((row) => row.from !== row.to);
  }, [state.people]);

  if (!me || (me.role !== "hr" && me.role !== "admin")) return null;

  return (
    <div>
      <PageHeader
        title="Массовый пересчёт бюджетов"
        lead="Предпросмотр по грейду (A 8000 / B 5000 / C 3500), затем утверждение."
      />
      {msg ? <p className="mb-4 text-sm text-pine">{msg}</p> : null}
      <div className="mb-4 max-w-xs">
        <label className="mb-1 block text-sm text-muted">Период бюджета</label>
        <MenuSelect
          aria-label="Период бюджета"
          value={period}
          onChange={setPeriod}
          options={[
            { value: "2026", label: "2026 (текущий)" },
            { value: "2025", label: "2025 (завершён)" },
          ]}
        />
      </div>
      {period !== "2026" ? (
        <p className="mb-4 text-sm text-danger">
          Изменение бюджета завершённого периода заблокировано.
        </p>
      ) : null}
      <div className="overflow-x-auto border border-line bg-surface">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Сотрудник</th>
              <th className="px-4 py-3 font-medium">Сейчас</th>
              <th className="px-4 py-3 font-medium">После</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">{r.name}</td>
                <td className="px-4 py-3 tabular-nums">{formatPoints(r.from)}</td>
                <td className="px-4 py-3 tabular-nums">{formatPoints(r.to)}</td>
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-muted">
                  Все сгораемые уже совпадают с грейдом
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <Button
        variant="primary"
        className="mt-4"
        disabled={!rows.length || period !== "2026"}
        onClick={() => {
          const res = applyMassBudget();
          if (!res.ok) setMsg(res.reason);
          else setMsg(`Утверждено: ${rows.length} сотрудников`);
        }}
      >
        Утвердить пересчёт
      </Button>
    </div>
  );
}
