"use client";

import { useState } from "react";
import { Button, Field, Input, Textarea, PageHeader } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function SuggestPage() {
  const { suggestBenefit } = useStore();
  const [title, setTitle] = useState("Компенсация обедов в офисе");
  const [body, setBody] = useState(
    "Предлагаю добавить компенсацию обедов в столовой Альтаир — 20 обедов за период окна.",
  );
  const [done, setDone] = useState(false);

  return (
    <div>
      <PageHeader
        title="Предложить льготу"
        lead="Идея уйдёт HR. В демо без почты — только в пульте."
      />
      <div className="border border-line bg-surface p-5">
        <div className="grid gap-3">
          <Field label="Название">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Описание">
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} />
          </Field>
        </div>
        {done ? (
          <p className="mt-4 text-sm text-pine">Отправлено в пульт HR</p>
        ) : (
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => {
              if (!title.trim()) return;
              suggestBenefit(title, body);
              setDone(true);
              setTitle("");
              setBody("");
            }}
          >
            Отправить HR
          </Button>
        )}
      </div>
    </div>
  );
}
