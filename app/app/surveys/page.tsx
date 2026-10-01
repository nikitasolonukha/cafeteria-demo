"use client";

import { useState } from "react";
import { Button, PageHeader } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function SurveysPage() {
  const { me, state, surveyAnswer } = useStore();
  const [answers, setAnswers] = useState<Record<string, Record<string, string>>>(
    {},
  );
  const [msg, setMsg] = useState<string | null>(null);

  if (!me) return null;
  if (!state.settings.surveys) {
    return (
      <div>
        <PageHeader title="Опросы" lead="Раздел выключен." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Опросы" lead="Ответы видны HR в пульте." />
      {msg ? <p className="mb-4 text-sm text-danger">{msg}</p> : null}
      <ul className="space-y-6">
        {state.surveys.map((survey) => {
          const done = survey.responses.some((r) => r.personId === me.id);
          return (
            <li key={survey.id} className="border border-line bg-surface p-5">
              <p className="text-sm font-medium">{survey.title}</p>
              <p className="mt-1 text-sm text-muted">{survey.description}</p>
              {!survey.open ? (
                <p className="mt-3 text-sm text-muted">Опрос закрыт</p>
              ) : done ? (
                <p className="mt-3 text-sm text-pine">Вы уже ответили</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {survey.questions.map((q) => (
                    <fieldset key={q.id}>
                      <legend className="text-sm font-medium">{q.text}</legend>
                      <div className="mt-2 space-y-2">
                        {q.options.map((opt) => (
                          <label
                            key={opt}
                            className="flex cursor-pointer items-center gap-2 text-sm"
                          >
                            <input
                              type="radio"
                              name={`${survey.id}-${q.id}`}
                              checked={
                                (answers[survey.id]?.[q.id] ?? q.options[0]) ===
                                opt
                              }
                              onChange={() =>
                                setAnswers((a) => ({
                                  ...a,
                                  [survey.id]: {
                                    ...(a[survey.id] ?? {}),
                                    [q.id]: opt,
                                  },
                                }))
                              }
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  ))}
                  <Button
                    variant="primary"
                    onClick={() => {
                      const picked = { ...(answers[survey.id] ?? {}) };
                      for (const q of survey.questions) {
                        if (!picked[q.id]) picked[q.id] = q.options[0];
                      }
                      const res = surveyAnswer(survey.id, picked);
                      if (!res.ok) setMsg(res.reason);
                      else setMsg(null);
                    }}
                  >
                    Отправить ответы
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
