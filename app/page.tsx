"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MenuList, MenuListButton } from "@/components/menu-select";
import { Button } from "@/components/ui";
import { homePathFor } from "@/lib/rules";
import { loginAccounts } from "@/lib/seed";
import { useStore } from "@/lib/store";

export default function LoginPage() {
  const { state, me, login, resetDemo, ready, createGuestTicket } = useStore();
  const router = useRouter();
  const [guestId, setGuestId] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !me) return;
    router.replace(homePathFor(me.role));
  }, [ready, me, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">
        Загрузка…
      </div>
    );
  }

  if (me) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">
        Вход…
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 md:px-8">
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-base text-muted">ГК «Альтаир»</p>
          <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Кафетерий льгот
          </h1>
          <div className="menu-panel mt-8 p-5 text-base leading-relaxed">
            <p className="font-medium text-ink">С чего кликать</p>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-muted">
              <li>Войдите как Мария и соберите рекомендованный пакет.</li>
              <li>Возьмите сертификат отеля — код появится сразу.</li>
              <li>
                Оформите доп. день отпуска, затем зайдите Дмитрием и согласуйте.
              </li>
            </ol>
          </div>
          <Button variant="ghost" className="mt-4" onClick={resetDemo}>
            Сбросить демо к исходным данным
          </Button>
          <div className="mt-8 ui-panel p-5 text-base">
            <p className="font-medium">Рассинхронизация с кадровым контуром</p>
            <p className="mt-1 text-muted">
              Если сотрудника нет в базе — вход недоступен. Кнопка ниже ставит
              обращение в очередь HR без логина.
            </p>
            {guestId ? (
              <p className="mt-3 text-pine">
                Обращение {guestId} в очереди. Войдите как Анна Лебедева, чтобы
                ответить.
              </p>
            ) : (
              <Button
                className="mt-3"
                onClick={() => {
                  const res = createGuestTicket(
                    "Не нахожу себя в системе",
                    "Принят в штат, в кафетерии аккаунта нет. Прошу завести доступ и начислить стартовый бюджет.",
                  );
                  setGuestId(res.id);
                }}
              >
                Я не в базе — написать HR
              </Button>
            )}
          </div>
        </div>

        <div>
          <p className="mb-3 text-base font-medium">Вход одной кнопкой</p>
          <MenuList>
            {loginAccounts.map((account) => {
              const person = state.people.find((p) => p.id === account.id)!;
              return (
                <li key={account.id}>
                  <MenuListButton
                    onClick={() => {
                      const path = login(account.id);
                      window.setTimeout(() => router.push(path), 0);
                    }}
                  >
                    <span className="min-w-0">
                      <span className="block font-medium">{person.name}</span>
                      <span className="mt-1 block text-sm text-muted">
                        {account.blurb}
                      </span>
                    </span>
                    <span className="mt-0.5 shrink-0 text-sm text-stamp">
                      Открыть
                    </span>
                  </MenuListButton>
                </li>
              );
            })}
          </MenuList>
        </div>
      </div>
    </div>
  );
}
