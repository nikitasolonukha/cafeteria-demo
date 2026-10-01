"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, PageHeader, Panel, Points } from "@/components/ui";
import { formatPoints } from "@/lib/format";
import { totalBalance } from "@/lib/rules";
import { useStore } from "@/lib/store";

export default function DashboardPage() {
  const { state, me, fulfillOrder, dashboardExport } = useStore();
  const router = useRouter();
  const [flash, setFlash] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (me?.role === "manager") router.replace("/console/approvals");
  }, [me, router]);

  if (!me || (me.role !== "hr" && me.role !== "admin")) return null;

  const employees = state.people.filter(
    (p) => p.role === "employee" || p.role === "decret" || p.role === "manager",
  );

  const byDept = Object.entries(
    employees.reduce<Record<string, { budget: number; left: number }>>(
      (acc, p) => {
        const gradeBudget =
          p.grade === "A" ? 8000 : p.grade === "B" ? 5000 : p.grade === "C" ? 3500 : 0;
        const budget = gradeBudget + p.years * 500;
        const left = totalBalance(p);
        const cur = acc[p.department] ?? { budget: 0, left: 0 };
        acc[p.department] = {
          budget: cur.budget + budget,
          left: cur.left + left,
        };
        return acc;
      },
      {},
    ),
  );

  const benefitCounts = state.orders
    .filter((o) => o.status === "done" || o.status === "processing")
    .reduce<Record<string, number>>((acc, o) => {
      acc[o.title] = (acc[o.title] ?? 0) + 1;
      return acc;
    }, {});
  const top = Object.entries(benefitCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const unused = employees.reduce((s, p) => s + totalBalance(p), 0);
  const processing = state.orders.filter(
    (o) => o.status === "processing" || o.status === "created",
  );
  const openTickets = state.tickets.filter((t) => t.status === "open").length;
  const awaiting = state.orders.filter((o) => o.status === "awaiting_approval").length;
  const incomplete = employees.filter(
    (p) => !p.email || !p.phone || !p.birthDate || !p.city,
  ).length;
  const excluded = state.people.filter((p) => p.exclusion).length;

  return (
    <div>
      <PageHeader
        title="Дашборд"
        lead="Использование бюджета по отделам, топ льгот и остаток баллов."
      />
      {flash ? (
        <p aria-live="polite" className="mb-4 text-sm text-pine">
          {flash}
        </p>
      ) : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel className="p-5">
          <p className="text-sm text-muted">На согласовании</p>
          <p className="mt-1 font-points text-2xl tabular-nums">{awaiting}</p>
        </Panel>
        <Panel className="p-5">
          <p className="text-sm text-muted">В обработке</p>
          <p className="mt-1 font-points text-2xl tabular-nums">{processing.length}</p>
        </Panel>
        <Panel className="p-5">
          <p className="text-sm text-muted">Открытые обращения</p>
          <p className="mt-1 font-points text-2xl tabular-nums">{openTickets}</p>
        </Panel>
        <Panel className="p-5">
          <p className="text-sm text-muted">Неполные карточки (ожидание 1С)</p>
          <p className="mt-1 font-points text-2xl tabular-nums">{incomplete}</p>
          <p className="mt-1 text-sm text-muted">исключений: {excluded}</p>
        </Panel>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/console/orders">
          <Button>Все заказы</Button>
        </Link>
        <Link href="/console/events">
          <Button>Событийные начисления</Button>
        </Link>
        <Link href="/console/categories">
          <Button>Полки и выплаты</Button>
        </Link>
        <Link href="/console/export">
          <Button>Бухгалтерия TSV</Button>
        </Link>
        <Button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(dashboardExport());
            } catch {
              /* clipboard may be blocked in headless */
            }
            setCopied(true);
          }}
        >
          {copied ? "Дашборд скопирован" : "Экспорт дашборда"}
        </Button>
        {me.role === "admin" ? (
          <Link href="/console/roles">
            <Button>Роли и Exclusion</Button>
          </Link>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Panel className="p-5">
          <p className="text-sm font-medium">Доля использованного бюджета</p>
          <ul className="mt-4 space-y-4">
            {byDept.map(([dept, vals]) => {
              const used = Math.max(vals.budget - vals.left, 0);
              const pct = vals.budget ? Math.round((used / vals.budget) * 100) : 0;
              return (
                <li key={dept}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{dept}</span>
                    <span className="text-muted">{pct}%</span>
                  </div>
                  <div className="h-2 bg-paper">
                    <div
                      className="h-2 bg-ink"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    использовано {formatPoints(used)} из {formatPoints(vals.budget)}
                  </p>
                </li>
              );
            })}
          </ul>
        </Panel>

        <div className="space-y-4">
          <Panel className="p-5">
            <p className="text-sm text-muted">Неиспользованные баллы</p>
            <div className="mt-2">
              <Points value={unused} size="lg" accent />
            </div>
          </Panel>
          <Panel className="p-5">
            <p className="text-sm font-medium">Активность (симуляция заходов)</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex justify-between gap-3">
                <span>Сотрудников в базе</span>
                <span className="tabular-nums">{state.people.length}</span>
              </li>
              <li className="flex justify-between gap-3">
                <span>Оформили хотя бы один заказ</span>
                <span className="tabular-nums">
                  {new Set(state.orders.map((o) => o.personId)).size}
                </span>
              </li>
              <li className="flex justify-between gap-3">
                <span>Движений баллов</span>
                <span className="tabular-nums">{state.ledger.length}</span>
              </li>
            </ul>
          </Panel>
          <Panel className="p-5">
            <p className="text-sm font-medium">Топ льгот</p>
            <ul className="mt-3 space-y-2 text-sm">
              {top.length === 0 ? (
                <li className="text-muted">Пока нет оформленных заказов.</li>
              ) : (
                top.map(([title, count]) => (
                  <li key={title} className="flex justify-between gap-3">
                    <span>{title}</span>
                    <span className="text-muted">{count}</span>
                  </li>
                ))
              )}
            </ul>
          </Panel>
        </div>
      </div>

      {processing.length ? (
        <section className="mt-8">
          <h2 className="section-title">Очередь исполнения</h2>
          <ul className="space-y-3 text-base">
            {processing.map((o) => {
              const person = state.people.find((p) => p.id === o.personId);
              return (
                <li
                  key={o.id}
                  className="ui-panel flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <span>
                    <span className="font-medium">{o.title}</span>
                    <span className="mt-1 block text-sm text-muted">
                      {person?.name}
                      {o.note ? ` · ${o.note}` : ""}
                    </span>
                  </span>
                  <span className="flex flex-wrap gap-2">
                    <Button
                      variant="primary"
                      onClick={() => {
                        const res = fulfillOrder(o.id);
                        if (!res.ok) {
                          setFlash(res.reason);
                          return;
                        }
                        setFlash(`Исполнено: ${o.title}`);
                      }}
                    >
                      Исполнить
                    </Button>
                    <Link href={`/console/people/${o.personId}`}>
                      <Button variant="ghost">Карточка</Button>
                    </Link>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
