"use client";

import { useState } from "react";
import { Button, Field, Input, PageHeader } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function ConsoleSurveysPage() {
  const { me, state, createSurvey, setSurveyOpen } = useStore();
  const [title, setTitle] = useState("Оценка витрины октября");
  const [description, setDescription] = useState("Короткий опрос после окна выбора.");
  const [q1, setQ1] = useState("Хватило ли баллов на нужные льготы?");
  const [opts, setOpts] = useState("Да; Нет; Затрудняюсь");

  if (!me || (me.role !== "hr" && me.role !== "admin")) return null;

  return (
    <div>
      <PageHeader title="Опросы" lead="Конструктор и выгрузка ответов." />

      <div className="border border-line bg-surface p-5">
        <p className="text-sm font-medium">Новый опрос</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Field label="Название">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Описание">
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Вопрос">
              <Input value={q1} onChange={(e) => setQ1(e.target.value)} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Варианты через ;">
              <Input value={opts} onChange={(e) => setOpts(e.target.value)} />
            </Field>
          </div>
        </div>
        <Button
          variant="primary"
          className="mt-4"
          onClick={() => {
            if (!title.trim() || !q1.trim()) return;
            createSurvey({
              title: title.trim(),
              description: description.trim(),
              open: true,
              questions: [
                {
                  id: `q-${Date.now()}`,
                  text: q1.trim(),
                  options: opts
                    .split(";")
                    .map((o) => o.trim())
                    .filter(Boolean),
                },
              ],
            });
            setTitle("Опрос после окна");
            setDescription("Сбор обратной связи.");
            setQ1("Будете ли рекомендовать кафетерий коллегам?");
          }}
        >
          Создать
        </Button>
      </div>

      <ul className="mt-8 space-y-4">
        {state.surveys.map((s) => {
          const csv = [
            ["person", ...s.questions.map((q) => q.text)].join("\t"),
            ...s.responses.map((r) => {
              const person = state.people.find((p) => p.id === r.personId);
              return [
                person?.name ?? r.personId,
                ...s.questions.map((q) => r.answers[q.id] ?? ""),
              ].join("\t");
            }),
          ].join("\n");
          return (
            <li key={s.id} className="border border-line bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{s.title}</p>
                  <p className="mt-1 text-sm text-muted">
                    Ответов: {s.responses.length} · {s.open ? "открыт" : "закрыт"}
                  </p>
                </div>
                <Button onClick={() => setSurveyOpen(s.id, !s.open)}>
                  {s.open ? "Закрыть" : "Открыть"}
                </Button>
              </div>
              <pre className="mt-4 overflow-x-auto bg-paper p-3 text-xs">{csv}</pre>
              <Button
                className="mt-3"
                onClick={async () => {
                  await navigator.clipboard.writeText(csv);
                }}
              >
                Копировать TSV
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
