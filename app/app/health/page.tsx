"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Empty, PageHeader, Panel, Points } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function HealthPage() {
  const { me, state, replaceDms, refuseBaseDms } = useStore();
  const [msg, setMsg] = useState("");
  if (!me) return null;

  if (me.role === "vip" || me.role === "decret") {
    return (
      <div>
        <PageHeader title="Здоровье" />
        <Empty>
          Раздел страховых программ для вашей роли недоступен.{" "}
          <Link href="/app/catalog" className="text-stamp">
            К каталогу
          </Link>
        </Empty>
      </div>
    );
  }

  const dms = state.benefits.filter(
    (b) => b.section === "health" && !b.archived && b.type === "dms",
  );
  const extras = state.benefits.filter(
    (b) => b.section === "health" && !b.archived && b.type !== "dms",
  );
  const statusLabel =
    me.dmsStatus === "active"
      ? "активен"
      : me.dmsStatus === "processing"
        ? "оформляется"
        : me.dmsStatus === "expired"
          ? "истёк — выберите новый пакет"
          : "не выбран";

  const currentProg = state.dms.programs.find((p) => p.id === me.dmsProgramId);

  return (
    <div>
      <PageHeader
        title="Моё здоровье"
        lead="Страховщик, клиники, покрытие и замена программы."
      />

      <Panel className="border-pine/30 p-5">
        <p className="text-sm font-medium text-pine">{state.dms.insurer}</p>
        <p className="mt-3 text-sm">
          Статус полиса: <span className="font-medium">{statusLabel}</span>
          {currentProg ? ` · ${currentProg.title}` : ""}
          {me.dmsExpiresAt ? ` · до ${formatDate(me.dmsExpiresAt)}` : ""}
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted">Что входит</p>
            <ul className="mt-2 space-y-1 text-sm">
              {state.dms.included.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs text-muted">Что не входит</p>
            <ul className="mt-2 space-y-1 text-sm">
              {state.dms.excluded.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        </div>
        {msg ? <p className="mt-3 text-sm text-pine">{msg}</p> : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="primary"
            onClick={() => {
              const res = replaceDms("dms-base");
              setMsg(res.ok ? "Заявка на базовый ДМС отправлена" : res.reason);
            }}
          >
            {me.dmsStatus === "none" || me.dmsStatus === "expired"
              ? "Выбрать базовый ДМС"
              : "Заменить базовую программу"}
          </Button>
          <Button
            onClick={() => {
              const res = refuseBaseDms();
              setMsg(res.ok ? "Отказ зафиксирован, баллы с вами" : res.reason);
            }}
          >
            Отказаться от базового ДМС
          </Button>
        </div>
      </Panel>

      <section className="mt-6">
        <h2 className="section-title">Клиники</h2>
        <ul className="space-y-3">
          {state.dms.clinics.map((c) => (
            <li key={c.id}>
              <Link href="/app/catalog/dms-base" className="ui-panel block p-5 text-base hover:border-ink">
                <p className="font-medium">{c.title}</p>
                <p className="mt-1.5 text-muted">{c.address}</p>
                <p className="mt-1 text-sm text-muted">{c.profile} · открыть полис</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="section-title">Программы страховщика</h2>
        <ul className="mt-3 space-y-2">
          {state.dms.programs.map((prog) => {
            const linked = state.benefits.find((b) => b.id === prog.benefitId);
            return (
              <li key={prog.id}>
                <Panel className="flex flex-wrap items-center justify-between gap-3 p-5">
                  <div>
                    <p className="text-base font-medium">{prog.title}</p>
                    <p className="mt-1.5 text-sm text-muted">{prog.note}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {linked ? <Points value={linked.price} size="sm" /> : null}
                    <Button
                      variant="primary"
                      onClick={() => {
                        const res = replaceDms(prog.benefitId);
                        setMsg(
                          res.ok
                            ? `Заявка: ${prog.title}`
                            : res.reason,
                        );
                      }}
                    >
                      Оформить / заменить
                    </Button>
                  </div>
                </Panel>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="section-title">Позиции раздела «Здоровье»</h2>
        <ul className="mt-3 space-y-2">
          {dms.map((b) => (
            <li key={b.id}>
              <Panel className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <p className="text-base font-medium">{b.title}</p>
                  <p className="mt-1.5 text-sm text-muted">{b.conditions}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Points value={b.price} size="sm" />
                  <Link href={`/app/catalog/${b.id}`}>
                    <Button>Открыть</Button>
                  </Link>
                </div>
              </Panel>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="section-title">Расширения и wellbeing</h2>
        <ul className="mt-3 space-y-2">
          {extras.map((b) => (
            <li key={b.id}>
              <Panel className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <p className="text-base font-medium">{b.title}</p>
                  <p className="mt-1.5 text-sm text-muted">{b.conditions}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Points value={b.price} size="sm" />
                  <Link href={`/app/catalog/${b.id}`}>
                    <Button>Открыть</Button>
                  </Link>
                </div>
              </Panel>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
