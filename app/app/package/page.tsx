"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Notice } from "@/components/notice";
import { Button, PageHeader, Panel, Points } from "@/components/ui";
import {
  packageTotal,
  recommendedPackage,
  totalBalance,
  visibleBenefits,
} from "@/lib/rules";
import { useStore } from "@/lib/store";

export default function PackagePage() {
  const { me, state, setPackageIds, confirmPackage, skipOnboarding } = useStore();
  const router = useRouter();
  const [error, setError] = useState("");

  const recommended = useMemo(
    () => (me ? recommendedPackage(me, state.benefits) : []),
    [me, state.benefits],
  );

  const extras = useMemo(() => {
    if (!me) return [];
    const recIds = new Set(recommended.map((b) => b.id));
    return visibleBenefits(me, state.benefits).filter(
      (b) =>
        !recIds.has(b.id) &&
        b.price > 0 &&
        b.type !== "non_financial" &&
        b.id !== "dms-family" &&
        b.id !== "camp" &&
        b.id !== "merch",
    );
  }, [me, state.benefits, recommended]);

  useEffect(() => {
    if (!me) return;
    if (!state.packageIds.length && !me.onboardingDone) {
      setPackageIds(recommended.map((b) => b.id));
    }
  }, [me, recommended, setPackageIds, state.packageIds.length]);

  if (!me) return null;

  const selected = new Set(state.packageIds);
  const total = packageTotal(state.packageIds, state.benefits);
  const balance = totalBalance(me);
  const over = total - balance;

  function toggle(id: string) {
    setError("");
    if (selected.has(id)) {
      setPackageIds(state.packageIds.filter((x) => x !== id));
    } else {
      setPackageIds([...state.packageIds, id]);
    }
  }

  function Row({
    id,
    title,
    hint,
    price,
    on,
  }: {
    id: string;
    title: string;
    hint: string;
    price: number;
    on: boolean;
  }) {
    return (
      <li>
        <button
          type="button"
          onClick={() => toggle(id)}
          className={`menu-row flex w-full items-center justify-between gap-4 px-4 py-3 text-left ${
            on ? "menu-row-active" : ""
          }`}
        >
          <span>
            <span className="block text-sm font-medium">{title}</span>
            <span className={`mt-1 block text-xs ${on ? "opacity-80" : "text-muted"}`}>
              {hint}
            </span>
          </span>
          <span className="flex items-center gap-3">
            <Points value={price} size="sm" />
            <span className={`text-xs ${on ? "opacity-80" : "text-muted"}`}>
              {on ? "В пакете" : "Вне"}
            </span>
          </span>
        </button>
      </li>
    );
  }

  return (
    <div>
      <PageHeader
        title="Конструктор пакета"
        lead="Включайте и отключайте позиции — остаток пересчитывается сразу."
      />

      <Panel className="mb-4 flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="text-sm">
          <p className="text-muted">Стоимость набора</p>
          <Points value={total} size="lg" accent={over > 0} />
        </div>
        <div className="text-sm">
          <p className="text-muted">Останется</p>
          <Points value={Math.max(balance - total, 0)} size="lg" />
        </div>
        {over > 0 ? (
          <div className="w-full">
            <Notice tone="danger">
              Набор больше баланса на {over} баллов. Подтверждение закрыто —
              снимите позицию или уменьшите набор.
            </Notice>
          </div>
        ) : (
          <p className="w-full text-xs text-muted">
            Чтобы увидеть блокировку перерасхода, добавьте дорогую позицию из
            блока «Дополнительно».
          </p>
        )}
      </Panel>

      <h2 className="mb-2 text-sm font-medium">Рекомендовано по грейду</h2>
      <ul className="menu-panel divide-y divide-line overflow-hidden">
        {recommended.map((b) => (
          <Row
            key={b.id}
            id={b.id}
            title={b.title}
            hint={b.section === "health" ? "Здоровье" : b.supplier}
            price={b.price}
            on={selected.has(b.id)}
          />
        ))}
      </ul>

      {extras.length ? (
        <>
          <h2 className="mb-2 mt-6 text-sm font-medium">Дополнительно</h2>
          <ul className="menu-panel divide-y divide-line overflow-hidden">
            {extras.map((b) => (
              <Row
                key={b.id}
                id={b.id}
                title={b.title}
                hint={b.supplier}
                price={b.price}
                on={selected.has(b.id)}
              />
            ))}
          </ul>
        </>
      ) : null}

      {error ? (
        <div className="mt-4">
          <Notice tone="danger">{error}</Notice>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          variant="primary"
          disabled={over > 0 || !state.window.open || me.frozen}
          onClick={() => {
            const res = confirmPackage();
            if (!res.ok) {
              setError(res.reason);
              return;
            }
            window.setTimeout(() => router.push("/app/orders"), 0);
          }}
        >
          Подтвердить пакет
        </Button>
        <Button onClick={() => router.push("/app/catalog")}>В каталог</Button>
        {!me.onboardingDone ? (
          <Button
            variant="ghost"
            onClick={() => {
              skipOnboarding();
              router.push("/app/catalog");
            }}
          >
            Без позиций
          </Button>
        ) : null}
      </div>
      {me.frozen ? (
        <p className="mt-3 text-sm text-danger">Баллы заморожены HR.</p>
      ) : null}
      {!state.window.open ? (
        <p className="mt-3 text-sm text-danger">Окно выбора закрыто.</p>
      ) : null}
    </div>
  );
}
