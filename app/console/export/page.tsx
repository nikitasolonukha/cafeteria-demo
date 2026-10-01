"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, PageHeader, Textarea } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function ExportPage() {
  const { me, accountingExport, payoutExport } = useStore();
  const [copied, setCopied] = useState<"acc" | "pay" | "">("");
  if (!me || (me.role !== "hr" && me.role !== "admin")) return null;

  const tsv = accountingExport();
  const payout = payoutExport();

  return (
    <div>
      <PageHeader
        title="Выгрузки"
        lead="Бухгалтерия по заказам и реестр «к выплате» по компенсациям чеков."
      />
      <div className="mb-4">
        <Link href="/console/categories" className="text-sm text-stamp">
          Полки каталога и те же выгрузки
        </Link>
      </div>
      <p className="mb-2 text-sm font-medium">Бухгалтерия (заказы)</p>
      <Textarea value={tsv} readOnly className="min-h-48 font-mono text-xs" />
      <Button
        variant="primary"
        className="mt-3"
        onClick={async () => {
          await navigator.clipboard.writeText(tsv);
          setCopied("acc");
        }}
      >
        {copied === "acc" ? "Скопировано" : "Копировать TSV заказов"}
      </Button>

      <p className="mb-2 mt-8 text-sm font-medium">К выплате (чеки)</p>
      <Textarea value={payout} readOnly className="min-h-40 font-mono text-xs" />
      <Button
        className="mt-3"
        onClick={async () => {
          await navigator.clipboard.writeText(payout);
          setCopied("pay");
        }}
      >
        {copied === "pay" ? "Скопировано" : "Копировать реестр выплат"}
      </Button>
    </div>
  );
}
