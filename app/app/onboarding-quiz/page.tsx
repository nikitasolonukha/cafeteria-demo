"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, PageHeader } from "@/components/ui";
import { useStore } from "@/lib/store";

const questions = [
  {
    id: "focus",
    text: "Что важнее в ближайший год?",
    options: ["Здоровье", "Отдых", "Развитие", "Семья"],
  },
  {
    id: "family",
    text: "Нужны ли льготы для семьи?",
    options: ["Да", "Нет", "Пока не знаю"],
  },
  {
    id: "format",
    text: "Предпочтительный формат?",
    options: ["Цифровые сервисы", "Офлайн / отдых", "Смешанный"],
  },
];

export default function OnboardingQuizPage() {
  const { me, saveNeedsQuiz } = useStore();
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [err, setErr] = useState("");

  if (!me) return null;
  if (me.needsQuizDone) {
    return (
      <div>
        <PageHeader title="Опросник пройден" lead="Можно собирать пакет." />
        <Button variant="primary" onClick={() => router.push("/app/package")}>
          К пакету
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Опросник потребностей"
        lead="Ответы сформируют персональные рекомендации в конструкторе пакета."
      />
      <ul className="space-y-6">
        {questions.map((q) => (
          <li key={q.id} className="border border-line bg-surface p-5">
            <p className="text-sm font-medium">{q.text}</p>
            <div className="mt-3 space-y-2">
              {q.options.map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === opt}
                    onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </li>
        ))}
      </ul>
      {err ? <p className="mt-4 text-sm text-danger">{err}</p> : null}
      <Button
        variant="primary"
        className="mt-6"
        onClick={() => {
          for (const q of questions) {
            if (!answers[q.id]) {
              setErr("Ответьте на все вопросы");
              return;
            }
          }
          const res = saveNeedsQuiz(answers);
          if (!res.ok) setErr(res.reason);
          else router.push("/app/package");
        }}
      >
        Получить рекомендации
      </Button>
    </div>
  );
}
