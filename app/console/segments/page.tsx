"use client";

import { useState } from "react";
import { Button, Field, Input, PageHeader, Select } from "@/components/ui";
import { sectionLabels } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { SectionId } from "@/lib/types";

export default function SegmentsPage() {
  const { me, state, upsertSegment, setPersonSegments, setCategoryLimit } =
    useStore();
  const [title, setTitle] = useState("Производство, смена А");
  const [allow, setAllow] = useState<"all" | SectionId>("all");
  const [personId, setPersonId] = useState("maria");
  const [segPick, setSegPick] = useState("seg-all");

  if (!me || (me.role !== "hr" && me.role !== "admin")) return null;

  return (
    <div>
      <PageHeader
        title="Сегменты и лимиты"
        lead="Группы видимости разделов и лимиты по категориям."
      />

      <section className="border border-line bg-surface p-5">
        <p className="text-sm font-medium">Сегменты</p>
        <ul className="mt-3 space-y-2 text-sm">
          {state.segments.map((s) => (
            <li key={s.id}>
              {s.title} ·{" "}
              {s.sectionAllow === "all"
                ? "все разделы"
                : s.sectionAllow.map((x) => sectionLabels[x]).join(", ")}
            </li>
          ))}
        </ul>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Field label="Новый сегмент">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Доступ">
            <Select
              value={allow}
              onChange={(e) => setAllow(e.target.value as "all" | SectionId)}
            >
              <option value="all">Все разделы</option>
              {Object.entries(sectionLabels).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Button
          className="mt-3"
          onClick={() => {
            if (!title.trim()) return;
            upsertSegment({
              id: `seg-${Date.now()}`,
              title: title.trim(),
              sectionAllow: allow === "all" ? "all" : [allow],
            });
            setTitle("Производство, смена Б");
          }}
        >
          Создать сегмент
        </Button>
      </section>

      <section className="mt-6 border border-line bg-surface p-5">
        <p className="text-sm font-medium">Назначить сегмент сотруднику</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Field label="Сотрудник">
            <Select value={personId} onChange={(e) => setPersonId(e.target.value)}>
              {state.people.slice(0, 20).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Сегмент">
            <Select value={segPick} onChange={(e) => setSegPick(e.target.value)}>
              {state.segments.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Button
          className="mt-3"
          onClick={() => setPersonSegments(personId, [segPick])}
        >
          Сохранить
        </Button>
      </section>

      <section className="mt-6 border border-line bg-surface p-5">
        <p className="text-sm font-medium">Лимиты категорий</p>
        <ul className="mt-3 space-y-3">
          {state.categoryLimits.map((c) => (
            <li
              key={c.section}
              className="flex flex-wrap items-center justify-between gap-3 text-sm"
            >
              <span>
                {sectionLabels[c.section]} · лимит {c.maxPerYear || "нет"} ·{" "}
                {c.enabled ? "вкл" : "выкл"}
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    setCategoryLimit(c.section, { enabled: !c.enabled })
                  }
                >
                  {c.enabled ? "Выключить" : "Включить"}
                </Button>
                <Button
                  onClick={() =>
                    setCategoryLimit(c.section, {
                      maxPerYear: c.maxPerYear ? c.maxPerYear : 3000,
                    })
                  }
                >
                  Лимит 3000
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
