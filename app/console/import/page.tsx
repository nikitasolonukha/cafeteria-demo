"use client";

import { useState } from "react";
import { Button, PageHeader, Textarea } from "@/components/ui";
import { useStore } from "@/lib/store";

const sample = `name;title;department;grade;years;email
Иван Тестов;Инженер;Производство;C;2;ivan.testov@altair.demo
Мария Импорт;Аналитик;Проекты;B;3;maria.import@altair.demo`;

export default function ImportPage() {
  const { me, importPeopleCsv } = useStore();
  const [text, setText] = useState(sample);
  const [msg, setMsg] = useState<string | null>(null);

  if (!me || (me.role !== "hr" && me.role !== "admin")) return null;

  return (
    <div>
      <PageHeader
        title="Импорт сотрудников"
        lead="Резервный канал вместо 1С. CSV/TSV: имя;должность;отдел;грейд;стаж;email."
      />
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-48 font-mono text-xs"
      />
      {msg ? <p className="mt-3 text-sm text-pine">{msg}</p> : null}
      <Button
        variant="primary"
        className="mt-4"
        onClick={() => {
          const res = importPeopleCsv(text);
          if (!res.ok) setMsg(res.reason);
          else setMsg(`Добавлено: ${res.added}`);
        }}
      >
        Импортировать
      </Button>
    </div>
  );
}
