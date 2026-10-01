/**
 * Приёмка правил демо без UI.
 * Запуск: npx tsx scripts/acceptance.ts
 */
import assert from "node:assert/strict";
import { ageFromBirth } from "../lib/format";
import {
  canSeeSection,
  packageTotal,
  recommendedPackage,
  spendPoints,
  totalBalance,
  visibleBenefits,
} from "../lib/rules";
import { createSeed } from "../lib/seed";

const seed = createSeed();
const maria = seed.people.find((p) => p.id === "maria")!;
const elena = seed.people.find((p) => p.id === "elena")!;
const igor = seed.people.find((p) => p.id === "igor")!;
const anton = seed.people.find((p) => p.id === "anton")!;
const nina = seed.people.find((p) => p.id === "nina")!;

assert.equal(maria.burnable, 5000);
assert.equal(maria.durable, 2000);
assert.equal(maria.years * 500, 2000);
assert.equal(totalBalance(maria), 7000);
assert.equal(maria.onboardingDone, false);

const spent = spendPoints(maria, 5200);
assert.equal(spent.burnable, 0);
assert.equal(spent.durable, 1800);
assert.equal(spent.burnableDelta, -5000);
assert.equal(spent.durableDelta, -200);

const rec = recommendedPackage(maria, seed.benefits);
assert.ok(rec.length >= 2);
assert.ok(rec.every((b) => b.packageGrade?.includes("B")));
const cost = packageTotal(
  rec.map((b) => b.id),
  seed.benefits,
);
assert.ok(cost <= totalBalance(maria));

assert.equal(canSeeSection(elena, "health"), false);
assert.equal(canSeeSection(elena, "rest"), true);
assert.ok(!visibleBenefits(elena, seed.benefits).some((b) => b.section === "health"));

assert.equal(canSeeSection(igor, "general"), true);
assert.equal(canSeeSection(igor, "health"), false);
assert.ok(visibleBenefits(igor, seed.benefits).every((b) => b.section === "general"));

assert.ok(ageFromBirth("1950-01-01", new Date("2026-10-01")) > 65);
assert.ok(ageFromBirth("2000-01-01", new Date("2026-10-01")) < 65);

const hotel = seed.benefits.find((b) => b.id === "hotel")!;
assert.equal(hotel.codes?.length, 4);
assert.equal(hotel.usedCodes?.length ?? 0, 0);

const depts = new Set(
  seed.people
    .filter((p) => p.role === "employee" || p.role === "decret" || p.role === "manager")
    .map((p) => p.department),
);
assert.equal(depts.size, 3);

assert.equal(seed.benefits.filter((b) => !b.archived).length >= 12, true);
assert.ok(seed.people.length >= 40);
assert.equal(seed.window.open, true);
assert.equal(seed.settings.lottery, true);
assert.equal(seed.version, 4);
assert.ok(seed.funds.length >= 2);
assert.ok(seed.lotteries.length >= 1);
assert.ok(seed.surveys.length >= 1);
assert.ok(seed.promos.length >= 1);
assert.ok(seed.badges.length >= 1);
assert.ok(seed.socialProjects.length >= 1);
assert.equal(seed.settings.gamification, true);
assert.equal(maria.needsQuizDone, false);

assert.ok(seed.categories.length >= 4);
assert.ok(seed.dms.clinics.length >= 2);
assert.ok(seed.dms.programs.length >= 2);
assert.ok(seed.eventGrants.length >= 4);
assert.ok(seed.roleMap.admin.includes("settings"));
assert.equal(anton.exclusion, true);
assert.equal(visibleBenefits(anton, seed.benefits).length, 0);
assert.equal(nina.dmsStatus, "active");
assert.ok(seed.benefits.every((b) => (b.attachments?.length ?? 0) >= 1 || b.archived));
assert.ok(seed.emailTemplates.length >= 2);
assert.ok(seed.benefits.some((b) => b.id === "kindergarten"));
assert.ok(seed.benefits.some((b) => b.id === "club"));
assert.ok(seed.benefits.some((b) => b.id === "gift-child"));
assert.equal(seed.settings.maxManualGrant, 5000);
assert.equal(seed.settings.tour, true);
assert.equal(seed.settings.balanceWheel, true);

console.log("acceptance: ok");
