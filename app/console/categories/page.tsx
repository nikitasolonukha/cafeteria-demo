"use client";

import { useState } from "react";
import { Button, Field, Input, PageHeader, Select, Textarea } from "@/components/ui";
import { sectionLabels } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { SectionId } from "@/lib/types";

export default function CategoriesPage() {
  const { me, state, createCategory, accountingExport, payoutExport, markDataGap } =
    useStore();
  const [section, setSection] = useState<SectionId>("general");
  const [title, setTitle] = useState("Семейный пакет");
  const [copied, setCopied] = useState("");

  if (!me || (me.role !== "hr" && me.role !== "admin")) return null;

  return (
    <div>
      <PageHeader
        title="Полки и выгрузки"
        lead="Категории витрины, бухгалтерия и реестр «к выплате» по чекам."
      />

      <div className="border border-line bg-surface p-5">
        <p className="text-sm font-medium">Новая полка</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Field label="Раздел">
            <Select
              value={section}
              onChange={(e) => setSection(e.target.value as SectionId)}
            >
              {Object.entries(sectionLabels).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Название полки">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
        </div>
        <Button
          className="mt-4"
          variant="primary"
          onClick={() => {
            createCategory(section, title);
            setTitle("Новая полка");
          }}
        >
          Создать
        </Button>
        <ul className="mt-4 space-y-1 text-sm text-muted">
          {state.categories.map((c) => (
            <li key={c.id}>
              {sectionLabels[c.section]} → {c.title}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="border border-line bg-surface p-5">
          <p className="text-sm font-medium">Выгрузка в бухгалтерию</p>
          <Textarea
            className="mt-3 min-h-40 font-mono text-xs"
            readOnly
            value={accountingExport()}
          />
          <Button
            className="mt-3"
            onClick={async () => {
              await navigator.clipboard.writeText(accountingExport());
              setCopied("accounting");
            }}
          >
            {copied === "accounting" ? "Скопировано" : "Копировать"}
          </Button>
        </div>
        <div className="border border-line bg-surface p-5">
          <p className="text-sm font-medium">К выплате (компенсации по чекам)</p>
          <Textarea
            className="mt-3 min-h-40 font-mono text-xs"
            readOnly
            value={payoutExport()}
          />
          <Button
            className="mt-3"
            onClick={async () => {
              await navigator.clipboard.writeText(payoutExport());
              setCopied("payout");
            }}
          >
            {copied === "payout" ? "Скопировано" : "Копировать"}
          </Button>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted">{markDataGap()}</p>
    </div>
  );
}
