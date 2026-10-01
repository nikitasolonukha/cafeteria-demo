"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode, type SVGProps } from "react";
import {
  IconCart,
  IconGrid,
  IconHeart,
  IconHome,
  IconOrders,
  IconPackage,
  IconSupport,
  IconWallet,
} from "./icons";
import { RoleSwitcher } from "./role-switcher";
import { Points } from "./ui";
import { formatPoints } from "@/lib/format";
import { totalBalance } from "@/lib/rules";
import { useStore } from "@/lib/store";
import type { PlatformSettings } from "@/lib/types";

function IconUsers(p: SVGProps<SVGSVGElement>) {
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
      <circle cx="9" cy="8" r="3" />
      <path d="M3 19c0-3 3-5 6-5s6 2 6 5" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M14.5 19c.3-2 1.8-3.5 4-3.5 1.2 0 2.2.4 3 1" />
    </svg>
  );
}

const nav = [
  { href: "/app", label: "Главная", icon: IconHome },
  { href: "/app/catalog", label: "Каталог", icon: IconGrid },
  { href: "/app/cart", label: "Корзина", icon: IconCart },
  { href: "/app/orders", label: "Заказы", icon: IconOrders },
  { href: "/app/wallet", label: "Баллы", icon: IconWallet },
];

const more: {
  href: string;
  label: string;
  icon: typeof IconHome;
  roles: readonly string[];
  setting?: keyof PlatformSettings;
}[] = [
  {
    href: "/app/package",
    label: "Пакет",
    icon: IconPackage,
    roles: ["employee"],
    setting: "startPackage",
  },
  {
    href: "/app/onboarding-quiz",
    label: "Опросник",
    icon: IconPackage,
    roles: ["employee"],
    setting: "startPackage",
  },
  {
    href: "/app/health",
    label: "Здоровье",
    icon: IconHeart,
    roles: ["employee", "manager"],
  },
  {
    href: "/app/news",
    label: "Новости",
    icon: IconOrders,
    roles: ["employee", "decret", "vip", "manager"],
    setting: "news",
  },
  {
    href: "/app/promos",
    label: "Акции",
    icon: IconGrid,
    roles: ["employee", "decret", "manager"],
  },
  {
    href: "/app/transfers",
    label: "Переводы",
    icon: IconWallet,
    roles: ["employee", "decret", "manager"],
    setting: "transfers",
  },
  {
    href: "/app/charity",
    label: "Благотвор.",
    icon: IconHeart,
    roles: ["employee", "decret", "manager"],
    setting: "charity",
  },
  {
    href: "/app/pools",
    label: "Сборы",
    icon: IconUsers,
    roles: ["employee", "decret", "manager"],
    setting: "teamPools",
  },
  {
    href: "/app/lottery",
    label: "Лотерея",
    icon: IconGrid,
    roles: ["employee", "decret", "manager"],
    setting: "lottery",
  },
  {
    href: "/app/surveys",
    label: "Опросы",
    icon: IconOrders,
    roles: ["employee", "decret", "vip", "manager"],
    setting: "surveys",
  },
  {
    href: "/app/social",
    label: "Соцпроекты",
    icon: IconUsers,
    roles: ["employee", "decret", "manager"],
    setting: "socialProjects",
  },
  {
    href: "/app/achievements",
    label: "Достижения",
    icon: IconPackage,
    roles: ["employee", "decret", "vip", "manager"],
    setting: "gamification",
  },
  {
    href: "/app/notifications",
    label: "Уведомл.",
    icon: IconSupport,
    roles: ["employee", "decret", "vip", "manager"],
  },
  {
    href: "/app/suggest",
    label: "Идея льготы",
    icon: IconPackage,
    roles: ["employee", "decret", "manager"],
  },
  {
    href: "/app/support",
    label: "Поддержка",
    icon: IconSupport,
    roles: ["employee", "decret", "vip", "manager"],
  },
];

