"use client";

import { useRouter } from "next/navigation";
import { Button, Field, Input, PageHeader } from "@/components/ui";
import { useStore } from "@/lib/store";
import type { PlatformSettings } from "@/lib/types";

const boolLabels: Partial<Record<keyof PlatformSettings, string>> = {
  lottery: "Лотереи",
  transfers: "Переводы баллов",
  charity: "Благотворительность",
  teamPools: "Командные сборы",
  surveys: "Опросы",
  news: "Новости",
  socialProjects: "Соцпроекты",
  startPackage: "Стартовый пакет",
  gamification: "Геймификация",
  tour: "Тур по интерфейсу",
  balanceWheel: "Колесо баланса",
};

const numberFields: {
  key: keyof PlatformSettings;
  label: string;
  hint: string;
  step?: string;
}[] = [
  {
    key: "transferCommission",
    label: "Комиссия перевода",
    hint: "Доля, например 0.25 = 25%",
    step: "0.01",
  },
  {
    key: "transferMin",
    label: "Минимум перевода / взноса",
    hint: "Баллы",
  },
  {
    key: "charityMatch",
    label: "Матчинг благотворительности",
    hint: "Множитель, 1 = удвоение",
    step: "0.1",
  },
  {
    key: "pointRubRate",
    label: "Стоимость балла, ₽",
    hint: "Для выгрузки в бухгалтерию",
  },
  {
    key: "codeStockThreshold",
    label: "Порог остатка кодов",
    hint: "Предупреждение в каталоге",
  },
  {
    key: "anomalyLargeSpend",
    label: "Порог аномалии",
    hint: "Крупная операция, баллы",
  },
  {
    key: "supportSlaHours",
    label: "SLA поддержки, часы",
    hint: "Срок ответа",
  },
  {
    key: "burnDefaultMonths",
    label: "Срок сгорания, мес.",
    hint: "По умолчанию при начислении",
  },
  {
    key: "passwordMinLength",
    label: "Мин. длина пароля",
    hint: "Политика (симуляция, SSO не подключён)",
  },
  {
    key: "maxManualGrant",
    label: "Потолок ручного начисления",
    hint: "Баллы за одну операцию",
  },
];

export default function SettingsPage() {
  const { me, state, toggleSetting, setSettingNumber, resetDemo, logout } =
    useStore();
  const router = useRouter();
  if (!me || me.role !== "admin") return null;

  return (
    <div>
      <PageHeader
        title="Настройки платформы"
        lead="Тумблеры разделов и числовые параметры без доработки кода."
      />
      <ul className="menu-panel divide-y divide-line overflow-hidden">
        {(Object.keys(boolLabels) as (keyof PlatformSettings)[]).map((key) => {
          const on = Boolean(state.settings[key]);
          return (
            <li key={key}>
              <button
                type="button"
                className={`menu-row flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-sm ${
                  on ? "menu-row-active" : ""
                }`}
                onClick={() => toggleSetting(key)}
              >
                <span className="block font-medium">{boolLabels[key]}</span>
                <span className={`text-xs ${on ? "opacity-80" : "text-muted"}`}>
                  {on ? "вкл" : "выкл"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <section className="mt-8 border border-line bg-surface p-5">
        <p className="text-sm font-medium">Числовые параметры</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {numberFields.map((f) => (
            <Field key={f.key} label={f.label}>
              <Input
                type="number"
                step={f.step ?? "1"}
                value={String(state.settings[f.key] ?? 0)}
                onChange={(e) =>
                  setSettingNumber(f.key, Number(e.target.value))
                }
              />
              <span className="mt-1 text-xs text-muted">{f.hint}</span>
            </Field>
          ))}
        </div>
      </section>

      <div className="mt-8 border border-line bg-surface p-5">
        <p className="text-sm font-medium">Демо-данные</p>
        <p className="mt-1 text-sm text-muted">
          Вернуть сид ГК «Альтаир» (v4) и выйти на экран входа.
        </p>
        <Button
          variant="danger"
          className="mt-4"
          onClick={() => {
            if (!window.confirm("Сбросить демо к исходным данным?")) return;
            resetDemo();
            logout();
            router.replace("/");
          }}
        >
          Сбросить демо
        </Button>
      </div>
    </div>
  );
}
