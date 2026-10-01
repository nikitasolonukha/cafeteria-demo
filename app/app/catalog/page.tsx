"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MenuSelect } from "@/components/menu-select";
import { Empty, Input, PageHeader, Panel, Points } from "@/components/ui";
import { sectionLabels } from "@/lib/format";
import { visibleBenefits } from "@/lib/rules";
import { useStore } from "@/lib/store";
import type { SectionId } from "@/lib/types";

export default function CatalogPage() {
  const { me, state } = useStore();
  const [q, setQ] = useState("");
  const [section, setSection] = useState<SectionId | "all">("all");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    if (me?.role === "vip") setSection("general");
  }, [me?.role]);

  const items = useMemo(() => {
    if (!me) return [];
    const max = Number(maxPrice) || Infinity;
    return visibleBenefits(me, state.benefits).filter((b) => {
      const matchQ =
        !q ||
        b.title.toLowerCase().includes(q.toLowerCase()) ||
        b.description.toLowerCase().includes(q.toLowerCase());
      const matchS = section === "all" || b.section === section;
      const matchC = categoryId === "all" || b.categoryId === categoryId;
      const matchT = type === "all" || b.type === type;
      const matchP = b.price <= max;
      return matchQ && matchS && matchC && matchT && matchP;
    });
  }, [me, state.benefits, q, section, categoryId, type, maxPrice]);

  if (!me) return null;

  if (me.exclusion) {
    return (
      <div>
        <PageHeader title="Каталог" />
        <Empty>
          Вы в группе исключения («хламовник»). Доступ к витрине ограничен.
          Обратитесь в HR.
        </Empty>
      </div>
    );
  }

  const sections = Array.from(
    new Set(visibleBenefits(me, state.benefits).map((b) => b.section)),
  ) as SectionId[];

  const cats = state.categories.filter(
    (c) => section === "all" || c.section === section,
  );

  const byShelf = useMemo(() => {
    const map = new Map<string, typeof items>();
    for (const b of items) {
      const key = b.categoryId ?? b.section;
      const list = map.get(key) ?? [];
      list.push(b);
      map.set(key, list);
    }
    return Array.from(map.entries());
  }, [items]);

  return (
    <div>
      <PageHeader
        title="Каталог"
        lead="Раздел → категория (полка) → позиция. Поиск и фильтры."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск по названию и описанию…"
          className="sm:max-w-xs"
        />
        <Input
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="Макс. цена"
          inputMode="numeric"
          className="sm:max-w-[8rem]"
        />
        <MenuSelect
          className="sm:w-44"
          aria-label="Тип льготы"
          value={type}
          onChange={setType}
          options={[
            { value: "all", label: "Все типы" },
            { value: "certificate", label: "Сертификат" },
            { value: "digital", label: "Цифровой" },
            { value: "physical", label: "Физический" },
            { value: "dms", label: "ДМС" },
            { value: "leave", label: "Отпуск" },
            { value: "booking", label: "По записи" },
            { value: "docs", label: "С документами" },
            { value: "family", label: "Семья" },
          ]}
        />
        <MenuSelect
          className="sm:w-52"
          aria-label="Полка каталога"
          value={categoryId}
          onChange={setCategoryId}
          options={[
            { value: "all", label: "Все полки" },
            ...cats.map((c) => ({ value: c.id, label: c.title })),
          ]}
        />
        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={section === "all"}
            onClick={() => {
              setSection("all");
              setCategoryId("all");
            }}
          >
            Все
          </FilterChip>
          {sections.map((s) => (
            <FilterChip
              key={s}
              active={section === s}
              onClick={() => {
                setSection(s);
                setCategoryId("all");
              }}
            >
              {sectionLabels[s]}
            </FilterChip>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <Empty>Ничего не найдено для вашей роли или запроса.</Empty>
      ) : (
        <div className="space-y-10">
          {byShelf.map(([shelfId, shelfItems]) => {
            const cat = state.categories.find((c) => c.id === shelfId);
            const title = cat?.title ?? sectionLabels[shelfId as SectionId] ?? shelfId;
            return (
              <section key={shelfId}>
                <h2 className="section-title">{title}</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {shelfItems.map((b) => (
                    <Link key={b.id} href={`/app/catalog/${b.id}`}>
                      <Panel className="h-full p-5 hover:bg-paper">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-base font-medium">{b.title}</p>
                            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                              {b.description}
                            </p>
                            {b.imageLabel ? (
                              <p className="mt-2 text-sm text-muted">
                                вложение: {b.imageLabel}
                              </p>
                            ) : null}
                          </div>
                          <Points value={b.price} size="sm" />
                        </div>
                      </Panel>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 rounded-[8px] border px-3 text-sm ${
        active ? "border-ink bg-ink text-surface" : "border-line bg-surface text-ink"
      }`}
    >
      {children}
    </button>
  );
}
