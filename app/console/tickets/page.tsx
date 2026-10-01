"use client";

import { Button, Empty, PageHeader, Panel } from "@/components/ui";
import { FilenameButtons } from "@/components/document-preview";
import { formatDateTime } from "@/lib/format";
import { useStore } from "@/lib/store";

function ticketAuthor(
  personId: string,
  people: { id: string; name: string }[],
) {
  if (personId === "guest") return "Гость (не в базе)";
  return people.find((p) => p.id === personId)?.name ?? "Сотрудник";
}

export default function TicketsPage() {
  const {
    me,
    state,
    resolveTicket,
    escalateTicket,
    reopenTicket,
    resendCode,
    setSuggestionStatus,
  } = useStore();
  if (!me || (me.role !== "hr" && me.role !== "admin")) return null;

  const suggestions = state.suggestions;

  return (
    <div>
      <PageHeader title="Обращения" lead="Очередь поддержки и предложения льгот." />
      {state.tickets.length === 0 ? (
        <Empty>Обращений нет.</Empty>
      ) : (
        <ul className="space-y-2">
          {state.tickets.map((t) => (
            <li key={t.id}>
              <Panel className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">
                      {t.topic} · {t.id}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {ticketAuthor(t.personId, state.people)} ·{" "}
                      {formatDateTime(t.createdAt)}
                      {t.slaHours ? ` · SLA ${t.slaHours} ч` : ""}
                    </p>
                    <p className="mt-2 text-sm">{t.body}</p>
                    {t.attachments?.length ? (
                      <div className="mt-2">
                        <p className="text-xs text-muted">Вложения</p>
                        <FilenameButtons names={t.attachments} />
                      </div>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {t.status === "open" ? (
                      <>
                        <Button onClick={() => resolveTicket(t.id)}>Закрыть</Button>
                        <Button onClick={() => escalateTicket(t.id)}>
                          Эскалация
                        </Button>
                      </>
                    ) : (
                      <>
                        <span
                          className={`text-sm ${
                            t.status === "escalated" ? "text-danger" : "text-pine"
                          }`}
                        >
                          {t.status === "escalated" ? "эскалировано" : "закрыто"}
                        </span>
                        <Button onClick={() => reopenTicket(t.id)}>
                          Открыть снова
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Panel>
            </li>
          ))}
        </ul>
      )}

      <section className="mt-8">
        <h2 className="section-title">Повтор кода сертификата</h2>
        <ul className="mt-3 divide-y divide-line border border-line bg-surface">
          {state.orders
            .filter((o) => o.code)
            .slice(0, 8)
            .map((o) => (
              <li
                key={o.id}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <span>
                  {o.title} · {o.code}
                </span>
                <Button onClick={() => resendCode(o.id)}>Отправить снова</Button>
              </li>
            ))}
        </ul>
      </section>

      {suggestions.length ? (
        <section className="mt-8">
          <h2 className="section-title">Предложения льгот</h2>
          <ul className="mt-3 divide-y divide-line border border-line bg-surface">
            {suggestions.map((s) => {
              const person = state.people.find((p) => p.id === s.personId);
              return (
                <li
                  key={s.id}
                  className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {s.title} · {person?.name ?? "Сотрудник"} ·{" "}
                      {s.status === "seen" ? "просмотрено" : "новое"}
                    </p>
                    <p className="mt-1 text-muted">{s.body}</p>
                  </div>
                  <Button
                    onClick={() =>
                      setSuggestionStatus(s.id, s.status === "seen" ? "new" : "seen")
                    }
                  >
                    {s.status === "seen" ? "Вернуть в новые" : "Отметить просмотренным"}
                  </Button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
