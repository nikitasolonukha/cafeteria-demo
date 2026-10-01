"use client";

import { useState } from "react";
import Link from "next/link";
import { fileAsAttachment } from "@/components/document-preview";
import {
  Button,
  Field,
  Input,
  PageHeader,
  Panel,
  Points,
  Select,
  Textarea,
} from "@/components/ui";
import { sectionLabels } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { BenefitType, SectionId } from "@/lib/types";

export default function ConsoleCatalogPage() {
  const { me, state, archiveBenefit, createBenefit, addCodes, deleteBenefit } = useStore();
  const [title, setTitle] = useState("Абонемент в бассейн");
  const [price, setPrice] = useState("500");
  const [section, setSection] = useState<SectionId>("general");
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState<BenefitType>("digital");
  const [description, setDescription] = useState(
    "8 посещений бассейна «Ритм» в течение месяца.",
  );
  const [attachTitle, setAttachTitle] = useState("Pravila-basseyn.pdf");
  const [attachKind, setAttachKind] = useState<"pdf" | "image">("pdf");
  const [codeBatch, setCodeBatch] = useState("POOL-2201, POOL-2202, POOL-2203");
  const [codeTarget, setCodeTarget] = useState("hotel");
  const [flash, setFlash] = useState("");

  if (!me || (me.role !== "hr" && me.role !== "admin")) return null;

  const threshold = state.settings.codeStockThreshold;
  const sectionCats = state.categories.filter((c) => c.section === section);

  return (
    <div>
      <PageHeader
        title="Каталог"
        lead="Создание, архивация и загрузка партий кодов. Архив скрывает карточку из витрины."
      />
      {flash ? <p className="mb-4 text-sm text-pine">{flash}</p> : null}

      <Panel className="mb-6 grid gap-3 p-5 md:grid-cols-2">
        <Field label="Название">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label="Цена">
          <Input value={price} onChange={(e) => setPrice(e.target.value)} />
        </Field>
        <Field label="Раздел">
          <Select
            value={section}
            onChange={(e) => {
              const s = e.target.value as SectionId;
              setSection(s);
              setCategoryId("");
            }}
          >
            {Object.entries(sectionLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Полка (категория)">
          <Select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Без полки</option>
            {sectionCats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Тип">
          <Select
            value={type}
            onChange={(e) => setType(e.target.value as BenefitType)}
          >
            <option value="digital">Цифровой</option>
            <option value="physical">Физический</option>
            <option value="certificate">Сертификат</option>
            <option value="leave">Отпуск</option>
            <option value="dms">ДМС</option>
            <option value="family">Семья</option>
            <option value="booking">По записи</option>
            <option value="docs">С документами</option>
            <option value="non_financial">Нефинансовая</option>
          </Select>
        </Field>
        <Field label="Вложение (название)">
          <Input
            value={attachTitle}
            onChange={(e) => setAttachTitle(e.target.value)}
            placeholder="Условия.pdf"
          />
        </Field>
        <Field label="Тип вложения">
          <Select
            value={attachKind}
            onChange={(e) => setAttachKind(e.target.value as "pdf" | "image")}
          >
            <option value="pdf">PDF</option>
            <option value="image">Изображение</option>
          </Select>
        </Field>
        <div className="md:col-span-2">
          <Field label="Описание">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
        </div>
        <div>
          <Button
            variant="primary"
            disabled={!title.trim()}
            onClick={() => {
              createBenefit({
                id: `b-${Date.now()}`,
                title: title.trim(),
                description: description.trim() || "Новая позиция",
                section,
                categoryId: categoryId || undefined,
                type,
                price: Number(price) || 0,
                supplier: "HR Альтаир",
                conditions: "Создано в демо-пульте",
                codes:
                  type === "certificate" ? ["NEW-1001", "NEW-1002"] : undefined,
                attachments: attachTitle.trim()
                  ? [fileAsAttachment(attachTitle.trim())]
                  : undefined,
              });
              setTitle("Абонемент в бассейн");
              setDescription("8 посещений бассейна «Ритм» в течение месяца.");
              setAttachTitle("Pravila-basseyn.pdf");
            }}
          >
            Создать позицию
          </Button>
        </div>
      </Panel>

      <Panel className="mb-6 grid gap-3 p-5 md:grid-cols-2">
        <Field label="Позиция для кодов">
          <Select
            value={codeTarget}
            onChange={(e) => setCodeTarget(e.target.value)}
          >
            {state.benefits
              .filter((b) => b.codes)
              .map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
          </Select>
        </Field>
        <Field label="Новые коды (через запятую или с новой строки)">
          <Textarea
            value={codeBatch}
            onChange={(e) => setCodeBatch(e.target.value)}
          />
        </Field>
        <div>
          <Button
            onClick={() => {
              const codes = codeBatch
                .split(/[\n,;]+/)
                .map((c) => c.trim())
                .filter(Boolean);
              addCodes(codeTarget, codes);
              setCodeBatch("POOL-3301, POOL-3302");
            }}
          >
            Загрузить партию
          </Button>
        </div>
      </Panel>

      <div className="overflow-x-auto border border-line bg-surface">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Позиция</th>
              <th className="px-4 py-3 font-medium">Раздел</th>
              <th className="px-4 py-3 font-medium">Цена</th>
              <th className="px-4 py-3 font-medium">Коды</th>
              <th className="px-4 py-3 font-medium">Статус</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {state.benefits.map((b) => {
              const codesLeft = b.codes
                ? (b.codes.length ?? 0) - (b.usedCodes?.length ?? 0)
                : null;
              const low =
                codesLeft !== null && codesLeft <= threshold;
              return (
                <tr key={b.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-medium">
                    <Link
                      href={`/app/catalog/${b.id}`}
                      className="hover:text-stamp"
                    >
                      {b.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{sectionLabels[b.section]}</td>
                  <td className="px-4 py-3">
                    <Points value={b.price} size="sm" />
                  </td>
                  <td
                    className={`px-4 py-3 tabular-nums ${
                      low ? "text-danger" : "text-muted"
                    }`}
                  >
                    {codesLeft === null
                      ? "без кодов"
                      : low
                        ? `${codesLeft} (мало)`
                        : codesLeft}
                  </td>
                  <td className="px-4 py-3">
                    {b.archived ? "архив" : "витрина"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => archiveBenefit(b.id, !b.archived)}
                    >
                      {b.archived ? "Вернуть" : "В архив"}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        const res = deleteBenefit(b.id);
                        setFlash(
                          res.ok
                            ? `Удалено: ${b.title}`
                            : res.reason,
                        );
                      }}
                    >
                      Удалить
                    </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
