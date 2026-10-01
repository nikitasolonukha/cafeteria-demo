"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, type ReactNode, type SVGProps } from "react";
import {
  IconAudit,
  IconChart,
  IconCheck,
  IconGrid,
  IconSettings,
  IconSupport,
  IconUsers,
  IconWindow,
} from "./icons";
import { RoleSwitcher } from "./role-switcher";
import { useStore } from "@/lib/store";

function IconOrdersLike(p: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
      {...p}
    >
      <path d="M8 6h12M8 12h12M8 18h12" />
      <path d="M4 6h.01M4 12h.01M4 18h.01" />
    </svg>
  );
}

function IconHeartLike(p: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
      {...p}
    >
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
    </svg>
  );
}

const links = [
  { href: "/console", label: "Дашборд", icon: IconChart, roles: ["hr", "admin"] },
  {
    href: "/console/approvals",
    label: "Согласования",
    icon: IconCheck,
    roles: ["hr", "admin", "manager"],
  },
  { href: "/console/people", label: "Сотрудники", icon: IconUsers, roles: ["hr", "admin"] },
  { href: "/console/import", label: "Импорт", icon: IconUsers, roles: ["hr", "admin"] },
  { href: "/console/budgets", label: "Бюджеты", icon: IconChart, roles: ["hr", "admin"] },
  { href: "/console/segments", label: "Сегменты", icon: IconUsers, roles: ["hr", "admin"] },
  { href: "/console/catalog", label: "Каталог", icon: IconGrid, roles: ["hr", "admin"] },
  { href: "/console/categories", label: "Полки", icon: IconGrid, roles: ["hr", "admin"] },
  { href: "/console/window", label: "Окно выбора", icon: IconWindow, roles: ["hr", "admin"] },
  { href: "/console/orders", label: "Заказы", icon: IconCheck, roles: ["hr", "admin"] },
  { href: "/console/events", label: "События", icon: IconChart, roles: ["hr", "admin"] },
  { href: "/console/tickets", label: "Обращения", icon: IconSupport, roles: ["hr", "admin"] },
  { href: "/console/news", label: "Новости", icon: IconOrdersLike, roles: ["hr", "admin"] },
  { href: "/console/promos", label: "Промо", icon: IconGrid, roles: ["hr", "admin"] },
  { href: "/console/surveys", label: "Опросы", icon: IconOrdersLike, roles: ["hr", "admin"] },
  { href: "/console/lottery", label: "Лотерея", icon: IconGrid, roles: ["hr", "admin"] },
  { href: "/console/funds", label: "Фонды", icon: IconHeartLike, roles: ["hr", "admin"] },
  { href: "/console/anomalies", label: "Аномалии", icon: IconAudit, roles: ["hr", "admin"] },
  { href: "/console/export", label: "Бухгалтерия", icon: IconChart, roles: ["hr", "admin"] },
  { href: "/console/roles", label: "Роли", icon: IconUsers, roles: ["admin"] },
  { href: "/console/integrations", label: "Интеграции", icon: IconSettings, roles: ["admin"] },
  { href: "/console/audit", label: "Аудит", icon: IconAudit, roles: ["hr", "admin"] },
  {
    href: "/console/settings",
    label: "Настройки",
    icon: IconSettings,
    roles: ["admin"],
  },
];

export function ConsoleShell({ children }: { children: ReactNode }) {
  const { me, state, ready } = useStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!me) {
      router.replace("/");
      return;
    }
    if (me.role !== "hr" && me.role !== "admin" && me.role !== "manager") {
      router.replace("/app");
    }
  }, [ready, me, router]);

  const pendingApprovals = useMemo(
    () =>
      state.orders.filter((o) => {
        if (o.status !== "awaiting_approval") return false;
        if (!me) return false;
        if (me.role === "hr" || me.role === "admin") return true;
        return o.approverId === me.id;
      }).length,
    [state.orders, me],
  );

  const openTickets = useMemo(
    () => state.tickets.filter((t) => t.status === "open").length,
    [state.tickets],
  );

  const openAnomalies = useMemo(
    () => state.anomalies.filter((a) => a.status === "open").length,
    [state.anomalies],
  );

  if (
    !ready ||
    !me ||
    (me.role !== "hr" && me.role !== "admin" && me.role !== "manager")
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">
        Загрузка демо…
      </div>
    );
  }

  const visible = links.filter((l) => l.roles.includes(me.role));

  return (
    <div className="min-h-screen md:flex">
      <a href="#main" className="skip-link">
        К содержимому
      </a>
      <aside className="w-full shrink-0 border-b border-line bg-surface md:sticky md:top-0 md:flex md:h-screen md:w-[232px] md:flex-col md:border-b-0 md:border-r">
        <div className="px-4 py-6">
          <p className="text-sm text-muted">Пульт</p>
          <p className="mt-1 text-base font-semibold">Кафетерий льгот</p>
          <p className="mt-4 text-base">{me.name}</p>
          <p className="text-sm text-muted">{me.title}</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-1 md:flex-col md:overflow-y-auto md:px-3">
          {visible.map((item) => {
            const active =
              item.href === "/console"
                ? pathname === "/console"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            const badge =
              item.href === "/console/approvals" && pendingApprovals
                ? pendingApprovals
                : item.href === "/console/tickets" && openTickets
                  ? openTickets
                  : item.href === "/console/anomalies" && openAnomalies
                    ? openAnomalies
                    : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-2 rounded-[8px] px-3 py-2.5 text-base ${
                  active
                    ? "bg-paper text-ink"
                    : "text-muted hover:bg-paper hover:text-ink"
                }`}
              >
                <Icon />
                <span className="flex-1">{item.label}</span>
                {badge ? (
                  <span className="min-w-5 rounded-[4px] bg-paper px-1.5 text-center text-xs tabular-nums">
                    {badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div className="hidden border-t border-line p-3 md:block">
          <RoleSwitcher />
        </div>
        <div className="border-t border-line px-3 py-3 md:hidden">
          <RoleSwitcher compact />
        </div>
      </aside>
      <main id="main" className="min-w-0 flex-1 px-4 py-8 md:px-8">
        {children}
      </main>
    </div>
  );
}
