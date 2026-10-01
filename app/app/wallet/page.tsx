"use client";

import { Empty, PageHeader, Panel, Points } from "@/components/ui";
import { formatDate, formatDateTime, ledgerKindLabels, sectionLabels } from "@/lib/format";
import { totalBalance } from "@/lib/rules";
import { useStore } from "@/lib/store";
import type { SectionId } from "@/lib/types";

export default function WalletPage() {
  const { me, state } = useStore();
  if (!me) return null;

  const ledger = state.ledger.filter((l) => l.personId === me.id);
  const burnNotes = state.notifications.filter(
    (n) =>
      n.personId === me.id &&
      /сгоран/i.test(`${n.title} ${n.body}`),
  );
  const spentBySection = (Object.keys(sectionLabels) as SectionId[]).map((section) => {
    const spent = state.orders
      .filter(
        (o) =>
          o.personId === me.id &&
          o.status !== "cancelled" &&
          o.status !== "rejected" &&
          state.benefits.find((b) => b.id === o.benefitId)?.section === section,
      )
      .reduce((s, o) => s + o.price, 0);
    return { section, spent };
  });
  const maxSpent = Math.max(...spentBySection.map((x) => x.spent), 1);
  const used = state.orders
    .filter(
      (o) =>
        o.personId === me.id &&
        o.status !== "cancelled" &&
        o.status !== "rejected",
    )
    .reduce((s, o) => s + o.price, 0);
  const start = used + totalBalance(me);

  return (
    <div>
      <PageHeader
        title="История баллов"
        lead="Начисления и списания. Сначала списываются сгораемые."
      />
      <Panel className="mb-6 grid gap-5 p-6 sm:grid-cols-3">
        <div>
          <p className="text-sm text-muted">Всего</p>
          <Points value={totalBalance(me)} size="lg" accent />
        </div>
        <div>
          <p className="text-sm text-muted">Сгораемые</p>
          <Points value={me.burnable} size="lg" />
          {me.burnableUntil ? (
            <p className="mt-1 text-sm text-muted">
              до {formatDate(me.burnableUntil)}
            </p>
          ) : null}
        </div>
        <div>
          <p className="text-sm text-muted">Несгораемые</p>
          <Points value={me.durable} size="lg" />
        </div>
      </Panel>

      {start > 0 ? (
        <Panel className="mb-4 p-5">
          <p className="text-sm font-medium">График использования бюджета</p>
          <p className="mt-1 text-sm text-muted">
            Потрачено {used} из {start} (остаток {totalBalance(me)})
          </p>
          <div className="mt-3 h-2 bg-paper">
            <div
              className="h-2 bg-ink"
              style={{ width: `${Math.min(100, Math.round((used / start) * 100))}%` }}
            />
          </div>
        </Panel>
      ) : null}

      {state.settings.balanceWheel ? (
        <Panel className="mb-4 p-5">
          <p className="text-sm font-medium">Колесо баланса</p>
          <ul className="mt-3 space-y-3">
            {spentBySection.map((row) => (
              <li key={row.section}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{sectionLabels[row.section]}</span>
                  <span className="text-muted">{row.spent}</span>
                </div>
                <div className="h-2 bg-paper">
                  <div
                    className="h-2 bg-ink"
                    style={{
                      width: `${Math.round((row.spent / maxSpent) * 100)}%`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      {me.burnable > 0 && me.burnableUntil ? (
        <Panel className="mb-4 border-stamp/40 p-5">
          <p className="text-sm font-medium">Напоминания о сгорании</p>
          <p className="mt-1 text-sm text-muted">
            Остаток сгораемых баллов нужно успеть потратить до{" "}
            {formatDate(me.burnableUntil)}. HR может разослать до двух
            напоминаний (у вас: {me.burnNoticesSent ?? 0}/2).
          </p>
          {burnNotes.length ? (
            <ul className="mt-3 space-y-2 text-sm">
              {burnNotes.slice(0, 3).map((n) => (
                <li key={n.id} className="border-t border-line pt-2">
                  <p className="font-medium">{n.title}</p>
                  <p className="mt-1 text-muted">{n.body}</p>
                </li>
              ))}
            </ul>
          ) : null}
        </Panel>
      ) : null}

      {ledger.length === 0 ? (
        <Empty>Движений пока нет.</Empty>
      ) : (
        <ul className="divide-y divide-line border border-line bg-surface">
          {ledger.map((entry) => {
            const signed =
              entry.kind === "spend" || entry.kind === "manual_spend"
                ? -entry.amount
                : entry.amount;
            const split = [
              entry.burnableDelta
                ? `сгор. ${entry.burnableDelta > 0 ? "+" : ""}${entry.burnableDelta}`
                : null,
              entry.durableDelta
                ? `несгор. ${entry.durableDelta > 0 ? "+" : ""}${entry.durableDelta}`
                : null,
            ]
              .filter(Boolean)
              .join(", ");
            return (
              <li
                key={entry.id}
                className="flex items-start justify-between gap-3 px-5 py-4 text-base"
              >
                <div className="min-w-0">
                  <p className="font-medium">{entry.comment}</p>
                  <p className="mt-1 text-sm text-muted">
                    {formatDateTime(entry.at)} ·{" "}
                    {ledgerKindLabels[entry.kind] ?? entry.kind}
                    {split ? ` · ${split}` : ""}
                  </p>
                </div>
                <span
                  className={`shrink-0 font-points tabular-nums ${
                    signed < 0 ? "text-danger" : "text-pine"
                  }`}
                >
                  {signed > 0 ? "+" : ""}
                  {signed}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
