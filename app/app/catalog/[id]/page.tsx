"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Notice } from "@/components/notice";
import { AttachmentButtons } from "@/components/document-preview";
import { Button, Field, FilePickButton, Input, PageHeader, Panel, Points, Select } from "@/components/ui";
import { ageFromBirth, sectionLabels } from "@/lib/format";
import { canSeeSection, totalBalance } from "@/lib/rules";
import { useStore } from "@/lib/store";

export default function BenefitPage() {
  const params = useParams<{ id: string }>();
  const { me, state, addToCart, buyNow } = useStore();
  const router = useRouter();
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [familyName, setFamilyName] = useState("Соколова Анна");
  const [birthDate, setBirthDate] = useState("1990-04-12");
  const [relation, setRelation] = useState("супруг");
  const [familyGender, setFamilyGender] = useState("ж");
  const [days, setDays] = useState("1");
  const [leaveDate, setLeaveDate] = useState("2026-11-12");
  const [unusedVacation, setUnusedVacation] = useState(false);
  const [childName, setChildName] = useState("Соколова Вера");
  const [shiftDates, setShiftDates] = useState("1–14 июля 2027");
  const [size, setSize] = useState("M");
  const [slot, setSlot] = useState("2026-10-15 11:00");
  const [checkIn, setCheckIn] = useState("2026-10-20");
  const [guests, setGuests] = useState("2");
  const [docName, setDocName] = useState("schet-sertifikaciya.pdf");
  const [promoCode, setPromoCode] = useState("ALTAIR10");
  const [langGroup, setLangGroup] = useState("Вт/Чт 18:00");

  const benefit = me
    ? state.benefits.find((b) => b.id === params.id)
    : undefined;

  const familyAge = useMemo(() => {
    if (!birthDate) return null;
    return ageFromBirth(birthDate);
  }, [birthDate]);

  const ageBlocked =
    benefit?.id === "dms-family" && familyAge !== null && familyAge > 65;

  if (!me) return null;

  if (!benefit || benefit.archived || !canSeeSection(me, benefit.section)) {
    return (
      <div>
        <PageHeader title="Позиция недоступна" />
        <Link href="/app/catalog" className="text-sm text-stamp">
          К каталогу
        </Link>
      </div>
    );
  }

  const codesLeft =
    benefit.type === "certificate"
      ? (benefit.codes?.length ?? 0) - (benefit.usedCodes?.length ?? 0)
      : null;

  function meta(): Record<string, string> | undefined {
    if (benefit!.id === "dms-family") {
      return { familyName, birthDate, relation, gender: familyGender };
    }
    if (benefit!.type === "leave") {
      return {
        days,
        date: leaveDate,
        unusedVacation: unusedVacation ? "1" : "0",
      };
    }
    if (benefit!.id === "camp") {
      return { childName, shiftDates };
    }
    if (benefit!.type === "family" && benefit!.id !== "dms-family") {
      return { childName };
    }
    if (benefit!.id === "merch") {
      return { size };
    }
    if (benefit!.id === "psych") {
      return { slot };
    }
    if (benefit!.id === "lang") {
      return { group: langGroup };
    }
    if (benefit!.id === "resort") {
      return { checkIn, guests };
    }
    if (benefit!.type === "docs") {
      return { docName };
    }
    if (benefit!.type === "certificate" && promoCode.trim()) {
      return { promoCode: promoCode.trim() };
    }
    return undefined;
  }

  function formError(): string | null {
    if (benefit!.id === "dms-family") {
      if (!familyName.trim() || !birthDate) return "Заполните данные члена семьи";
      if (ageBlocked) {
        return "Возраст выше 65 лет. Доступна альтернатива: программа «Серебряный полис» вне кафетерия — обратитесь в HR.";
      }
    }
    if (benefit!.type === "leave" && unusedVacation) {
      return "Недоступно при неотгулянном основном отпуске свыше 14 дней.";
    }
    if (benefit!.id === "camp" && (!childName.trim() || !shiftDates.trim())) {
      return "Укажите ФИО ребёнка и даты смены";
    }
    if (
      benefit!.type === "family" &&
      benefit!.id !== "dms-family" &&
      !childName.trim()
    ) {
      return "Укажите ФИО ребёнка";
    }
    if (benefit!.id === "psych" && !slot.trim()) return "Выберите слот";
    if (benefit!.id === "lang" && !langGroup.trim()) return "Выберите группу";
    if (benefit!.id === "resort") {
      if (!checkIn) return "Укажите дату заезда";
      const days =
        (new Date(checkIn).getTime() - new Date("2026-10-01").getTime()) /
        86400000;
      if (days < 14) return "Минимум 14 дней до заезда";
    }
    if (benefit!.type === "docs" && !docName.trim()) {
      return "Прикрепите подтверждающий документ (имя файла)";
    }
    return null;
  }

  return (
    <div>
      <PageHeader
        title={benefit.title}
        lead={sectionLabels[benefit.section]}
        actions={<Points value={benefit.price} size="lg" />}
      />

      <Panel className="p-6">
        <p className="text-base leading-relaxed text-ink">{benefit.description}</p>
        <dl className="mt-6 grid gap-4 text-base sm:grid-cols-2">
          <div>
            <dt className="text-muted">Поставщик</dt>
            <dd className="mt-1">{benefit.supplier}</dd>
          </div>
          <div>
            <dt className="text-muted">Условия</dt>
            <dd className="mt-1">{benefit.conditions}</dd>
          </div>
          {codesLeft !== null ? (
            <div>
              <dt className="text-muted">Кодов в партии</dt>
              <dd className="mt-1">{codesLeft}</dd>
            </div>
          ) : null}
          {benefit.seatsLeft !== undefined ? (
            <div>
              <dt className="text-muted">Мест</dt>
              <dd className="mt-1">{benefit.seatsLeft}</dd>
            </div>
          ) : null}
          {benefit.maxSum ? (
            <div>
              <dt className="text-muted">Предел суммы</dt>
              <dd className="mt-1">
                <Points value={benefit.maxSum} size="sm" />
              </dd>
            </div>
          ) : null}
          {benefit.codeExpiresAt ? (
            <div>
              <dt className="text-muted">Коды действуют до</dt>
              <dd className="mt-1">{benefit.codeExpiresAt}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-muted">Ваш баланс</dt>
            <dd className="mt-1">
              <Points value={totalBalance(me)} size="sm" />
            </dd>
          </div>
        </dl>
        {benefit.attachments?.length ? (
          <div className="mt-5 border-t border-line pt-4">
            <p className="text-sm font-medium">Вложения</p>
            <AttachmentButtons items={benefit.attachments} />
          </div>
        ) : null}
      </Panel>

      {benefit.id === "dms-family" ? (
        <Panel className="mt-4 grid gap-3 p-5 sm:grid-cols-3">
          <Field label="ФИО">
            <Input
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              name="family-name"
              autoComplete="name"
            />
          </Field>
          <Field label="Дата рождения">
            <Input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              name="family-birth"
              autoComplete="bday"
            />
          </Field>
          <Field label="Родство">
            <Select
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              name="family-relation"
            >
              <option>супруг</option>
              <option>супруга</option>
              <option>ребёнок</option>
            </Select>
          </Field>
          <Field label="Пол">
            <Select
              value={familyGender}
              onChange={(e) => setFamilyGender(e.target.value)}
              name="family-gender"
            >
              <option>ж</option>
              <option>м</option>
            </Select>
          </Field>
          {ageBlocked ? (
            <div className="sm:col-span-3">
              <Notice tone="danger">
                Возраст {familyAge} лет — выше 65. Баллы не списываются. Альтернатива:
                «Серебряный полис» через HR.
              </Notice>
            </div>
          ) : null}
        </Panel>
      ) : null}

      {benefit.type === "leave" ? (
        <Panel className="mt-4 grid gap-3 p-5 sm:grid-cols-2">
          <Field label="Количество дней">
            <Input value={days} onChange={(e) => setDays(e.target.value)} />
          </Field>
          <Field label="Дата">
            <Input
              type="date"
              value={leaveDate}
              onChange={(e) => setLeaveDate(e.target.value)}
            />
          </Field>
          <label className="flex items-center gap-2 text-base sm:col-span-2">
            <input
              type="checkbox"
              checked={unusedVacation}
              onChange={(e) => setUnusedVacation(e.target.checked)}
            />
            Основной отпуск неотгулян больше 14 дней
          </label>
        </Panel>
      ) : null}

      {benefit.id === "camp" ? (
        <Panel className="mt-4 grid gap-3 p-5 sm:grid-cols-2">
          <Field label="ФИО ребёнка">
            <Input value={childName} onChange={(e) => setChildName(e.target.value)} />
          </Field>
          <Field label="Даты смены">
            <Input value={shiftDates} onChange={(e) => setShiftDates(e.target.value)} />
          </Field>
        </Panel>
      ) : null}

      {benefit.type === "family" &&
      benefit.id !== "dms-family" &&
      benefit.id !== "camp" ? (
        <Panel className="mt-4 max-w-md p-5">
          <Field label="ФИО ребёнка">
            <Input value={childName} onChange={(e) => setChildName(e.target.value)} />
          </Field>
        </Panel>
      ) : null}

      {benefit.id === "merch" ? (
        <Panel className="mt-4 max-w-xs p-5">
          <Field label="Размер">
            <Select value={size} onChange={(e) => setSize(e.target.value)}>
              <option>S</option>
              <option>M</option>
              <option>L</option>
              <option>XL</option>
              <option>XXL</option>
            </Select>
          </Field>
        </Panel>
      ) : null}

      {benefit.id === "psych" ? (
        <Panel className="mt-4 max-w-md p-5">
          <Field label="Слот консультации">
            <Select value={slot} onChange={(e) => setSlot(e.target.value)}>
              <option>2026-10-15 11:00</option>
              <option>2026-10-16 15:30</option>
              <option>2026-10-17 09:00</option>
            </Select>
          </Field>
        </Panel>
      ) : null}

      {benefit.id === "lang" ? (
        <Panel className="mt-4 max-w-md p-5">
          <Field label="Группа">
            <Select value={langGroup} onChange={(e) => setLangGroup(e.target.value)}>
              <option>Вт/Чт 18:00</option>
              <option>Сб 11:00</option>
              <option>Пн/Ср 08:00</option>
            </Select>
          </Field>
        </Panel>
      ) : null}

      {benefit.id === "resort" ? (
        <Panel className="mt-4 grid gap-3 p-5 sm:grid-cols-2">
          <Field label="Заезд">
            <Input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </Field>
          <Field label="Гостей">
            <Input value={guests} onChange={(e) => setGuests(e.target.value)} />
          </Field>
        </Panel>
      ) : null}

      {benefit.type === "docs" ? (
        <Panel className="mt-4 max-w-md p-5">
          <div className="flex flex-col gap-2 text-base">
            <span className="text-muted">Файл подтверждения</span>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
              <Input
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                aria-label="Файл подтверждения"
              />
              <FilePickButton onName={setDocName} />
            </div>
          </div>
          <p className="mt-2 text-sm text-muted">В заявку уйдёт имя файла.</p>
          <AttachmentButtons
            items={[
              {
                id: "att-doc-preview",
                title: docName,
                kind: "pdf",
                href: docName,
              },
            ]}
          />
        </Panel>
      ) : null}

      {benefit.type === "certificate" ? (
        <Panel className="mt-4 max-w-md p-5">
          <Field label="Промокод (необязательно)">
            <Input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="ALTAIR10"
            />
          </Field>
          <p className="mt-2 text-xs text-muted">
            Демо-код ALTAIR10 даёт дополнительный кэшбэк при покупке сертификата.
          </p>
        </Panel>
      ) : null}

      {error ? (
        <div className="mt-4">
          <Notice tone="danger">{error}</Notice>
        </div>
      ) : null}
      {ok ? (
        <div className="mt-4">
          <Notice tone="ok">{ok}</Notice>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          variant="primary"
          disabled={!state.window.open || me.frozen || ageBlocked}
          onClick={() => {
            setError("");
            setOk("");
            if (!state.window.open) {
              setError("Окно выбора закрыто");
              return;
            }
            if (me.frozen) {
              setError("Баллы заморожены");
              return;
            }
            const problem = formError();
            if (problem) {
              setError(problem);
              return;
            }
            const res = buyNow(benefit.id, meta());
            if (!res.ok) {
              setError(res.reason);
              return;
            }
            if (res.order.code) {
              setOk(`Заказ выполнен. Код: ${res.order.code}`);
            } else if (res.order.status === "awaiting_approval") {
              setOk("Заявка отправлена на согласование руководителю.");
            } else if (res.order.status === "processing") {
              setOk("Заказ принят в обработку.");
            } else {
              setOk("Заказ оформлен.");
            }
            setTimeout(() => router.push("/app/orders"), 900);
          }}
        >
          {benefit.type === "non_financial" ? "Активировать" : "Оформить сейчас"}
        </Button>
        {benefit.price > 0 ? (
          <Button
            disabled={ageBlocked}
            onClick={() => {
              setError("");
              const problem = formError();
              if (problem) {
                setError(problem);
                return;
              }
              addToCart(benefit.id, meta());
              router.push("/app/cart");
            }}
          >
            В корзину
          </Button>
        ) : null}
      </div>
      {!state.window.open ? (
        <p className="mt-3 text-sm text-danger">
          Окно закрыто: каталог виден, оформление недоступно.
        </p>
      ) : null}
    </div>
  );
}
