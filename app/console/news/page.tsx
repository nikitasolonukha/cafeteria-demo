"use client";

import { useState } from "react";
import { Button, Field, Input, Textarea, PageHeader } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function ConsoleNewsPage() {
  const { me, state, publishNews, moderateComment, setBannerActive } = useStore();
  const [title, setTitle] = useState("Окно выбора закрывается 31 октября");
  const [body, setBody] = useState(
    "Успейте оформить пакет до конца месяца. Неиспользованные сгораемые баллы сгорят 30 сентября 2027.",
  );

  if (!me || (me.role !== "hr" && me.role !== "admin")) return null;

  return (
    <div>
      <PageHeader title="Новости и баннеры" lead="Публикация и модерация комментариев." />

      <div className="border border-line bg-surface p-5">
        <p className="text-sm font-medium">Новая новость</p>
        <div className="mt-3 grid gap-3">
          <Field label="Заголовок">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Текст">
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} />
          </Field>
        </div>
        <Button
          variant="primary"
          className="mt-4"
          onClick={() => {
            publishNews(title, body);
            setTitle("Напоминание о пакете");
            setBody("Проверьте корзину и подтвердите набор до закрытия окна.");
          }}
        >
          Опубликовать
        </Button>
      </div>

      <section className="mt-8">
        <h2 className="section-title">Баннеры главной</h2>
        <ul className="mt-3 divide-y divide-line border border-line bg-surface">
          {state.banners.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <div>
                <p className="font-medium">{b.title}</p>
                <p className="text-muted">{b.body}</p>
              </div>
              <Button onClick={() => setBannerActive(b.id, !b.active)}>
                {b.active ? "Выключить" : "Включить"}
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="section-title">Лента и комментарии</h2>
        <ul className="mt-3 space-y-4">
          {state.news.map((n) => (
            <li key={n.id} className="border border-line bg-surface p-4">
              <p className="text-sm font-medium">{n.title}</p>
              <p className="mt-1 text-xs text-muted">{formatDateTime(n.at)}</p>
              <ul className="mt-3 space-y-2">
                {n.comments.map((c) => {
                  const author = state.people.find((p) => p.id === c.personId);
                  return (
                    <li
                      key={c.id}
                      className="flex items-start justify-between gap-3 text-sm"
                    >
                      <div>
                        <span className="font-medium">{author?.name}</span>
                        {c.hidden ? (
                          <span className="text-danger"> · скрыт</span>
                        ) : null}
                        <p className="text-muted">{c.body}</p>
                      </div>
                      <Button
                        onClick={() => moderateComment(n.id, c.id, !c.hidden)}
                      >
                        {c.hidden ? "Показать" : "Скрыть"}
                      </Button>
                    </li>
                  );
                })}
                {!n.comments.length ? (
                  <li className="text-sm text-muted">Комментариев нет</li>
                ) : null}
              </ul>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
