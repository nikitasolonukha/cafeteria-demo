import type { BadgeDef, DemoState, Person, SectionId } from "./types";
import { uid } from "./social";

export function awardBadge(
  prev: DemoState,
  personId: string,
  rule: BadgeDef["rule"],
): DemoState {
  if (!prev.settings.gamification) return prev;
  const badge = prev.badges.find((b) => b.rule === rule);
  if (!badge) return prev;
  const person = prev.people.find((p) => p.id === personId);
  if (!person) return prev;
  if (person.badgeIds?.includes(badge.id)) return prev;
  return {
    ...prev,
    people: prev.people.map((p) =>
      p.id === personId
        ? { ...p, badgeIds: [...(p.badgeIds ?? []), badge.id] }
        : p,
    ),
    notifications: [
      {
        id: uid("nt"),
        personId,
        title: `Достижение: ${badge.title}`,
        body: badge.description,
        at: new Date().toISOString(),
        read: false,
        href: "/app/achievements",
      },
      ...prev.notifications,
    ],
  };
}

export function applyPromoCashback(
  prev: DemoState,
  personId: string,
  section: SectionId,
  price: number,
): DemoState {
  const promo = prev.promos.find(
    (p) =>
      p.active &&
      p.budgetLeft > 0 &&
      (p.section === "all" || p.section === section) &&
      p.start <= "2026-10-01" &&
      p.end >= "2026-10-01",
  );
  if (!promo || price <= 0) return prev;
  const cashback = Math.min(
    Math.round((price * promo.cashbackPct) / 100),
    promo.budgetLeft,
  );
  if (cashback <= 0) return prev;
  return {
    ...prev,
    people: prev.people.map((p) =>
      p.id === personId ? { ...p, durable: p.durable + cashback } : p,
    ),
    promos: prev.promos.map((p) =>
      p.id === promo.id
        ? {
            ...p,
            budgetLeft: p.budgetLeft - cashback,
            spent: p.spent + cashback,
            redemptions: p.redemptions + 1,
            active: p.budgetLeft - cashback > 0 ? p.active : false,
          }
        : p,
    ),
    ledger: [
      {
        id: uid("led"),
        personId,
        kind: "grant",
        amount: cashback,
        burnableDelta: 0,
        durableDelta: cashback,
        comment: `Кэшбэк акции «${promo.title}» ${promo.cashbackPct}%`,
        at: new Date().toISOString(),
        actorId: "system",
      },
      ...prev.ledger,
    ],
    notifications: [
      {
        id: uid("nt"),
        personId,
        title: "Кэшбэк по акции",
        body: `+${cashback} несгораемых · ${promo.title}`,
        at: new Date().toISOString(),
        read: false,
        href: "/app/wallet",
      },
      ...prev.notifications,
    ],
  };
}

export function recommendFromNeeds(
  answers: Record<string, string>,
  benefits: DemoState["benefits"],
): string[] {
  const focus = answers.focus ?? "";
  const map: Record<string, SectionId> = {
    Здоровье: "health",
    Отдых: "rest",
    Развитие: "growth",
    Семья: "care",
  };
  const section = map[focus];
  const ids = benefits
    .filter((b) => !b.archived && b.price > 0 && (!section || b.section === section))
    .slice(0, 3)
    .map((b) => b.id);
  return ids.length ? ids : benefits.filter((b) => b.packageGrade?.includes("B")).map((b) => b.id).slice(0, 2);
}

export function previewBudgetRecalc(people: Person[]): {
  id: string;
  name: string;
  from: number;
  to: number;
}[] {
  const gradeMap = { A: 8000, B: 5000, C: 3500 } as const;
  return people
    .filter((p) => p.grade)
    .map((p) => {
      const target = gradeMap[p.grade!];
      return {
        id: p.id,
        name: p.name,
        from: p.burnable,
        to: target,
      };
    })
    .filter((row) => row.from !== row.to);
}
