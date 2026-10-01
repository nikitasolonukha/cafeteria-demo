import type { Benefit, Person } from "./types";

export function totalBalance(person: Person): number {
  return person.burnable + person.durable;
}

export function spendPoints(
  person: Person,
  amount: number,
): { burnable: number; durable: number; burnableDelta: number; durableDelta: number } {
  if (amount < 0) throw new Error("amount must be >= 0");
  if (totalBalance(person) < amount) throw new Error("Недостаточно баллов");
  const fromBurnable = Math.min(person.burnable, amount);
  const fromDurable = amount - fromBurnable;
  return {
    burnable: person.burnable - fromBurnable,
    durable: person.durable - fromDurable,
    burnableDelta: -fromBurnable,
    durableDelta: -fromDurable,
  };
}

export function refundPoints(
  person: Person,
  burnableDelta: number,
  durableDelta: number,
): { burnable: number; durable: number } {
  return {
    burnable: person.burnable + Math.abs(burnableDelta),
    durable: person.durable + Math.abs(durableDelta),
  };
}

export function canSeeSection(person: Person, section: Benefit["section"]): boolean {
  if (person.exclusion) return false;
  if (person.role === "vip") return section === "general";
  if (person.role === "decret" && section === "health") return false;
  return true;
}

export function visibleBenefits(person: Person, benefits: Benefit[]): Benefit[] {
  if (person.exclusion) return [];
  return benefits.filter(
    (b) => !b.archived && canSeeSection(person, b.section),
  );
}

export function recommendedPackage(person: Person, benefits: Benefit[]): Benefit[] {
  if (!person.grade) return [];
  return benefits.filter(
    (b) =>
      !b.archived &&
      b.packageGrade?.includes(person.grade!) &&
      canSeeSection(person, b.section),
  );
}

export function packageTotal(ids: string[], benefits: Benefit[]): number {
  return ids.reduce((sum, id) => {
    const b = benefits.find((x) => x.id === id);
    return sum + (b?.price ?? 0);
  }, 0);
}

export function isConsoleRole(role: Person["role"]): boolean {
  return role === "hr" || role === "admin" || role === "manager";
}

export function homePathFor(role: Person["role"]): string {
  if (role === "hr" || role === "admin") return "/console";
  if (role === "manager") return "/console/approvals";
  return "/app";
}
