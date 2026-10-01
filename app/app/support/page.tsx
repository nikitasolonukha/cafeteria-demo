"use client";

import { useState } from "react";
import { FilenameButtons } from "@/components/document-preview";
import { Button, Empty, Field, FilePickButton, Input, PageHeader, Panel, Textarea } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function SupportPage() {
  const { me, state, createTicket, reopenTicket } = useStore();
  const [topic, setTopic] = useState("Не пришёл код сертификата");
  const [body, setBody] = useState(
    "Оформила сертификат отеля, код в заказ не пришёл. Прошу продублировать в ленту.",
  );
  const [fileName, setFileName] = useState("skrin-zakaza.png");
  const [done, setDone] = useState(false);

  if (!me) return null;
  const mine = state.tickets.filter((t) => t.personId === me.id);

  return (
    <div>
      <PageHeader
        title="Поддержка"
        lead={`Обращение в очередь HR. SLA ${state.settings.supportSlaHours} ч. Файл открывается в карточке.`}
      />

      <Panel className="grid gap-3 p-5">
        <Field label="Тема">
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            name="support-topic"
            autoComplete="off"
          />
        </Field>
        <Field label="Описание">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            name="support-body"
            autoComplete="off"
          />
        </Field>
        <div className="flex flex-col gap-2 text-base">
          <span className="text-muted">Вложение</span>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
            <Input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              name="support-file"
              aria-label="Вложение"
              autoComplete="off"
            />
            <FilePickButton onName={setFileName} />
          </div>
        </div>
        {fileName ? <FilenameButtons names={[fileName]} /> : null}
        <div>
          <Button
            variant="primary"
            disabled={!topic.trim() || !body.trim()}
            onClick={() => {
              createTicket(
                topic.trim(),
                body.trim(),
                fileName.trim() ? [fileName.trim()] : undefined,
              );
              setDone(true);
            }}
          >
            Отправить
          </Button>
          {done ? (
            <p className="mt-2 text-sm text-pine">Обращение создано.</p>
          ) : null}
        </div>
      </Panel>

      <h2 className="mt-8 section-title">Мои обращения</h2>
      {mine.length === 0 ? (
        <div className="mt-3">
          <Empty>Пока пусто. Отправьте обращение формой выше.</Empty>
        </div>
      ) : (
        <ul className="mt-3 space-y-2">
          {mine.map((t) => (
            <li key={t.id}>
              <Panel className="p-4 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="font-medium">{t.topic}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={
                        t.status === "done"
                          ? "text-pine"
                          : t.status === "escalated"
                            ? "text-danger"
                            : "text-ink"
                      }
                    >
                      {t.status === "done"
                        ? "закрыто"
                        : t.status === "escalated"
                          ? "эскалировано"
                          : "открыто"}
                    </span>
                    {t.status !== "open" ? (
                      <Button onClick={() => reopenTicket(t.id)}>Открыть снова</Button>
                    ) : null}
                  </div>
                </div>
                <p className="mt-2 text-muted">{t.body}</p>
                {t.attachments?.length ? (
                  <div className="mt-2">
                    <FilenameButtons names={t.attachments} />
                  </div>
                ) : null}
                <p className="mt-2 text-xs text-muted">
                  {t.id} · {formatDateTime(t.createdAt)}
                  {t.slaHours ? ` · SLA ${t.slaHours} ч` : ""}
                </p>
              </Panel>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
