"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, PageHeader, Points, Section, StatusWord } from "@/components/ui";
import { formatDate, formatPoints, orderStatusLabels, roleLabels, sectionLabels } from "@/lib/format";
import { packageTotal, recommendedPackage, totalBalance } from "@/lib/rules";
import { useStore } from "@/lib/store";
import type { SectionId } from "@/lib/types";

export default function HomePage() {
  const { me, state, skipOnboarding, activateFlex } = useStore();
  const router = useRouter();
  const [tourStep, setTourStep] = useState(0);
  const [tourOn, setTourOn] = useState(false);

  useEffect(() => {
    if (!state.settings.tour) {
      setTourOn(false);
      return;
    }
    const dismissed = sessionStorage.getItem("cafeteria-tour-dismissed");
    setTourOn(!dismissed);
  }, [state.settings.tour]);

  if (!me) return null;

  const balance = totalBalance(me);
  const recommended = recommendedPackage(me, state.benefits);
  const packageCost = packageTotal(
    state.packageIds.length ? state.packageIds : recommended.map((b) => b.id),
    state.benefits,
  );
  const myOrders = state.orders.filter((o) => o.personId === me.id).slice(0, 3);
  const awaiting = state.orders.filter(
    (o) => o.personId === me.id && o.status === "awaiting_approval",
  ).length;

  const lead =
    me.role === "vip"
      ? "Доступен только раздел общих предложений."
      : me.role === "decret"
        ? "Страховые программы скрыты. Остальной каталог открыт."
        : me.onboardingDone
          ? "Баланс, окно выбора и быстрый путь к каталогу."
          : "Бюджет сформирован. Льготы ещё не выбраны — соберите пакет.";

  return (
    <div>
      <PageHeader
        title={me.onboardingDone ? "Главная" : "Добро пожаловать"}
        lead={lead}
      />

      {tourOn ? (
        <div className="mb-6 ui-panel p-6">
          <p className="text-base font-medium">
            {tourStep === 0
              ? "Тур: баланс и окно выбора"
              : tourStep === 1
                ? "Тур: каталог и пакет"
                : "Тур: заказы и баллы"}
          </p>
          <p className="mt-2 text-base text-muted">
            {tourStep === 0
              ? "Сверху талон с остатком. Сгораемые списываются первыми, окно выбора видно рядом."
              : tourStep === 1
                ? "Каталог — полки и карточки. Стартовый пакет можно принять или править."
                : "Статусы заказов и история баллов — в «Заказы» и «Баллы»."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {tourStep < 2 ? (
              <Button variant="primary" onClick={() => setTourStep((s) => s + 1)}>
                Далее
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => {
                  sessionStorage.setItem("cafeteria-tour-dismissed", "1");
                  setTourOn(false);
                }}
              >
                Готово
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => {
                sessionStorage.setItem("cafeteria-tour-dismissed", "1");
                setTourOn(false);
              }}
            >
              Пропустить
            </Button>
          </div>
        </div>
      ) : null}

      <div className="ticket overflow-hidden">
        <div className="px-6 py-7 md:px-8 md:py-9">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-base text-muted">Остаток баллов</p>
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <Points value={balance} size="hero" accent />
                <span className="mb-2 text-base text-muted">баллов</span>
              </div>
            </div>
            <p className="rounded-[4px] border border-line px-2.5 py-1 text-sm text-muted">
              {roleLabels[me.role]}
            </p>
          </div>
          <div className="ticket-perforation my-6" />
          <div className="grid gap-5 text-base sm:grid-cols-2">
            <div>
              <p className="text-muted">Сгораемые</p>
              <p className="mt-1.5 font-medium tabular-nums">
                {formatPoints(me.burnable)}
                {me.burnableUntil
                  ? ` · до ${formatDate(me.burnableUntil)}`
                  : ""}
              </p>
            </div>
            <div>
              <p className="text-muted">Несгораемые</p>
              <p className="mt-1.5 font-medium tabular-nums">
                {formatPoints(me.durable)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div className="ui-panel p-6">
          <p className="text-base font-medium">{state.window.title}</p>
          <p className="mt-2 text-base text-muted">
            {formatDate(state.window.start)} — {formatDate(state.window.end)}
          </p>
          <p
            className={`mt-4 text-base ${state.window.open ? "text-pine" : "text-danger"}`}
          >
            {state.window.open ? "Открыто" : "Закрыто"}
          </p>
        </div>
        <div className="ui-panel p-6">
          <p className="text-base font-medium">Профиль</p>
          <p className="mt-2 text-base text-muted">
            {me.department}
            {me.grade ? ` · грейд ${me.grade}` : ""}
            {me.years ? ` · стаж ${me.years} г.` : ""}
          </p>
          {me.flexibleSchedule ? (
            <p className="mt-4 text-base text-pine">Гибкий график активен</p>
          ) : me.role !== "vip" ? (
            <div className="mt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  activateFlex();
                }}
              >
                Активировать гибкий график
              </Button>
            </div>
          ) : null}
          {awaiting ? (
            <p className="mt-4 text-base text-ink">
              На согласовании: {awaiting}
            </p>
          ) : null}
        </div>
      </div>

      {state.settings.balanceWheel ? (
        <div className="mt-6 ui-panel p-6">
          <p className="text-base font-medium">Колесо баланса</p>
          <ul className="mt-4 space-y-3">
            {(Object.keys(sectionLabels) as SectionId[]).map((section) => {
              const spent = state.orders
                .filter(
                  (o) =>
                    o.personId === me.id &&
                    o.status !== "cancelled" &&
                    o.status !== "rejected" &&
                    state.benefits.find((b) => b.id === o.benefitId)?.section ===
                      section,
                )
                .reduce((s, o) => s + o.price, 0);
              return (
                <li key={section}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{sectionLabels[section]}</span>
                    <span className="text-muted">{formatPoints(spent)}</span>
                  </div>
                  <div className="h-2 bg-paper">
                    <div
                      className="h-2 bg-ink"
                      style={{
                        width: `${Math.min(100, spent ? Math.round((spent / Math.max(balance, 1)) * 100) : 0)}%`,
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {!me.onboardingDone && me.role === "employee" ? (
        <div className="mt-6 ui-panel p-6">
          {!me.needsQuizDone ? (
            <>
              <p className="text-base font-medium">Сначала опросник потребностей</p>
              <p className="mt-2 text-base text-muted">
                Ответы подскажут стартовый набор льгот.
              </p>
              <Link href="/app/onboarding-quiz" className="mt-5 inline-block">
                <Button variant="primary">Пройти опросник</Button>
              </Link>
            </>
          ) : (
            <>
          <p className="text-base font-medium">Рекомендованный пакет</p>
          <p className="mt-2 text-base text-muted">
            По грейду {me.grade}
            {me.needsAnswers?.focus ? ` · фокус: ${me.needsAnswers.focus}` : ""}.
            Можно принять или отредактировать.
          </p>
          <ul className="mt-5 space-y-1 text-base">
            {recommended.map((b) => (
              <li
                key={b.id}
                className="flex justify-between gap-3 border-b border-line py-3"
              >
                <span>{b.title}</span>
                <Points value={b.price} size="sm" />
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-base text-muted">
              Набор ≈ <Points value={packageCost} size="sm" /> баллов
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/app/package">
                <Button variant="primary">Собрать пакет</Button>
              </Link>
              <Button
                onClick={() => {
                  skipOnboarding();
                  router.push("/app/catalog");
                }}
              >
                Позже, в каталог
              </Button>
            </div>
          </div>
            </>
          )}
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/app/catalog">
            <Button variant="primary">
              {me.role === "vip" ? "Общие предложения" : "Открыть каталог"}
            </Button>
          </Link>
          <Link href="/app/orders">
            <Button>Мои заказы</Button>
          </Link>
          {me.role === "manager" ? (
            <Link href="/console/approvals">
              <Button>Согласования</Button>
            </Link>
          ) : null}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-4 md:hidden">
        {me.role !== "vip" && me.role !== "decret" ? (
          <Link href="/app/health" className="text-base text-muted hover:text-ink">
            Здоровье
          </Link>
        ) : null}
        <Link href="/app/support" className="text-base text-muted hover:text-ink">
          Поддержка
        </Link>
        {me.role === "employee" ? (
          <Link href="/app/package" className="text-base text-muted hover:text-ink">
            Пакет
          </Link>
        ) : null}
      </div>

      {me.frozen ? (
        <p className="mt-6 text-base text-danger">
          Баллы заморожены HR — оформление заказов недоступно.
        </p>
      ) : null}

      {myOrders.length > 0 ? (
        <Section
          title="Недавние заказы"
          actions={
            <Link href="/app/orders" className="text-base text-muted hover:text-ink">
              Все
            </Link>
          }
        >
          <ul className="ui-panel divide-y divide-line">
            {myOrders.map((o) => (
              <li key={o.id}>
                <Link
                  href="/app/orders"
                  className="flex items-center justify-between gap-3 px-5 py-4 text-base hover:bg-paper"
                >
                  <span className="min-w-0 truncate">{o.title}</span>
                  <StatusWord
                    tone={
                      o.status === "done"
                        ? "pine"
                        : o.status === "rejected" || o.status === "cancelled"
                          ? "danger"
                          : "ink"
                    }
                  >
                    {orderStatusLabels[o.status]}
                  </StatusWord>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section
        title="Новости"
        actions={
          <Link href="/app/news" className="text-base text-muted hover:text-ink">
            Все
          </Link>
        }
      >
        <ul className="space-y-4">
          {state.news
            .filter((n) => n.published)
            .map((n) => (
            <li key={n.id}>
              <Link href={`/app/news#${n.id}`} className="ui-panel block p-5 hover:border-ink">
                <p className="text-base font-medium">{n.title}</p>
                <p className="text-pretty mt-2 text-base text-muted">{n.body}</p>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {state.banners.some((b) => b.active) ? (
        <Section title="Промо">
          <ul className="space-y-4">
            {state.banners
              .filter((b) => b.active)
              .map((b) => (
                <li key={b.id}>
                  <Link
                    href={b.href}
                    className="ui-panel block p-5 hover:border-ink"
                  >
                    <p className="text-base font-medium">{b.title}</p>
                    <p className="mt-2 text-base text-muted">{b.body}</p>
                  </Link>
                </li>
              ))}
          </ul>
        </Section>
      ) : null}
    </div>
  );
}