function NavLink({
  href,
  label,
  icon: Icon,
  mobile,
  badge,
}: {
  href: string;
  label: string;
  icon: typeof IconHome;
  mobile?: boolean;
  badge?: number;
}) {
  const pathname = usePathname();
  const active =
    href === "/app" ? pathname === "/app" : pathname.startsWith(href);
  if (mobile) {
    return (
      <Link
        href={href}
        className={`relative flex flex-1 flex-col items-center gap-1 py-2.5 text-xs ${
          active ? "text-stamp" : "text-muted"
        }`}
      >
        <Icon />
        {badge ? (
          <span className="absolute right-[calc(50%-18px)] top-1 min-w-4 rounded-[4px] bg-stamp px-1 text-center text-[11px] leading-4 text-stamp-ink">
            {badge}
          </span>
        ) : null}
        <span>{label}</span>
      </Link>
    );
  }
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-base ${
        active ? "bg-paper text-ink" : "text-muted hover:bg-paper hover:text-ink"
      }`}
    >
      <Icon />
      <span className="flex-1">{label}</span>
      {badge ? (
        <span className="min-w-5 rounded-[4px] bg-paper px-1.5 text-center text-xs tabular-nums text-ink">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

export function StorefrontShell({ children }: { children: ReactNode }) {
  const { me, state, ready } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!me) {
      router.replace("/");
      return;
    }
    if (me.role === "hr" || me.role === "admin") {
      router.replace("/console");
    }
  }, [ready, me, router]);

  if (!ready || !me || me.role === "hr" || me.role === "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">
        Загрузка демо…
      </div>
    );
  }

  const balance = totalBalance(me);
  const cartCount = state.cart.length;
  const unread = state.notifications.filter(
    (n) => n.personId === me.id && !n.read,
  ).length;
  const moreLinks = more.filter((item) => {
    if (!(item.roles as readonly string[]).includes(me.role)) return false;
    if (item.setting) {
      const flag = state.settings[item.setting];
      if (typeof flag === "boolean" && !flag) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen md:flex">
      <a href="#main" className="skip-link">
        К содержимому
      </a>
      <aside className="sticky top-0 hidden h-screen w-[232px] shrink-0 border-r border-line bg-surface md:flex md:flex-col">
        <div className="border-b border-line px-4 py-6">
          <p className="text-sm text-muted">ГК «Альтаир»</p>
          <p className="mt-1 text-base font-semibold">Кафетерий льгот</p>
          <div className="mt-5">
            <p className="text-sm text-muted">Остаток</p>
            <Points value={balance} size="lg" accent />
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {nav.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              badge={item.href === "/app/cart" ? cartCount || undefined : undefined}
            />
          ))}
          <div className="my-2 border-t border-line" />
          {moreLinks.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              badge={
                item.href === "/app/notifications" ? unread || undefined : undefined
              }
            />
          ))}
        </nav>
        <div className="space-y-3 border-t border-line p-3">
          <div className="px-3">
            <p className="text-base font-medium">{me.name}</p>
            <p className="text-sm text-muted">{me.title}</p>
          </div>
          <RoleSwitcher />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
        <header className="relative z-30 flex items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3 md:hidden">
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold">Кафетерий</p>
            <p className="truncate text-sm text-muted">
              {formatPoints(balance)} баллов · {me.name.split(" ")[0]}
            </p>
          </div>
          <div className="w-[7.5rem] shrink-0">
            <RoleSwitcher compact />
          </div>
        </header>
        {!state.window.open ? (
          <div className="border-b border-line bg-surface px-4 py-3 text-base text-danger">
            Окно выбора закрыто. Каталог доступен, оформление новых заказов —
            нет.
          </div>
        ) : null}
        {me.exclusion ? (
          <div className="border-b border-line bg-surface px-4 py-3 text-base text-danger">
            Вы в группе исключения («хламовник»). Оформление льгот недоступно —
            обратитесь в HR.
          </div>
        ) : null}
        {me.burnable > 0 && me.burnableUntil ? (
          <div className="border-b border-line bg-surface px-4 py-3 text-base text-muted">
            Сгораемые {formatPoints(me.burnable)} баллов действуют до{" "}
            {me.burnableUntil}
            {(me.burnNoticesSent ?? 0) > 0
              ? ` · напоминаний: ${me.burnNoticesSent}/2`
              : ""}
            .{" "}
            <Link href="/app/wallet" className="text-stamp">
              Подробнее
            </Link>
          </div>
        ) : null}
        <main
          id="main"
          className="w-full flex-1 px-4 py-8 md:max-w-none md:px-8 lg:px-10"
        >
          <div className="w-full max-w-5xl">{children}</div>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
        {nav.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            mobile
            badge={item.href === "/app/cart" ? cartCount || undefined : undefined}
          />
        ))}
      </nav>
    </div>
  );
}
