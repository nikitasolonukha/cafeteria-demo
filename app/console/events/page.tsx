"use client";

import { useState } from "react";
import { Button, PageHeader } from "@/components/ui";
import { formatDateTime, formatPoints } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function EventsPage() {
  const { me, state, runEventGrant, sendBurnNotices, updateEmailTemplate } = useStore();
  const [msg, setMsg] = useState("");

  if (!me || (me.role !== "hr" && me.role !== "admin")) return null;

  return (
    <div>
      <PageHeader
        title="Событийные начисления"
        lead="Точечные гранты по поводу и напоминания о сгорании (не менее двух)."
      />
      {msg ? <p className="mb-4 text-sm text-pine">{msg}</p> : null}

      <ul className="space-y-3">
        {state.eventGrants.map((ev) => (
          <li key={ev.id} className="border border-line bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{ev.title}</p>
                <p className="mt-1 text-sm text-muted">
                  {formatPoints(ev.amount)} ·{" "}
                  {ev.burnable ? "сгораемые" : "несгораемые"} · аудитория{" "}
                  {ev.audience}
                  {ev.runAt ? ` · план ${ev.runAt}` : ""}
                </p>
                {ev.lastRunAt ? (
                  <p className="mt-1 text-xs text-muted">
                    Последний запуск: {formatDateTime(ev.lastRunAt)}
                  </p>
                ) : null}
              </div>
              <Button
                variant="primary"
                onClick={() => {
                  const res = runEventGrant(ev.id);
                  setMsg(res.ok ? `Начислено: ${ev.title}` : res.reason);
                }}
              >
                Запустить сейчас
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 border border-line bg-surface p-5">
        <p className="text-sm font-medium">Напоминания о сгорании</p>
        <p className="mt-1 text-sm text-muted">
          Каждому сотруднику со сгораемым остатком — до 2 уведомлений.
        </p>
        <Button
          className="mt-4"
          onClick={() => {
            const res = sendBurnNotices();
            setMsg(`Напоминаний отправлено: ${res.sent}`);
          }}
        >
          Разослать напоминания
        </Button>
      </div>

      <section className="mt-8">
        <h2 className="section-title">Шаблоны писем (симуляция SMTP)</h2>
        <ul className="mt-3 space-y-2">
          {state.emailTemplates.map((t) => (
            <li key={t.id} className="border border-line bg-surface p-4 text-sm">
              <p className="font-medium">{t.title}</p>
              <textarea
                className="control-field mt-2 min-h-20 w-full"
                defaultValue={t.body}
                onBlur={(e) => {
                  if (e.target.value !== t.body) updateEmailTemplate(t.id, e.target.value);
                }}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
