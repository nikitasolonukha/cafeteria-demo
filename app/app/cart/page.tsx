"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Empty, PageHeader, Panel, Points } from "@/components/ui";
import { totalBalance } from "@/lib/rules";
import { useStore } from "@/lib/store";

export default function CartPage() {
  const { me, state, removeFromCart, checkoutCart, clearCart } = useStore();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  if (!me) return null;

  const rows = state.cart
    .map((c) => ({
      ...c,
      benefit: state.benefits.find((b) => b.id === c.benefitId),
    }))
    .filter((r) => r.benefit);

  const total = rows.reduce((s, r) => s + (r.benefit?.price ?? 0), 0);
  const balance = totalBalance(me);
  const blocked = !state.window.open || me.frozen || total > balance;

  return (
    <div>
      <PageHeader
        title="Корзина"
        lead="Подтверждение списывает баллы и создаёт заказы."
        actions={
          rows.length ? (
            <Button variant="ghost" onClick={clearCart}>
              Очистить
            </Button>
          ) : null
        }
      />

      {rows.length === 0 ? (
        <Empty>
          Корзина пуста.{" "}
          <Link href="/app/catalog" className="text-stamp">
            Открыть каталог
          </Link>
        </Empty>
      ) : (
        <>
          <ul className="space-y-2">
            {rows.map((row) => (
              <li key={row.benefitId}>
                <Panel className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{row.benefit!.title}</p>
                    <p className="mt-1 text-xs text-muted">{row.benefit!.supplier}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Points value={row.benefit!.price} size="sm" />
                    <Button
                      variant="ghost"
                      onClick={() => removeFromCart(row.benefitId)}
                    >
                      Убрать
                    </Button>
                  </div>
                </Panel>
              </li>
            ))}
          </ul>

          <Panel className="mt-4 flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="text-sm">
              <p className="text-muted">Итого / баланс</p>
              <p className="mt-1">
                <Points value={total} size="md" />{" "}
                <span className="text-muted">из</span>{" "}
                <Points value={balance} size="md" />
              </p>
            </div>
            <Button
              variant="primary"
              disabled={blocked}
              onClick={() => {
                setError("");
                setMessage("");
                const res = checkoutCart();
                if (!res.ok) {
                  setError(res.reason);
                  return;
                }
                setMessage(`Оформлено заказов: ${res.orders.length}`);
              }}
            >
              Подтвердить
            </Button>
          </Panel>
          <div aria-live="polite" className="mt-3 space-y-1 text-sm">
            {!state.window.open ? (
              <p className="text-danger">Окно выбора закрыто — оформление недоступно.</p>
            ) : null}
            {me.frozen ? (
              <p className="text-danger">Баллы заморожены HR.</p>
            ) : null}
            {total > balance ? (
              <p className="text-danger">Не хватает {total - balance} баллов.</p>
            ) : null}
            {error ? <p className="text-danger">{error}</p> : null}
            {message ? <p className="text-pine">{message}</p> : null}
          </div>
        </>
      )}
    </div>
  );
}
