"use client";

import Link from "next/link";
import { PageHeader, Points } from "@/components/ui";
import { roleLabels } from "@/lib/format";
import { totalBalance } from "@/lib/rules";
import { useStore } from "@/lib/store";

export default function PeoplePage() {
  const { state, me } = useStore();
  if (!me || (me.role !== "hr" && me.role !== "admin")) return null;

  return (
    <div>
      <PageHeader title="Сотрудники" lead="Баланс, статус и переход в карточку." />
      <div className="menu-panel overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">ФИО</th>
              <th className="px-4 py-3 font-medium">Отдел</th>
              <th className="px-4 py-3 font-medium">Роль</th>
              <th className="px-4 py-3 font-medium">Статус</th>
              <th className="px-4 py-3 font-medium">Баланс</th>
            </tr>
          </thead>
          <tbody>
            {state.people.map((p) => {
              const marks = [
                p.frozen ? "заморожен" : null,
                !p.onboardingDone ? "онбординг" : null,
                p.flexibleSchedule ? "гибкий график" : null,
              ].filter(Boolean);
              return (
                <tr key={p.id} className="border-b border-line last:border-0 hover:bg-paper">
                  <td className="px-4 py-3">
                    <Link
                      href={`/console/people/${p.id}`}
                      className="font-medium hover:text-stamp"
                    >
                      {p.name}
                    </Link>
                    <p className="text-xs text-muted">{p.title}</p>
                  </td>
                  <td className="px-4 py-3">{p.department}</td>
                  <td className="px-4 py-3 text-muted">{roleLabels[p.role]}</td>
                  <td className="px-4 py-3 text-muted">
                    {marks.length ? marks.join(" · ") : "в работе"}
                  </td>
                  <td className="px-4 py-3">
                    <Points value={totalBalance(p)} size="sm" />
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
