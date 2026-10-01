"use client";

import { useState } from "react";
import { Button, PageHeader } from "@/components/ui";
import { roleLabels } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Role, RoleCapability } from "@/lib/types";

const ALL: RoleCapability[] = [
  "storefront",
  "console",
  "catalog_edit",
  "budgets",
  "audit",
  "settings",
  "approvals",
];

const capLabels: Record<RoleCapability, string> = {
  storefront: "Витрина",
  console: "Пульт",
  catalog_edit: "Каталог",
  budgets: "Бюджеты",
  audit: "Аудит",
  settings: "Настройки",
  approvals: "Согласования",
};

export default function RolesPage() {
  const { me, state, setRoleMap, setExclusion, setRole } = useStore();
  const [msg, setMsg] = useState("");

  if (!me || me.role !== "admin") return null;

  const roles = Object.keys(state.roleMap) as Role[];

  return (
    <div>
      <PageHeader
        title="Роли и исключения"
        lead="Карта «роль → права» и группа Exclusion («хламовник»)."
      />
      {msg ? <p className="mb-4 text-sm text-pine">{msg}</p> : null}

      <ul className="space-y-4">
        {roles.map((role) => {
          const caps = state.roleMap[role] ?? [];
          return (
            <li key={role} className="border border-line bg-surface p-5">
              <p className="text-sm font-medium">{roleLabels[role]}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {ALL.map((cap) => {
                  const on = caps.includes(cap);
                  return (
                    <button
                      key={cap}
                      type="button"
                      className={`rounded-[8px] border px-3 py-2 text-xs ${
                        on
                          ? "border-ink bg-ink text-surface"
                          : "border-line bg-surface text-muted"
                      }`}
                      onClick={() => {
                        const next = on
                          ? caps.filter((c) => c !== cap)
                          : [...caps, cap];
                        setRoleMap(role, next);
                        setMsg(`${roleLabels[role]}: обновлено`);
                      }}
                    >
                      {capLabels[cap]}
                    </button>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>

      <section className="mt-8">
        <h2 className="section-title">Exclusion</h2>
        <ul className="mt-3 divide-y divide-line border border-line bg-surface">
          {state.people
            .filter((p) => p.exclusion || p.role === "employee")
            .slice(0, 15)
            .map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <span>
                  {p.name}
                  {p.exclusion ? " · исключён" : ""}
                </span>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setExclusion(p.id, !p.exclusion);
                      setMsg(
                        p.exclusion
                          ? `${p.name}: возвращён в аудиторию`
                          : `${p.name}: в хламовник`,
                      );
                    }}
                  >
                    {p.exclusion ? "Вернуть" : "Исключить"}
                  </Button>
                  {me.role === "admin" ? (
                    <Button
                      onClick={() => {
                        setRole(p.id, p.role === "vip" ? "employee" : "vip");
                        setMsg(`${p.name}: роль переключена`);
                      }}
                    >
                      Роль VIP/сотрудник
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
