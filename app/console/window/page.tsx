"use client";

import { useState } from "react";
import { Button, Field, Input, PageHeader, Panel } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function WindowPage() {
  const { me, state, setWindowOpen, setWindowDates, setWindowSegments, setChangeMode, notifyWindow } =
    useStore();
  const [start, setStart] = useState(state.window.start);
  const [end, setEnd] = useState(state.window.end);
  const [msg, setMsg] = useState<string | null>(null);

  if (!me || (me.role !== "hr" && me.role !== "admin")) return null;

  const isAdmin = me.role === "admin";

  return (
    <div>
      <PageHeader
        title="Окно выбора"
        lead="При закрытии каталог виден, подтверждение заказов блокируется."
      />
      <Panel className="max-w-xl p-5">
        <p className="text-sm font-medium">{state.window.title}</p>
        <p className="mt-2 text-sm text-muted">
          {formatDate(state.window.start)} — {formatDate(state.window.end)}
        </p>
        <p className={`mt-4 text-sm ${state.window.open ? "text-pine" : "text-danger"}`}>
          Сейчас: {state.window.open ? "открыто" : "закрыто"}
        </p>
        <p className="mt-2 text-sm text-muted">
          Режим изменений:{" "}
          {state.window.changeMode === "restrict"
            ? "ограничивает оформление вне окна"
            : "информирует"}
        </p>
        {isAdmin ? (
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              variant="primary"
              disabled={state.window.open}
              onClick={() => setWindowOpen(true)}
            >
              Открыть
            </Button>
            <Button
              variant="danger"
              disabled={!state.window.open}
              onClick={() => setWindowOpen(false)}
            >
              Закрыть
            </Button>
            <Button
              onClick={() =>
                setChangeMode(
                  state.window.changeMode === "restrict" ? "inform" : "restrict",
                )
              }
            >
              Сменить режим
            </Button>
            <Button
              onClick={() => {
                const res = notifyWindow();
                setMsg(`Уведомлений: ${res.sent}`);
              }}
            >
              Разослать уведомление
            </Button>
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted">
            Управление окном доступно администратору (Павел).
          </p>
        )}
        {msg ? (
          <p className={`mt-3 text-sm ${msg.startsWith("Уведом") ? "text-pine" : "text-danger"}`}>
            {msg}
          </p>
        ) : null}
      </Panel>

      <Panel className="mt-4 max-w-xl p-5">
        <p className="text-sm font-medium">Даты кампании</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Начало">
            <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </Field>
          <Field label="Окончание">
            <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </Field>
        </div>
        {msg ? (
          <p className={`mt-3 text-sm ${msg.startsWith("Уведом") ? "text-pine" : "text-danger"}`}>
            {msg}
          </p>
        ) : null}
        <Button
          className="mt-4"
          onClick={() => {
            const res = setWindowDates(start, end);
            if (!res.ok) setMsg(res.reason);
            else setMsg(null);
          }}
        >
          Сохранить даты
        </Button>
      </Panel>

      <Panel className="mt-4 max-w-xl p-5">
        <p className="text-sm font-medium">Сегменты кампании</p>
        <p className="mt-1 text-sm text-muted">
          Кто видит оформление в этом окне. «Все сотрудники» снимает ограничение.
        </p>
        <ul className="mt-3 space-y-2">
          {state.segments.map((seg) => {
            const on = (state.window.segmentIds ?? []).includes(seg.id);
            return (
              <li key={seg.id}>
                <button
                  type="button"
                  className={`w-full rounded-[8px] border px-3 py-2 text-left text-sm ${
                    on
                      ? "border-ink bg-ink text-surface"
                      : "border-line bg-surface text-ink"
                  }`}
                  onClick={() => {
                    const cur = state.window.segmentIds ?? [];
                    const next = on
                      ? cur.filter((id) => id !== seg.id)
                      : [...cur, seg.id];
                    setWindowSegments(next.length ? next : ["seg-all"]);
                  }}
                >
                  {seg.title}
                </button>
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}
