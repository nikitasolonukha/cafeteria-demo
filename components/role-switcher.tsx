"use client";

import { useRouter } from "next/navigation";
import { MenuSelect } from "./menu-select";
import { homePathFor } from "@/lib/rules";
import { loginAccounts } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { roleLabels } from "@/lib/format";

export function RoleSwitcher({ compact = false }: { compact?: boolean }) {
  const { state, me, login } = useStore();
  const router = useRouter();

  if (!me) return null;

  const options = loginAccounts
    .map((account) => {
      const person = state.people.find((p) => p.id === account.id);
      if (!person) return null;
      return {
        value: account.id,
        label: person.name,
        meta: roleLabels[person.role],
      };
    })
    .filter(Boolean) as { value: string; label: string; meta: string }[];

  return (
    <div className={`flex flex-col gap-1 ${compact ? "" : "px-3"}`}>
      {!compact ? (
        <span className="text-sm text-muted">Смотреть как</span>
      ) : null}
      <MenuSelect
        aria-label="Сменить роль демо"
        value={me.id}
        options={options}
        compactTrigger={compact}
        align={compact ? "end" : "start"}
        onChange={(id) => {
          const path = login(id);
          window.setTimeout(() => router.replace(path), 0);
        }}
      />
    </div>
  );
}
