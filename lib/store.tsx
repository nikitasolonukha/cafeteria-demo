"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ageFromBirth } from "./format";
import {
  canSeeSection,
  homePathFor,
  packageTotal,
  recommendedPackage,
  spendPoints,
  totalBalance,
} from "./rules";
import { createSeed, STORAGE_KEY } from "./seed";
import {
  buyLotteryTicket,
  contributePool,
  donateCharity,
  drawLottery,
  submitSurvey,
  transferPoints,
  uid as socialUid,
} from "./social";
import {
  applyPromoCashback,
  awardBadge,
  previewBudgetRecalc,
  recommendFromNeeds,
} from "./extras";
import type {
  AuditEntry,
  Benefit,
  BenefitSuggestion,
  CartItem,
  CategoryLimit,
  DemoState,
  LedgerEntry,
  NewsItem,
  Order,
  Person,
  PlatformSettings,
  PromoCampaign,
  SectionId,
  Segment,
  Survey,
  Ticket,
} from "./types";

type OkErr = { ok: true } | { ok: false; reason: string };

type StoreApi = {
  ready: boolean;
  state: DemoState;
  me: Person | null;
  login: (id: string) => string;
  logout: () => void;
  resetDemo: () => void;
  setPackageIds: (ids: string[]) => void;
  confirmPackage: () => { ok: true } | { ok: false; reason: string };
  skipOnboarding: () => void;
  addToCart: (benefitId: string, meta?: Record<string, string>) => void;
  removeFromCart: (benefitId: string) => void;
  clearCart: () => void;
  checkoutCart: () => { ok: true; orders: Order[] } | { ok: false; reason: string };
  buyNow: (
    benefitId: string,
    meta?: Record<string, string>,
  ) => { ok: true; order: Order } | { ok: false; reason: string };
  decideLeave: (
    orderId: string,
    decision: "approve" | "reject",
  ) => { ok: true } | { ok: false; reason: string };
  cancelOrder: (orderId: string) => { ok: true } | { ok: false; reason: string };
  fulfillOrder: (orderId: string) => { ok: true } | { ok: false; reason: string };
  setFrozen: (personId: string, frozen: boolean) => { ok: true } | { ok: false; reason: string };
  manualPoints: (
    personId: string,
    amount: number,
    comment: string,
    otp?: string,
  ) => { ok: true } | { ok: false; reason: string };
  archiveBenefit: (benefitId: string, archived: boolean) => void;
  createBenefit: (input: Omit<Benefit, "archived" | "usedCodes">) => void;
  setWindowOpen: (open: boolean) => void;
  createTicket: (topic: string, body: string, attachments?: string[]) => void;
  createGuestTicket: (topic: string, body: string) => { ok: true; id: string };
  reopenTicket: (id: string) => void;
  setSuggestionStatus: (id: string, status: "new" | "seen") => void;
  toggleFund: (id: string) => void;
  createFund: (title: string, description: string) => void;
  createLottery: (title: string, ticketPrice: number) => void;
  pingIntegration: (id: string) => string;
  updateBenefit: (id: string, patch: Partial<Benefit>) => void;
  resolveTicket: (id: string) => void;
  escalateTicket: (id: string) => void;
  toggleSetting: (key: keyof PlatformSettings) => void;
  setSettingNumber: (key: keyof PlatformSettings, value: number) => void;
  activateFlex: () =>
    | void
    | { ok: true }
    | { ok: true; order: Order }
    | { ok: false; reason: string };
  transfer: (toId: string, amount: number, comment: string) => OkErr;
  donate: (fundId: string, amount: number) => OkErr;
  poolContribute: (poolId: string, amount: number) => OkErr;
  createPool: (title: string, description: string, goal: number) => OkErr;
  lotteryBuy: (lotteryId: string) => OkErr;
  lotteryDraw: (lotteryId: string) => OkErr;
  surveyAnswer: (surveyId: string, answers: Record<string, string>) => OkErr;
  createSurvey: (survey: Omit<Survey, "id" | "responses">) => void;
  setSurveyOpen: (id: string, open: boolean) => void;
  publishNews: (title: string, body: string) => void;
  commentNews: (newsId: string, body: string) => OkErr;
  moderateComment: (newsId: string, commentId: string, hidden: boolean) => void;
  setBannerActive: (id: string, active: boolean) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resolveAnomaly: (id: string, status: "ok" | "blocked") => void;
  importPeopleCsv: (text: string) => { ok: true; added: number } | { ok: false; reason: string };
  suggestBenefit: (title: string, body: string) => void;
  resendCode: (orderId: string) => OkErr;
  addCodes: (benefitId: string, codes: string[]) => void;
  setRole: (personId: string, role: Person["role"]) => void;
  setWindowDates: (start: string, end: string) => OkErr;
  setWindowSegments: (ids: string[]) => void;
  setChangeMode: (mode: "inform" | "restrict") => void;
  accountingExport: () => string;
  saveNeedsQuiz: (answers: Record<string, string>) => OkErr;
  massBudgetPreview: () => { id: string; name: string; from: number; to: number }[];
  applyMassBudget: () => OkErr;
  upsertSegment: (seg: Segment) => void;
  setPersonSegments: (personId: string, segmentIds: string[]) => void;
  setCategoryLimit: (section: SectionId, patch: Partial<CategoryLimit>) => void;
  createPromo: (input: Omit<PromoCampaign, "id" | "spent" | "redemptions">) => void;
  togglePromo: (id: string) => void;
  deleteBenefit: (benefitId: string) => OkErr;
  joinSocial: (projectId: string) => OkErr;
  confirmOtp: (code: string) => boolean;
  replaceDms: (benefitId: string) => OkErr;
  refuseBaseDms: () => OkErr;
  runEventGrant: (eventId: string) => OkErr;
  sendBurnNotices: () => { ok: true; sent: number };
  setExclusion: (personId: string, exclusion: boolean) => void;
  setRoleMap: (role: Person["role"], caps: import("./types").RoleCapability[]) => void;
  createCategory: (section: SectionId, title: string) => void;
  payoutExport: () => string;
  markDataGap: () => string;
  setDeliveryStatus: (
    orderId: string,
    status: "print" | "shipped" | "delivered",
  ) => OkErr;
  compensateOrder: (orderId: string, otp?: string) => OkErr;
  notifyWindow: () => { ok: true; sent: number };
  updateEmailTemplate: (id: string, body: string) => void;
  dashboardExport: () => string;
};

const StoreContext = createContext<StoreApi | null>(null);

function uid(prefix: string) {
  return socialUid(prefix);
}

function migrateV4(parsed: DemoState): DemoState {
  const seed = createSeed();
  const settings = { ...seed.settings, ...parsed.settings };
  if (!settings.burnDefaultMonths) settings.burnDefaultMonths = seed.settings.burnDefaultMonths;
  if (!settings.passwordMinLength) settings.passwordMinLength = seed.settings.passwordMinLength;
  if (!settings.maxManualGrant) settings.maxManualGrant = seed.settings.maxManualGrant;
  const benefitIds = new Set(parsed.benefits.map((b) => b.id));
  const extraBenefits = seed.benefits.filter((b) => !benefitIds.has(b.id));
  const eventIds = new Set((parsed.eventGrants ?? []).map((e) => e.id));
  const extraEvents = seed.eventGrants.filter((e) => !eventIds.has(e.id));
  const catIds = new Set((parsed.categories ?? []).map((c) => c.id));
  const extraCats = seed.categories.filter((c) => !catIds.has(c.id));
  const benefits = extraBenefits.length
    ? [...parsed.benefits, ...extraBenefits]
    : parsed.benefits;
  const benefitById = new Map(benefits.map((b) => [b.id, b]));
  const orders = parsed.orders.map((o) => {
    const b = benefitById.get(o.benefitId);
    if (
      (b?.type === "physical" || b?.id === "gift-child") &&
      !o.deliveryStatus
    ) {
      return {
        ...o,
        deliveryStatus: o.status === "done" ? "delivered" as const : "print" as const,
      };
    }
    return o;
  });
  return {
    ...parsed,
    settings,
    benefits,
    orders,
    eventGrants: extraEvents.length
      ? [...(parsed.eventGrants ?? []), ...extraEvents]
      : parsed.eventGrants ?? seed.eventGrants,
    categories: extraCats.length
      ? [...(parsed.categories ?? []), ...extraCats]
      : parsed.categories ?? seed.categories,
    emailTemplates: parsed.emailTemplates?.length
      ? parsed.emailTemplates
      : seed.emailTemplates,
    tickets: (parsed.tickets?.length ? parsed.tickets : seed.tickets).map((t) =>
      t.id === "t-seed-1" && !t.attachments?.length
        ? { ...t, attachments: ["skrin-kursa.png"] }
        : t,
    ),
    suggestions: parsed.suggestions?.length
      ? parsed.suggestions
      : seed.suggestions,
  };
}

function loadState(): DemoState {
  if (typeof window === "undefined") return createSeed();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeed();
    const parsed = JSON.parse(raw) as DemoState;
    if (parsed.version !== 4) return createSeed();
    return migrateV4(parsed);
  } catch {
    return createSeed();
  }
}

function patchPeople(
  people: Person[],
  id: string,
  updater: (p: Person) => Person,
): Person[] {
  return people.map((p) => (p.id === id ? updater(p) : p));
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(() => createSeed());
  const [ready, setReady] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const loaded = loadState();
    stateRef.current = loaded;
    setState(loaded);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, ready]);

  const commit = useCallback((next: DemoState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const me = useMemo(
    () => state.people.find((p) => p.id === state.currentUserId) ?? null,
    [state.people, state.currentUserId],
  );

  const pushAudit = useCallback(
    (prev: DemoState, action: string, detail: string): AuditEntry[] => [
      {
        id: uid("aud"),
        at: new Date().toISOString(),
        actorId: prev.currentUserId ?? "system",
        action,
        detail,
      },
      ...prev.audit,
    ],
    [],
  );

  const login = useCallback((id: string) => {
    const prev = stateRef.current;
    const person = prev.people.find((p) => p.id === id);
    if (!person) return "/";
    commit({
      ...prev,
      currentUserId: id,
      cart: [],
      packageIds:
        person.onboardingDone || !person.grade
          ? []
          : recommendedPackage(person, prev.benefits).map((b) => b.id),
    });
    return homePathFor(person.role);
  }, [commit]);

  const logout = useCallback(() => {
    commit({
      ...stateRef.current,
      currentUserId: null,
      cart: [],
      packageIds: [],
    });
  }, [commit]);

  const resetDemo = useCallback(() => {
    const seed = createSeed();
    commit(seed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  }, [commit]);

  const setPackageIds = useCallback(
    (ids: string[]) => {
      commit({ ...stateRef.current, packageIds: ids });
    },
    [commit],
  );

  const placeOrders = useCallback(
    (
      prev: DemoState,
      person: Person,
      items: { benefit: Benefit; meta?: Record<string, string> }[],
    ): { next: DemoState; orders: Order[] } | { error: string } => {
      if (person.frozen) return { error: "Баллы заморожены" };
      if (!prev.window.open) return { error: "Окно выбора закрыто" };
      const windowSegs = prev.window.segmentIds ?? [];
      if (
        windowSegs.length &&
        !windowSegs.includes("seg-all") &&
        !(person.segmentIds ?? []).some((id) => windowSegs.includes(id))
      ) {
        return { error: "Кампания недоступна вашему сегменту" };
      }

      const total = items.reduce((s, i) => s + i.benefit.price, 0);
      if (total > 0 && totalBalance(person) < total) {
        return { error: `Не хватает ${total - totalBalance(person)} баллов` };
      }

      for (const item of items) {
        if (!canSeeSection(person, item.benefit.section)) {
          return { error: "Позиция недоступна для вашей роли" };
        }
        if (item.benefit.archived) return { error: "Позиция скрыта" };
        if (item.benefit.type === "dms" && item.meta?.birthDate) {
          const age = ageFromBirth(item.meta.birthDate);
          if (age > 65) {
            return {
              error:
                "Возраст выше 65 лет. Доступна альтернатива: программа «Серебряный полис» вне кафетерия — обратитесь в HR.",
            };
          }
        }
        if (item.benefit.id === "dms-family") {
          if (!item.meta?.familyName?.trim() || !item.meta?.birthDate) {
            return { error: "Заполните данные члена семьи" };
          }
        }
        if (item.benefit.type === "leave" && item.meta?.unusedVacation === "1") {
          return {
            error:
              "Недоступно при неотгулянном основном отпуске свыше 14 дней.",
          };
        }
        if (item.benefit.id === "camp") {
          if (!item.meta?.childName?.trim() || !item.meta?.shiftDates?.trim()) {
            return { error: "Укажите ФИО ребёнка и даты смены" };
          }
        }
        if (
          item.benefit.type === "family" &&
          item.benefit.id !== "dms-family" &&
          !item.meta?.childName?.trim()
        ) {
          return { error: "Укажите ФИО ребёнка" };
        }
        if (
          item.benefit.seatsLeft !== undefined &&
          item.benefit.seatsLeft <= 0
        ) {
          return { error: "Места на программу закончились" };
        }
        if (item.benefit.limitPerPeriod) {
          const used = prev.orders.filter(
            (o) =>
              o.personId === person.id &&
              o.benefitId === item.benefit.id &&
              o.status !== "cancelled" &&
              o.status !== "rejected",
          ).length;
          if (used >= item.benefit.limitPerPeriod) {
            return {
              error: `Лимит по позиции: ${item.benefit.limitPerPeriod} за период`,
            };
          }
        }
        if (
          item.benefit.type === "certificate" &&
          item.meta?.promoCode?.trim() &&
          item.meta.promoCode.trim().toUpperCase() !== "ALTAIR10"
        ) {
          return { error: "Промокод недействителен. Демо: ALTAIR10" };
        }
        if (
          (item.benefit.type === "certificate" ||
            (item.benefit.codes && item.benefit.codes.length > 0)) &&
          (!item.benefit.codes ||
            item.benefit.codes.length - (item.benefit.usedCodes?.length ?? 0) <= 0)
        ) {
          return { error: "Коды закончились" };
        }
        const limit = prev.categoryLimits.find(
          (c) => c.section === item.benefit.section && c.enabled && c.maxPerYear > 0,
        );
        if (limit) {
          const spentYear = prev.orders
            .filter(
              (o) =>
                o.personId === person.id &&
                prev.benefits.find((b) => b.id === o.benefitId)?.section ===
                  item.benefit.section &&
                o.status !== "cancelled" &&
                o.status !== "rejected",
            )
            .reduce((s, o) => s + o.price, 0);
          if (spentYear + item.benefit.price > limit.maxPerYear) {
            return {
              error: `Лимит категории «${item.benefit.section}»: ${limit.maxPerYear} баллов в год`,
            };
          }
        }
      }

      let burnable = person.burnable;
      let durable = person.durable;
      const orders: Order[] = [];
      const ledger: LedgerEntry[] = [];
      let benefits = prev.benefits;

      for (const item of items) {
        const spent =
          item.benefit.price > 0
            ? spendPoints({ ...person, burnable, durable }, item.benefit.price)
            : {
                burnable,
                durable,
                burnableDelta: 0,
                durableDelta: 0,
              };
        burnable = spent.burnable;
        durable = spent.durable;

        let code: string | undefined;
        let status: Order["status"] = "done";
        let note = item.meta?.note;
        const approverId =
          item.benefit.type === "leave" ? person.managerId ?? undefined : undefined;

        if (item.benefit.type === "leave") {
          status = "awaiting_approval";
          note = item.meta?.days
            ? `${item.meta.days} дн.${item.meta.date ? `, ${item.meta.date}` : ""}`
            : note;
        } else if (item.benefit.type === "dms" && item.meta?.familyName) {
          note = `${item.meta.familyName}, ${item.meta.relation ?? ""}${
            item.meta.gender ? `, ${item.meta.gender}` : ""
          }${item.meta.birthDate ? `, ${item.meta.birthDate}` : ""}`;
          status = "processing";
        } else if (
          item.benefit.type === "certificate" ||
          (item.benefit.codes && item.benefit.codes.length)
        ) {
          const pool = benefits.find((b) => b.id === item.benefit.id)!;
          const available = (pool.codes ?? []).filter(
            (c) => !(pool.usedCodes ?? []).includes(c),
          );
          code = available[0];
          benefits = benefits.map((b) =>
            b.id === pool.id
              ? { ...b, usedCodes: [...(b.usedCodes ?? []), code!] }
              : b,
          );
        } else if (
          item.benefit.type === "physical" ||
          item.benefit.type === "family" ||
          item.benefit.type === "docs"
        ) {
          status = "processing";
          if (item.benefit.id === "camp" && item.meta) {
            note = `${item.meta.childName}, ${item.meta.shiftDates}`;
          } else if (item.benefit.type === "family" && item.meta?.childName) {
            note = item.meta.childName;
          }
          if (item.benefit.id === "merch" && item.meta?.size) {
            note = `размер ${item.meta.size} · доставка на офис`;
          }
          if (item.benefit.type === "docs" && item.meta?.docName) {
            note = `документ: ${item.meta.docName}`;
          }
        } else if (item.benefit.type === "booking") {
          status = "processing";
          if (item.meta?.slot) note = `слот ${item.meta.slot}`;
          if (item.meta?.group) note = `группа ${item.meta.group}`;
          if (item.meta?.checkIn) {
            note = `заезд ${item.meta.checkIn}${item.meta.guests ? `, гостей ${item.meta.guests}` : ""}`;
          }
        } else if (item.benefit.type === "non_financial") {
          status = "done";
        }
        if (item.meta?.promoCode?.trim().toUpperCase() === "ALTAIR10") {
          note = note ? `${note} · промокод ALTAIR10` : "промокод ALTAIR10";
        }
        if (item.benefit.seatsLeft !== undefined) {
          benefits = benefits.map((b) =>
            b.id === item.benefit.id
              ? { ...b, seatsLeft: Math.max(0, (b.seatsLeft ?? 1) - 1) }
              : b,
          );
        }

        const order: Order = {
          id: uid("ord"),
          personId: person.id,
          benefitId: item.benefit.id,
          title: item.benefit.title,
          price: item.benefit.price,
          status,
          createdAt: new Date().toISOString(),
          code,
          note,
          approverId,
          meta: item.meta,
          deliveryStatus:
            item.benefit.type === "physical" || item.benefit.id === "gift-child"
              ? "print"
              : undefined,
        };
        orders.push(order);

        if (item.benefit.price > 0) {
          ledger.push({
            id: uid("led"),
            personId: person.id,
            kind: "spend",
            amount: item.benefit.price,
            burnableDelta: spent.burnableDelta,
            durableDelta: spent.durableDelta,
            comment: item.benefit.title,
            at: order.createdAt,
            actorId: person.id,
          });
        }
      }

      const boughtDms = items.find(
        (i) => i.benefit.type === "dms" && i.benefit.id === "dms-base",
      );
      const people = patchPeople(prev.people, person.id, (p) => ({
        ...p,
        burnable,
        durable,
        onboardingDone: true,
        flexibleSchedule:
          p.flexibleSchedule ||
          items.some((i) => i.benefit.type === "non_financial"),
        ...(boughtDms
          ? {
              dmsProgramId: "prog-std",
              dmsStatus: "processing" as const,
              dmsExpiresAt: "2027-09-30",
            }
          : {}),
      }));

      let next: DemoState = {
        ...prev,
        people,
        benefits,
        orders: [...orders, ...prev.orders],
        ledger: [...ledger, ...prev.ledger],
        cart: [],
        packageIds: [],
        audit: pushAudit(
          prev,
          "order",
          `${person.name}: ${orders.map((o) => o.title).join(", ")}`,
        ),
      };

      for (const item of items) {
        if (item.benefit.price > 0) {
          next = applyPromoCashback(
            next,
            person.id,
            item.benefit.section,
            item.benefit.price,
          );
          if (item.meta?.promoCode?.trim().toUpperCase() === "ALTAIR10") {
            next = applyPromoCashback(
              next,
              person.id,
              item.benefit.section,
              item.benefit.price,
            );
          }
        }
      }
      const priorOrders = prev.orders.filter((o) => o.personId === person.id);
      if (!priorOrders.length && orders.some((o) => o.price > 0 || o.status)) {
        next = awardBadge(next, person.id, "first_order");
      }

      return {
        next,
        orders,
      };
    },
    [pushAudit],
  );

  const confirmPackage = useCallback(() => {
    const prev = stateRef.current;
    const person = prev.people.find((p) => p.id === prev.currentUserId);
    if (!person) return { ok: false as const, reason: "Нет пользователя" };

    const items = prev.packageIds
      .map((id) => prev.benefits.find((b) => b.id === id))
      .filter(Boolean)
      .map((benefit) => ({ benefit: benefit! }));
    const total = packageTotal(prev.packageIds, prev.benefits);
    if (total > totalBalance(person)) {
      return {
        ok: false as const,
        reason: `Набор больше баланса на ${total - totalBalance(person)} баллов`,
      };
    }

    if (!items.length) {
      commit({
        ...prev,
        people: patchPeople(prev.people, person.id, (p) => ({
          ...p,
          onboardingDone: true,
        })),
        packageIds: [],
        audit: pushAudit(prev, "onboarding", `${person.name}: пакет без позиций`),
      });
      return { ok: true as const };
    }

    const built = placeOrders(prev, person, items);
    if ("error" in built) return { ok: false as const, reason: built.error };
    commit(built.next);
    return { ok: true as const };
  }, [placeOrders, pushAudit, commit]);

  const skipOnboarding = useCallback(() => {
    const prev = stateRef.current;
    const person = prev.people.find((p) => p.id === prev.currentUserId);
    if (!person) return;
    commit({
      ...prev,
      people: patchPeople(prev.people, person.id, (p) => ({
        ...p,
        onboardingDone: true,
      })),
      packageIds: [],
      audit: pushAudit(prev, "onboarding", `${person.name}: пропуск пакета`),
    });
  }, [commit, pushAudit]);

  const addToCart = useCallback(
    (benefitId: string, meta?: Record<string, string>) => {
      const prev = stateRef.current;
      const exists = prev.cart.find((c) => c.benefitId === benefitId);
      const cart: CartItem[] = exists
        ? prev.cart.map((c) =>
            c.benefitId === benefitId ? { ...c, meta: meta ?? c.meta } : c,
          )
        : [...prev.cart, { benefitId, qty: 1, meta }];
      commit({ ...prev, cart });
    },
    [commit],
  );

  const removeFromCart = useCallback(
    (benefitId: string) => {
      const prev = stateRef.current;
      commit({
        ...prev,
        cart: prev.cart.filter((c) => c.benefitId !== benefitId),
      });
    },
    [commit],
  );

  const clearCart = useCallback(() => {
    commit({ ...stateRef.current, cart: [] });
  }, [commit]);

  const checkoutCart = useCallback(() => {
    const prev = stateRef.current;
    const person = prev.people.find((p) => p.id === prev.currentUserId);
    if (!person) return { ok: false as const, reason: "Нет пользователя" };
    const items = prev.cart
      .map((c) => {
        const benefit = prev.benefits.find((b) => b.id === c.benefitId);
        return benefit ? { benefit, meta: c.meta } : null;
      })
      .filter(Boolean) as { benefit: Benefit; meta?: Record<string, string> }[];
    if (!items.length) return { ok: false as const, reason: "Корзина пуста" };
    const built = placeOrders(prev, person, items);
    if ("error" in built) return { ok: false as const, reason: built.error };
    commit(built.next);
    return { ok: true as const, orders: built.orders };
  }, [placeOrders, commit]);

  const buyNow = useCallback(
    (benefitId: string, meta?: Record<string, string>) => {
      const prev = stateRef.current;
      const person = prev.people.find((p) => p.id === prev.currentUserId);
      const benefit = prev.benefits.find((b) => b.id === benefitId);
      if (!person || !benefit) {
        return { ok: false as const, reason: "Позиция не найдена" };
      }
      if (benefit.type === "non_financial") {
        const order: Order = {
          id: uid("ord"),
          personId: person.id,
          benefitId: benefit.id,
          title: benefit.title,
          price: 0,
          status: "done",
          createdAt: new Date().toISOString(),
        };
        commit({
          ...prev,
          people: patchPeople(prev.people, person.id, (p) => ({
            ...p,
            flexibleSchedule: true,
            onboardingDone: true,
          })),
          orders: [order, ...prev.orders],
          audit: pushAudit(prev, "flex", `${person.name}: гибкий график`),
        });
        return { ok: true as const, order };
      }
      const built = placeOrders(prev, person, [{ benefit, meta }]);
      if ("error" in built) return { ok: false as const, reason: built.error };
      commit(built.next);
      return { ok: true as const, order: built.orders[0] };
    },
    [placeOrders, pushAudit, commit],
  );

  const activateFlex = useCallback(() => {
    const prev = stateRef.current;
    const person = prev.people.find((p) => p.id === prev.currentUserId);
    if (!person || person.flexibleSchedule) return { ok: true as const };
    return buyNow("flex");
  }, [buyNow]);

  const refundOrder = useCallback(
    (
      prev: DemoState,
      order: Order,
      actorId: string,
      nextStatus: "rejected" | "cancelled",
      auditAction: string,
      auditDetail: string,
    ): DemoState | { error: string } => {
      const owner = prev.people.find((p) => p.id === order.personId);
      if (!owner) return { error: "Сотрудник не найден" };
      const spendEntry = prev.ledger.find(
        (l) =>
          l.personId === owner.id &&
          l.kind === "spend" &&
          l.comment === order.title &&
          Math.abs(l.amount - order.price) < 0.1,
      );
      const burnableBack =
        order.price > 0 ? Math.abs(spendEntry?.burnableDelta ?? order.price) : 0;
      const durableBack =
        order.price > 0 ? Math.abs(spendEntry?.durableDelta ?? 0) : 0;
      return {
        ...prev,
        people:
          order.price > 0
            ? patchPeople(prev.people, owner.id, (p) => ({
                ...p,
                burnable: p.burnable + burnableBack,
                durable: p.durable + durableBack,
              }))
            : prev.people,
        orders: prev.orders.map((o) =>
          o.id === order.id ? { ...o, status: nextStatus } : o,
        ),
        ledger:
          order.price > 0
            ? [
                {
                  id: uid("led"),
                  personId: owner.id,
                  kind: "refund",
                  amount: order.price,
                  burnableDelta: burnableBack,
                  durableDelta: durableBack,
                  comment: `Возврат: ${order.title}`,
                  at: new Date().toISOString(),
                  actorId,
                },
                ...prev.ledger,
              ]
            : prev.ledger,
        audit: pushAudit(prev, auditAction, auditDetail),
      };
    },
    [pushAudit],
  );

  const decideLeave = useCallback(
    (orderId: string, decision: "approve" | "reject") => {
      const prev = stateRef.current;
      const order = prev.orders.find((o) => o.id === orderId);
      const actor = prev.people.find((p) => p.id === prev.currentUserId);
      if (!order || !actor) return { ok: false as const, reason: "Заявка не найдена" };
      if (order.status !== "awaiting_approval") {
        return { ok: false as const, reason: "Уже обработана" };
      }
      if (
        actor.role !== "hr" &&
        actor.role !== "admin" &&
        order.approverId !== actor.id
      ) {
        return { ok: false as const, reason: "Нет права согласования" };
      }

      if (decision === "approve") {
        commit({
          ...prev,
          orders: prev.orders.map((o) =>
            o.id === orderId ? { ...o, status: "done" } : o,
          ),
          audit: pushAudit(
            prev,
            "approve",
            `${actor.name} одобрил «${order.title}»`,
          ),
        });
        return { ok: true as const };
      }

      const next = refundOrder(
        prev,
        order,
        actor.id,
        "rejected",
        "reject",
        `${actor.name} отклонил «${order.title}», баллы возвращены`,
      );
      if ("error" in next) return { ok: false as const, reason: next.error };
      commit(next);
      return { ok: true as const };
    },
    [pushAudit, commit, refundOrder],
  );

  const cancelOrder = useCallback(
    (orderId: string) => {
      const prev = stateRef.current;
      const order = prev.orders.find((o) => o.id === orderId);
      const actor = prev.people.find((p) => p.id === prev.currentUserId);
      if (!order || !actor) return { ok: false as const, reason: "Заказ не найден" };
      if (order.personId !== actor.id && actor.role !== "hr" && actor.role !== "admin") {
        return { ok: false as const, reason: "Нет права отмены" };
      }
      const benefit = prev.benefits.find((b) => b.id === order.benefitId);
      if (benefit?.type === "certificate" || order.code) {
        return {
          ok: false as const,
          reason: "Сертификат с выданным кодом отменить нельзя",
        };
      }
      if (order.status === "done" || order.status === "cancelled" || order.status === "rejected") {
        return { ok: false as const, reason: "Этот статус уже финальный" };
      }
      if (
        order.status !== "awaiting_approval" &&
        order.status !== "processing" &&
        order.status !== "created"
      ) {
        return { ok: false as const, reason: "Отмена недоступна" };
      }

      const next = refundOrder(
        prev,
        order,
        actor.id,
        "cancelled",
        "cancel",
        `${actor.name} отменил «${order.title}», баллы возвращены`,
      );
      if ("error" in next) return { ok: false as const, reason: next.error };
      commit(next);
      return { ok: true as const };
    },
    [commit, refundOrder],
  );

  const fulfillOrder = useCallback(
    (orderId: string) => {
      const prev = stateRef.current;
      const order = prev.orders.find((o) => o.id === orderId);
      const actor = prev.people.find((p) => p.id === prev.currentUserId);
      if (!order || !actor) return { ok: false as const, reason: "Заказ не найден" };
      if (actor.role !== "hr" && actor.role !== "admin") {
        return { ok: false as const, reason: "Только HR или админ" };
      }
      if (order.status !== "processing" && order.status !== "created") {
        return { ok: false as const, reason: "Нечего исполнять" };
      }
      const benefit = prev.benefits.find((b) => b.id === order.benefitId);
      let people = prev.people;
      if (benefit?.type === "dms") {
        people = patchPeople(people, order.personId, (p) => ({
          ...p,
          dmsProgramId:
            benefit.id === "dms-family" ? "prog-family" : "prog-std",
          dmsStatus: "active",
          dmsExpiresAt: p.dmsExpiresAt ?? "2027-09-30",
        }));
      }
      commit({
        ...prev,
        people,
        orders: prev.orders.map((o) =>
          o.id === orderId ? { ...o, status: "done" } : o,
        ),
        notifications: [
          {
            id: uid("nt"),
            personId: order.personId,
            title: "Заказ исполнен",
            body:
              benefit?.type === "dms"
                ? `Полис «${order.title}» активирован.`
                : `«${order.title}» выполнен.`,
            at: new Date().toISOString(),
            read: false,
            href: benefit?.type === "dms" ? "/app/health" : "/app/orders",
          },
          ...prev.notifications,
        ],
        audit: pushAudit(
          prev,
          "fulfill",
          `${actor.name} закрыл «${order.title}» как выполнен`,
        ),
      });
      return { ok: true as const };
    },
    [commit, pushAudit],
  );

  const setFrozen = useCallback(
    (personId: string, frozen: boolean) => {
      const prev = stateRef.current;
      const actor = prev.people.find((p) => p.id === prev.currentUserId);
      const person = prev.people.find((p) => p.id === personId);
      if (!actor || (actor.role !== "hr" && actor.role !== "admin")) {
        return { ok: false as const, reason: "Только HR или админ" };
      }
      if (!person) return { ok: false as const, reason: "Сотрудник не найден" };
      commit({
        ...prev,
        people: patchPeople(prev.people, personId, (p) => ({ ...p, frozen })),
        audit: pushAudit(
          prev,
          frozen ? "freeze" : "unfreeze",
          `${actor.name}: ${person.name}`,
        ),
      });
      return { ok: true as const };
    },
    [commit, pushAudit],
  );

  const manualPoints = useCallback(
    (personId: string, amount: number, comment: string, otp?: string) => {
      const prev = stateRef.current;
      const actor = prev.people.find((p) => p.id === prev.currentUserId);
      const person = prev.people.find((p) => p.id === personId);
      if (!actor || (actor.role !== "hr" && actor.role !== "admin")) {
        return { ok: false as const, reason: "Только HR или админ" };
      }
      if (!person) return { ok: false as const, reason: "Сотрудник не найден" };
      if (!comment.trim()) return { ok: false as const, reason: "Нужен комментарий" };
      if (otp !== "4242") {
        return {
          ok: false as const,
          reason: "Нужен код 2FA (в демо: 4242)",
        };
      }
      if (amount === 0) return { ok: false as const, reason: "Сумма не равна нулю" };
      if (Math.abs(amount) > (prev.settings.maxManualGrant ?? 5000)) {
        return {
          ok: false as const,
          reason: `Потолок ручного начисления: ${prev.settings.maxManualGrant ?? 5000}`,
        };
      }
      if (amount < 0 && totalBalance(person) < Math.abs(amount)) {
        return { ok: false as const, reason: "Недостаточно баллов" };
      }

      let burnable = person.burnable;
      let durable = person.durable;
      let burnableDelta = 0;
      let durableDelta = 0;
      if (amount > 0) {
        burnable += amount;
        burnableDelta = amount;
      } else {
        const spent = spendPoints(person, Math.abs(amount));
        burnable = spent.burnable;
        durable = spent.durable;
        burnableDelta = spent.burnableDelta;
        durableDelta = spent.durableDelta;
      }

      commit({
        ...prev,
        people: patchPeople(prev.people, personId, (p) => ({
          ...p,
          burnable,
          durable,
        })),
        ledger: [
          {
            id: uid("led"),
            personId,
            kind: amount > 0 ? "manual_grant" : "manual_spend",
            amount: Math.abs(amount),
            burnableDelta,
            durableDelta,
            comment: comment.trim(),
            at: new Date().toISOString(),
            actorId: actor.id,
          },
          ...prev.ledger,
        ],
        audit: pushAudit(
          prev,
          amount > 0 ? "manual_grant" : "manual_spend",
          `${actor.name}: ${amount > 0 ? "+" : "−"}${Math.abs(amount)} · ${person.name} · ${comment.trim()}`,
        ),
      });
      return { ok: true as const };
    },
    [pushAudit, commit],
  );

  const archiveBenefit = useCallback(
    (benefitId: string, archived: boolean) => {
      const prev = stateRef.current;
      commit({
        ...prev,
        benefits: prev.benefits.map((b) =>
          b.id === benefitId ? { ...b, archived } : b,
        ),
        audit: pushAudit(
          prev,
          archived ? "archive" : "restore",
          `Позиция ${benefitId}`,
        ),
      });
    },
    [pushAudit, commit],
  );

  const updateBenefit = useCallback(
    (id: string, patch: Partial<Benefit>) => {
      const prev = stateRef.current;
      commit({
        ...prev,
        benefits: prev.benefits.map((b) => (b.id === id ? { ...b, ...patch } : b)),
        audit: pushAudit(prev, "edit_benefit", id),
      });
    },
    [commit, pushAudit],
  );

  const createBenefit = useCallback(
    (input: Omit<Benefit, "archived" | "usedCodes">) => {
      const prev = stateRef.current;
      commit({
        ...prev,
        benefits: [
          {
            ...input,
            archived: false,
            usedCodes: input.type === "certificate" ? [] : undefined,
          },
          ...prev.benefits,
        ],
        audit: pushAudit(prev, "create_benefit", input.title),
      });
    },
    [pushAudit, commit],
  );

  const setWindowOpen = useCallback(
    (open: boolean) => {
      const prev = stateRef.current;
      const actor = prev.people.find((p) => p.id === prev.currentUserId);
      if (!actor || actor.role !== "admin") {
        return;
      }
      commit({
        ...prev,
        window: { ...prev.window, open },
        audit: pushAudit(
          prev,
          open ? "window_open" : "window_close",
          prev.window.title,
        ),
      });
    },
    [pushAudit, commit],
  );

  const createTicket = useCallback(
    (topic: string, body: string, attachments?: string[]) => {
      const prev = stateRef.current;
      if (!prev.currentUserId) return;
      const ticket: Ticket = {
        id: uid("t"),
        personId: prev.currentUserId,
        topic,
        body,
        status: "open",
        createdAt: new Date().toISOString(),
        slaHours: prev.settings.supportSlaHours,
        attachments: attachments?.filter(Boolean),
      };
      commit({
        ...prev,
        tickets: [ticket, ...prev.tickets],
        audit: pushAudit(prev, "ticket", topic),
      });
    },
    [pushAudit, commit],
  );

  const resolveTicket = useCallback(
    (id: string) => {
      const prev = stateRef.current;
      commit({
        ...prev,
        tickets: prev.tickets.map((t) =>
          t.id === id ? { ...t, status: "done" } : t,
        ),
        audit: pushAudit(prev, "ticket_done", id),
      });
    },
    [pushAudit, commit],
  );

  const escalateTicket = useCallback(
    (id: string) => {
      const prev = stateRef.current;
      commit({
        ...prev,
        tickets: prev.tickets.map((t) =>
          t.id === id ? { ...t, status: "escalated" } : t,
        ),
        audit: pushAudit(prev, "ticket_escalated", id),
      });
    },
    [pushAudit, commit],
  );

  const createGuestTicket = useCallback(
    (topic: string, body: string) => {
      const prev = stateRef.current;
      const ticket: Ticket = {
        id: uid("t"),
        personId: "guest",
        topic,
        body,
        status: "open",
        createdAt: new Date().toISOString(),
        slaHours: prev.settings.supportSlaHours,
        attachments: ["onboarding-zayavka.pdf"],
      };
      commit({
        ...prev,
        tickets: [ticket, ...prev.tickets],
        audit: pushAudit(prev, "ticket_guest", topic),
      });
      return { ok: true as const, id: ticket.id };
    },
    [commit, pushAudit],
  );

  const reopenTicket = useCallback(
    (id: string) => {
      const prev = stateRef.current;
      commit({
        ...prev,
        tickets: prev.tickets.map((t) =>
          t.id === id ? { ...t, status: "open" as const } : t,
        ),
        audit: pushAudit(prev, "ticket_reopen", id),
      });
    },
    [commit, pushAudit],
  );

  const setSuggestionStatus = useCallback(
    (id: string, status: "new" | "seen") => {
      const prev = stateRef.current;
      commit({
        ...prev,
        suggestions: prev.suggestions.map((s) =>
          s.id === id ? { ...s, status } : s,
        ),
      });
    },
    [commit],
  );

  const toggleFund = useCallback(
    (id: string) => {
      const prev = stateRef.current;
      commit({
        ...prev,
        funds: prev.funds.map((f) =>
          f.id === id ? { ...f, active: !f.active } : f,
        ),
        audit: pushAudit(prev, "fund_toggle", id),
      });
    },
    [commit, pushAudit],
  );

  const createFund = useCallback(
    (title: string, description: string) => {
      const prev = stateRef.current;
      if (!title.trim()) return;
      commit({
        ...prev,
        funds: [
          {
            id: uid("fund"),
            title: title.trim(),
            description: description.trim() || "Новый фонд",
            active: true,
          },
          ...prev.funds,
        ],
        audit: pushAudit(prev, "fund_create", title.trim()),
      });
    },
    [commit, pushAudit],
  );

  const createLottery = useCallback(
    (title: string, ticketPrice: number) => {
      const prev = stateRef.current;
      if (!title.trim()) return;
      commit({
        ...prev,
        lotteries: [
          {
            id: uid("lot"),
            title: title.trim(),
            description: "Создано в пульте. Призы — несгораемые баллы.",
            ticketPrice: ticketPrice || 200,
            open: true,
            drawn: false,
            prizes: [
              { id: uid("pz"), title: "Главный приз", points: 3000 },
              { id: uid("pz"), title: "Второй приз", points: 1000 },
            ],
            tickets: [],
            winners: [],
          },
          ...prev.lotteries,
        ],
        audit: pushAudit(prev, "lottery_create", title.trim()),
      });
    },
    [commit, pushAudit],
  );

  const pingIntegration = useCallback(
    (id: string) => {
      const prev = stateRef.current;
      const at = new Date().toISOString();
      const leftover = prev.benefits.reduce(
        (s, b) => s + ((b.codes?.length ?? 0) - (b.usedCodes?.length ?? 0)),
        0,
      );
      const messages: Record<string, string> = {
        "int-1c": `Штат ${prev.people.length}, грейды на месте. Следующий обмен — по расписанию.`,
        "int-sso": "Вход по кнопке роли работает. Парольный контур не вызывался.",
        "int-mail": `Шаблонов ${prev.emailTemplates.length}. Коды остаются в заказах.`,
        "int-pvk": `Свободных кодов в партиях: ${leftover}.`,
      };
      const text = messages[id] ?? "Канал ответил локально.";
      commit({
        ...prev,
        integrations: prev.integrations.map((i) =>
          i.id === id
            ? {
                ...i,
                lastCheckAt: at,
                status: i.status === "down" ? "warn" : i.status,
                detail: text,
              }
            : i,
        ),
        audit: pushAudit(prev, "integration_ping", id),
      });
      return text;
    },
    [commit, pushAudit],
  );

  const toggleSetting = useCallback(
    (key: keyof PlatformSettings) => {
      const prev = stateRef.current;
      const current = prev.settings[key];
      if (typeof current !== "boolean") return;
      commit({
        ...prev,
        settings: { ...prev.settings, [key]: !current },
        audit: pushAudit(
          prev,
          "settings",
          `${key}: ${!current ? "on" : "off"}`,
        ),
      });
    },
    [pushAudit, commit],
  );

  const setSettingNumber = useCallback(
    (key: keyof PlatformSettings, value: number) => {
      const prev = stateRef.current;
      if (typeof prev.settings[key] !== "number") return;
      if (!Number.isFinite(value) || value < 0) return;
      commit({
        ...prev,
        settings: { ...prev.settings, [key]: value },
        audit: pushAudit(prev, "settings", `${key}=${value}`),
      });
    },
    [pushAudit, commit],
  );

  const transfer = useCallback(
    (toId: string, amount: number, comment: string) => {
      const result = transferPoints(stateRef.current, toId, amount, comment);
      if (!result.ok) return result;
      commit(awardBadge(result.next, stateRef.current.currentUserId!, "transfer"));
      return { ok: true as const };
    },
    [commit],
  );

  const donate = useCallback(
    (fundId: string, amount: number) => {
      const result = donateCharity(stateRef.current, fundId, amount);
      if (!result.ok) return result;
      commit(awardBadge(result.next, stateRef.current.currentUserId!, "charity"));
      return { ok: true as const };
    },
    [commit],
  );

  const poolContribute = useCallback(
    (poolId: string, amount: number) => {
      const result = contributePool(stateRef.current, poolId, amount);
      if (!result.ok) return result;
      commit(awardBadge(result.next, stateRef.current.currentUserId!, "pool"));
      return { ok: true as const };
    },
    [commit],
  );

  const createPool = useCallback(
    (title: string, description: string, goal: number) => {
      const prev = stateRef.current;
      if (!prev.settings.teamPools) {
        return { ok: false as const, reason: "Командные сборы выключены" };
      }
      if (!prev.currentUserId || !title.trim() || goal <= 0) {
        return { ok: false as const, reason: "Заполните название и цель" };
      }
      commit({
        ...prev,
        pools: [
          {
            id: uid("pool"),
            title: title.trim(),
            description: description.trim(),
            goal,
            ownerId: prev.currentUserId,
            open: true,
            contributions: [],
          },
          ...prev.pools,
        ],
        audit: pushAudit(prev, "pool_create", title.trim()),
      });
      return { ok: true as const };
    },
    [commit, pushAudit],
  );

  const lotteryBuy = useCallback(
    (lotteryId: string) => {
      const result = buyLotteryTicket(stateRef.current, lotteryId);
      if (!result.ok) return result;
      commit(awardBadge(result.next, stateRef.current.currentUserId!, "lottery"));
      return { ok: true as const };
    },
    [commit],
  );

  const lotteryDraw = useCallback(
    (lotteryId: string) => {
      const result = drawLottery(stateRef.current, lotteryId);
      if (!result.ok) return result;
      commit(result.next);
      return { ok: true as const };
    },
    [commit],
  );

  const surveyAnswer = useCallback(
    (surveyId: string, answers: Record<string, string>) => {
      const result = submitSurvey(stateRef.current, surveyId, answers);
      if (!result.ok) return result;
      commit(awardBadge(result.next, stateRef.current.currentUserId!, "survey"));
      return { ok: true as const };
    },
    [commit],
  );

  const createSurvey = useCallback(
    (survey: Omit<Survey, "id" | "responses">) => {
      const prev = stateRef.current;
      commit({
        ...prev,
        surveys: [
          { ...survey, id: uid("srv"), responses: [] },
          ...prev.surveys,
        ],
        audit: pushAudit(prev, "survey_create", survey.title),
      });
    },
    [commit, pushAudit],
  );

  const setSurveyOpen = useCallback(
    (id: string, open: boolean) => {
      const prev = stateRef.current;
      commit({
        ...prev,
        surveys: prev.surveys.map((s) => (s.id === id ? { ...s, open } : s)),
      });
    },
    [commit],
  );

  const publishNews = useCallback(
    (title: string, body: string) => {
      const prev = stateRef.current;
      if (!title.trim()) return;
      const item: NewsItem = {
        id: uid("n"),
        title: title.trim(),
        body: body.trim(),
        published: true,
        at: new Date().toISOString(),
        comments: [],
      };
      commit({
        ...prev,
        news: [item, ...prev.news],
        audit: pushAudit(prev, "news", item.title),
      });
    },
    [commit, pushAudit],
  );

  const commentNews = useCallback(
    (newsId: string, body: string) => {
      const prev = stateRef.current;
      if (!prev.currentUserId || !body.trim()) {
        return { ok: false as const, reason: "Пустой комментарий" };
      }
      commit({
        ...prev,
        news: prev.news.map((n) =>
          n.id === newsId
            ? {
                ...n,
                comments: [
                  ...n.comments,
                  {
                    id: uid("nc"),
                    personId: prev.currentUserId!,
                    body: body.trim(),
                    at: new Date().toISOString(),
                  },
                ],
              }
            : n,
        ),
      });
      return { ok: true as const };
    },
    [commit],
  );

  const moderateComment = useCallback(
    (newsId: string, commentId: string, hidden: boolean) => {
      const prev = stateRef.current;
      commit({
        ...prev,
        news: prev.news.map((n) =>
          n.id === newsId
            ? {
                ...n,
                comments: n.comments.map((c) =>
                  c.id === commentId ? { ...c, hidden } : c,
                ),
              }
            : n,
        ),
        audit: pushAudit(prev, "moderate", commentId),
      });
    },
    [commit, pushAudit],
  );

  const setBannerActive = useCallback(
    (id: string, active: boolean) => {
      const prev = stateRef.current;
      commit({
        ...prev,
        banners: prev.banners.map((b) => (b.id === id ? { ...b, active } : b)),
      });
    },
    [commit],
  );

  const markNotificationRead = useCallback(
    (id: string) => {
      const prev = stateRef.current;
      commit({
        ...prev,
        notifications: prev.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n,
        ),
      });
    },
    [commit],
  );

  const markAllNotificationsRead = useCallback(() => {
    const prev = stateRef.current;
    if (!prev.currentUserId) return;
    commit({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.personId === prev.currentUserId ? { ...n, read: true } : n,
      ),
    });
  }, [commit]);

  const resolveAnomaly = useCallback(
    (id: string, status: "ok" | "blocked") => {
      const prev = stateRef.current;
      const anomaly = prev.anomalies.find((a) => a.id === id);
      if (!anomaly) return;
      let people = prev.people;
      if (status === "blocked") {
        people = people.map((p) =>
          p.id === anomaly.personId ? { ...p, frozen: true } : p,
        );
      }
      commit({
        ...prev,
        people,
        anomalies: prev.anomalies.map((a) =>
          a.id === id ? { ...a, status } : a,
        ),
        audit: pushAudit(prev, "anomaly", `${id}: ${status}`),
      });
    },
    [commit, pushAudit],
  );

  const importPeopleCsv = useCallback(
    (text: string) => {
      const prev = stateRef.current;
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      if (!lines.length) return { ok: false as const, reason: "Пустой файл" };
      const start = lines[0].toLowerCase().includes("name") ? 1 : 0;
      const added: Person[] = [];
      for (let i = start; i < lines.length; i++) {
        const cols = lines[i].split(/[;,\t]/).map((c) => c.trim());
        const name = cols[0];
        if (!name) continue;
        const id = uid("imp");
        added.push({
          id,
          name,
          role: "employee",
          title: cols[1] || "Сотрудник",
          department: cols[2] || "Проекты",
          grade: (cols[3] as "A" | "B" | "C") || "B",
          years: Number(cols[4]) || 1,
          managerId: "dmitry",
          onboardingDone: true,
          needsQuizDone: true,
          flexibleSchedule: false,
          burnable: 5000,
          burnableUntil: "2027-10-01",
          durable: 500,
          frozen: false,
          email: cols[5] || `${id}@altair.demo`,
          segmentIds: ["seg-all"],
        });
      }
      if (!added.length) return { ok: false as const, reason: "Нет строк" };
      commit({
        ...prev,
        people: [...prev.people, ...added],
        audit: pushAudit(prev, "import", `Импорт ${added.length} сотрудников`),
      });
      return { ok: true as const, added: added.length };
    },
    [commit, pushAudit],
  );

  const suggestBenefit = useCallback(
    (title: string, body: string) => {
      const prev = stateRef.current;
      if (!prev.currentUserId || !title.trim()) return;
      const suggestion: BenefitSuggestion = {
        id: uid("sug"),
        personId: prev.currentUserId,
        title: title.trim(),
        body: body.trim(),
        at: new Date().toISOString(),
        status: "new",
      };
      commit({
        ...prev,
        suggestions: [suggestion, ...prev.suggestions],
        audit: pushAudit(prev, "suggest", suggestion.title),
      });
    },
    [commit, pushAudit],
  );

  const resendCode = useCallback(
    (orderId: string) => {
      const prev = stateRef.current;
      const order = prev.orders.find((o) => o.id === orderId);
      if (!order?.code) return { ok: false as const, reason: "Нет кода" };
      if (!prev.currentUserId) return { ok: false as const, reason: "Нет пользователя" };
      commit({
        ...prev,
        notifications: [
          {
            id: uid("nt"),
            personId: order.personId,
            title: "Повторная отправка кода",
            body: `Код по заказу «${order.title}»: ${order.code}`,
            at: new Date().toISOString(),
            read: false,
            href: "/app/orders",
          },
          ...prev.notifications,
        ],
        audit: pushAudit(prev, "resend_code", orderId),
      });
      return { ok: true as const };
    },
    [commit, pushAudit],
  );

  const addCodes = useCallback(
    (benefitId: string, codes: string[]) => {
      const prev = stateRef.current;
      const clean = codes.map((c) => c.trim()).filter(Boolean);
      if (!clean.length) return;
      commit({
        ...prev,
        benefits: prev.benefits.map((b) =>
          b.id === benefitId
            ? { ...b, codes: [...(b.codes ?? []), ...clean] }
            : b,
        ),
        audit: pushAudit(prev, "codes", `${benefitId}: +${clean.length}`),
      });
    },
    [commit, pushAudit],
  );

  const setRole = useCallback(
    (personId: string, role: Person["role"]) => {
      const prev = stateRef.current;
      const actor = prev.people.find((p) => p.id === prev.currentUserId);
      if (!actor || actor.role !== "admin") return;
      commit({
        ...prev,
        people: patchPeople(prev.people, personId, (p) => ({ ...p, role })),
        audit: pushAudit(prev, "role", `${personId} → ${role}`),
      });
    },
    [commit, pushAudit],
  );

  const setWindowDates = useCallback(
    (start: string, end: string) => {
      const prev = stateRef.current;
      const actor = prev.people.find((p) => p.id === prev.currentUserId);
      if (!actor || (actor.role !== "admin" && actor.role !== "hr")) {
        return { ok: false as const, reason: "Недостаточно прав" };
      }
      if (end < start) {
        return { ok: false as const, reason: "Дата окончания раньше начала" };
      }
      commit({
        ...prev,
        window: { ...prev.window, start, end },
        audit: pushAudit(prev, "window_dates", `${start} — ${end}`),
      });
      return { ok: true as const };
    },
    [commit, pushAudit],
  );

  const setWindowSegments = useCallback(
    (ids: string[]) => {
      const prev = stateRef.current;
      commit({
        ...prev,
        window: { ...prev.window, segmentIds: ids },
        audit: pushAudit(prev, "window_segments", ids.join(",")),
      });
    },
    [commit, pushAudit],
  );

  const setChangeMode = useCallback(
    (mode: "inform" | "restrict") => {
      const prev = stateRef.current;
      commit({
        ...prev,
        window: { ...prev.window, changeMode: mode },
        audit: pushAudit(prev, "window_mode", mode),
      });
    },
    [commit, pushAudit],
  );

  const accountingExport = useCallback(() => {
    const prev = stateRef.current;
    const header = [
      "ID заказа",
      "ФИО",
      "Группа",
      "Пол",
      "Дата рождения",
      "Город",
      "Телефон",
      "Лот",
      "Тип",
      "Статус",
      "Email",
      "Дата заказа",
      "Сумма",
      "Комментарий",
      "Адрес",
    ].join("\t");
    const rows = prev.orders.map((o) => {
      const person = prev.people.find((p) => p.id === o.personId);
      const benefit = prev.benefits.find((b) => b.id === o.benefitId);
      return [
        o.id,
        person?.name ?? "",
        person?.department ?? "",
        person?.gender ?? "",
        person?.birthDate ?? "",
        person?.city ?? "",
        person?.phone ?? "",
        o.title,
        benefit?.type ?? "",
        o.status,
        person?.email ?? "",
        o.createdAt,
        String(o.price * prev.settings.pointRubRate),
        o.note ?? "",
        o.meta?.address ?? "",
      ].join("\t");
    });
    return [header, ...rows].join("\n");
  }, []);

  const saveNeedsQuiz = useCallback(
    (answers: Record<string, string>) => {
      const prev = stateRef.current;
      if (!prev.currentUserId) return { ok: false as const, reason: "Нет пользователя" };
      const ids = recommendFromNeeds(answers, prev.benefits);
      commit({
        ...prev,
        people: patchPeople(prev.people, prev.currentUserId, (p) => ({
          ...p,
          needsQuizDone: true,
          needsAnswers: answers,
        })),
        packageIds: ids,
        audit: pushAudit(prev, "needs_quiz", JSON.stringify(answers)),
      });
      return { ok: true as const };
    },
    [commit, pushAudit],
  );

  const massBudgetPreview = useCallback(() => {
    return previewBudgetRecalc(stateRef.current.people);
  }, []);

  const applyMassBudget = useCallback(() => {
    const prev = stateRef.current;
    const actor = prev.people.find((p) => p.id === prev.currentUserId);
    if (!actor || (actor.role !== "hr" && actor.role !== "admin")) {
      return { ok: false as const, reason: "Недостаточно прав" };
    }
    const rows = previewBudgetRecalc(prev.people);
    if (!rows.length) return { ok: false as const, reason: "Нечего пересчитывать" };
    const map = new Map(rows.map((r) => [r.id, r.to]));
    commit({
      ...prev,
      people: prev.people.map((p) =>
        map.has(p.id) ? { ...p, burnable: map.get(p.id)!, burnableUntil: "2027-10-01" } : p,
      ),
      audit: pushAudit(prev, "mass_budget", `Пересчитано ${rows.length}`),
    });
    return { ok: true as const };
  }, [commit, pushAudit]);

  const upsertSegment = useCallback(
    (seg: Segment) => {
      const prev = stateRef.current;
      const exists = prev.segments.some((s) => s.id === seg.id);
      commit({
        ...prev,
        segments: exists
          ? prev.segments.map((s) => (s.id === seg.id ? seg : s))
          : [...prev.segments, seg],
        audit: pushAudit(prev, "segment", seg.title),
      });
    },
    [commit, pushAudit],
  );

  const setPersonSegments = useCallback(
    (personId: string, segmentIds: string[]) => {
      const prev = stateRef.current;
      commit({
        ...prev,
        people: patchPeople(prev.people, personId, (p) => ({ ...p, segmentIds })),
      });
    },
    [commit],
  );

  const setCategoryLimit = useCallback(
    (section: SectionId, patch: Partial<CategoryLimit>) => {
      const prev = stateRef.current;
      commit({
        ...prev,
        categoryLimits: prev.categoryLimits.map((c) =>
          c.section === section ? { ...c, ...patch } : c,
        ),
        audit: pushAudit(prev, "category_limit", section),
      });
    },
    [commit, pushAudit],
  );

  const createPromo = useCallback(
    (input: Omit<PromoCampaign, "id" | "spent" | "redemptions">) => {
      const prev = stateRef.current;
      commit({
        ...prev,
        promos: [
          { ...input, id: uid("promo"), spent: 0, redemptions: 0 },
          ...prev.promos,
        ],
        audit: pushAudit(prev, "promo", input.title),
      });
    },
    [commit, pushAudit],
  );

  const togglePromo = useCallback(
    (id: string) => {
      const prev = stateRef.current;
      commit({
        ...prev,
        promos: prev.promos.map((p) =>
          p.id === id ? { ...p, active: !p.active } : p,
        ),
      });
    },
    [commit],
  );

  const deleteBenefit = useCallback(
    (benefitId: string) => {
      const prev = stateRef.current;
      const active = prev.orders.some(
        (o) =>
          o.benefitId === benefitId &&
          (o.status === "processing" ||
            o.status === "awaiting_approval" ||
            o.status === "created"),
      );
      if (active) {
        return {
          ok: false as const,
          reason: "Нельзя удалить: есть активные заказы. Используйте архив.",
        };
      }
      commit({
        ...prev,
        benefits: prev.benefits.filter((b) => b.id !== benefitId),
        audit: pushAudit(prev, "delete_benefit", benefitId),
      });
      return { ok: true as const };
    },
    [commit, pushAudit],
  );

  const joinSocial = useCallback(
    (projectId: string) => {
      const prev = stateRef.current;
      if (!prev.settings.socialProjects) {
        return { ok: false as const, reason: "Соцпроекты выключены" };
      }
      const project = prev.socialProjects.find((p) => p.id === projectId && p.active);
      if (!project || !prev.currentUserId) {
        return { ok: false as const, reason: "Проект не найден" };
      }
      commit({
        ...prev,
        socialProjects: prev.socialProjects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                joinedIds: Array.from(
                  new Set([...(p.joinedIds ?? []), prev.currentUserId!]),
                ),
              }
            : p,
        ),
        notifications: [
          {
            id: uid("nt"),
            personId: prev.currentUserId,
            title: "Запись на соцпроект",
            body: project.title,
            at: new Date().toISOString(),
            read: false,
            href: "/app/social",
          },
          ...prev.notifications,
        ],
        audit: pushAudit(prev, "social", project.title),
      });
      return { ok: true as const };
    },
    [commit, pushAudit],
  );

  const confirmOtp = useCallback((code: string) => code === "4242", []);

  const replaceDms = useCallback(
    (benefitId: string) => {
      const prev = stateRef.current;
      const person = prev.people.find((p) => p.id === prev.currentUserId);
      const benefit = prev.benefits.find((b) => b.id === benefitId && b.type === "dms");
      if (!person || !benefit) return { ok: false as const, reason: "Нет программы" };
      if (person.exclusion) return { ok: false as const, reason: "Доступ ограничен" };
      const built = placeOrders(prev, person, [{ benefit }]);
      if ("error" in built) return { ok: false as const, reason: built.error };
      const nextPeople = patchPeople(built.next.people, person.id, (p) => ({
        ...p,
        dmsProgramId:
          benefit.id === "dms-base" ? "prog-std" : p.dmsProgramId ?? "prog-std",
        dmsStatus: "processing",
        dmsExpiresAt: "2027-09-30",
      }));
      commit({
        ...built.next,
        people: nextPeople,
        audit: pushAudit(prev, "dms_replace", benefit.title),
      });
      return { ok: true as const };
    },
    [placeOrders, commit, pushAudit],
  );

  const refuseBaseDms = useCallback(() => {
    const prev = stateRef.current;
    if (!prev.currentUserId) return { ok: false as const, reason: "Нет пользователя" };
    commit({
      ...prev,
      people: patchPeople(prev.people, prev.currentUserId, (p) => ({
        ...p,
        dmsProgramId: null,
        dmsStatus: "none",
        dmsExpiresAt: null,
      })),
      notifications: [
        {
          id: uid("nt"),
          personId: prev.currentUserId,
          title: "Отказ от базового ДМС",
          body: "Баллы остаются у вас — можно потратить на другие льготы.",
          at: new Date().toISOString(),
          read: false,
          href: "/app/catalog",
        },
        ...prev.notifications,
      ],
      audit: pushAudit(prev, "dms_refuse", prev.currentUserId),
    });
    return { ok: true as const };
  }, [commit, pushAudit]);

  const runEventGrant = useCallback(
    (eventId: string) => {
      const prev = stateRef.current;
      const actor = prev.people.find((p) => p.id === prev.currentUserId);
      const ev = prev.eventGrants.find((e) => e.id === eventId);
      if (!actor || (actor.role !== "hr" && actor.role !== "admin")) {
        return { ok: false as const, reason: "Недостаточно прав" };
      }
      if (!ev) return { ok: false as const, reason: "Событие не найдено" };
      let people = prev.people;
      let ledger = prev.ledger;
      let notifications = prev.notifications;
      const at = new Date().toISOString();
      const targets = people.filter((p) => {
        if (p.exclusion || p.role === "vip" || p.role === "decret") return false;
        if (ev.audience === "all") return true;
        if (ev.audience === "female") return p.gender === "f";
        if (ev.audience === "male") return p.gender === "m";
        if (ev.audience === "builders") {
          return /производ|строит|цех|мастер/i.test(
            `${p.department} ${p.title}`,
          );
        }
        return false;
      });
      for (const t of targets) {
        people = patchPeople(people, t.id, (p) =>
          ev.burnable
            ? { ...p, burnable: p.burnable + ev.amount, burnableUntil: p.burnableUntil ?? "2027-10-01" }
            : { ...p, durable: p.durable + ev.amount },
        );
        ledger = [
          {
            id: uid("led"),
            personId: t.id,
            kind: "grant",
            amount: ev.amount,
            burnableDelta: ev.burnable ? ev.amount : 0,
            durableDelta: ev.burnable ? 0 : ev.amount,
            comment: `Событие: ${ev.title}`,
            at,
            actorId: actor.id,
          },
          ...ledger,
        ];
        notifications = [
          {
            id: uid("nt"),
            personId: t.id,
            title: ev.title,
            body: `Начислено ${ev.amount} баллов`,
            at,
            read: false,
            href: "/app/wallet",
          },
          ...notifications,
        ];
      }
      commit({
        ...prev,
        people,
        ledger,
        notifications,
        eventGrants: prev.eventGrants.map((e) =>
          e.id === eventId ? { ...e, lastRunAt: at } : e,
        ),
        audit: pushAudit(prev, "event_grant", `${ev.title}: ${targets.length}`),
      });
      return { ok: true as const };
    },
    [commit, pushAudit],
  );

  const sendBurnNotices = useCallback(() => {
    const prev = stateRef.current;
    const at = new Date().toISOString();
    let notifications = prev.notifications;
    let people = prev.people;
    let sent = 0;
    for (const p of prev.people) {
      if (!p.burnable || !p.burnableUntil) continue;
      const days =
        (new Date(p.burnableUntil).getTime() - new Date("2026-10-01").getTime()) /
        86400000;
      if (days > 400) continue; // only near-term for demo: always send if <2 notices
      if ((p.burnNoticesSent ?? 0) >= 2) continue;
      notifications = [
        {
          id: uid("nt"),
          personId: p.id,
          title: "Скоро сгорят баллы",
          body: `Сгораемые ${p.burnable} баллов действуют до ${p.burnableUntil}. Это напоминание ${(p.burnNoticesSent ?? 0) + 1} из 2.`,
          at,
          read: false,
          href: "/app/wallet",
        },
        ...notifications,
      ];
      people = patchPeople(people, p.id, (x) => ({
        ...x,
        burnNoticesSent: (x.burnNoticesSent ?? 0) + 1,
      }));
      sent += 1;
    }
    commit({
      ...prev,
      people,
      notifications,
      audit: pushAudit(prev, "burn_notices", `Отправлено ${sent}`),
    });
    return { ok: true as const, sent };
  }, [commit, pushAudit]);

  const setExclusion = useCallback(
    (personId: string, exclusion: boolean) => {
      const prev = stateRef.current;
      commit({
        ...prev,
        people: patchPeople(prev.people, personId, (p) => ({ ...p, exclusion })),
        audit: pushAudit(prev, "exclusion", `${personId}: ${exclusion}`),
      });
    },
    [commit, pushAudit],
  );

  const setRoleMap = useCallback(
    (role: Person["role"], caps: import("./types").RoleCapability[]) => {
      const prev = stateRef.current;
      commit({
        ...prev,
        roleMap: { ...prev.roleMap, [role]: caps },
        audit: pushAudit(prev, "role_map", role),
      });
    },
    [commit, pushAudit],
  );

  const createCategory = useCallback(
    (section: SectionId, title: string) => {
      const prev = stateRef.current;
      if (!title.trim()) return;
      commit({
        ...prev,
        categories: [
          {
            id: uid("cat"),
            section,
            title: title.trim(),
          },
          ...prev.categories,
        ],
        audit: pushAudit(prev, "category", title.trim()),
      });
    },
    [commit, pushAudit],
  );

  const payoutExport = useCallback(() => {
    const prev = stateRef.current;
    const header = [
      "ID заказа",
      "ФИО",
      "Лот",
      "Сумма ₽",
      "Документ",
      "Статус",
      "Дата",
    ].join("\t");
    const rows = prev.orders
      .filter((o) => {
        const b = prev.benefits.find((x) => x.id === o.benefitId);
        return b?.type === "docs" && (o.status === "done" || o.status === "processing");
      })
      .map((o) => {
        const person = prev.people.find((p) => p.id === o.personId);
        return [
          o.id,
          person?.name ?? "",
          o.title,
          String(o.price * prev.settings.pointRubRate),
          o.meta?.docName ?? o.note ?? "",
          o.status,
          o.createdAt,
        ].join("\t");
      });
    return [header, ...rows].join("\n");
  }, []);

  const markDataGap = useCallback(() => {
    return "Ожидается синхронизация 1С:ЗУП (симуляция) — штат и грейды могут быть неполными.";
  }, []);

  const setDeliveryStatus = useCallback(
    (orderId: string, status: "print" | "shipped" | "delivered") => {
      const prev = stateRef.current;
      const actor = prev.people.find((p) => p.id === prev.currentUserId);
      const order = prev.orders.find((o) => o.id === orderId);
      if (!actor || (actor.role !== "hr" && actor.role !== "admin")) {
        return { ok: false as const, reason: "Только HR или админ" };
      }
      if (!order) return { ok: false as const, reason: "Заказ не найден" };
      commit({
        ...prev,
        orders: prev.orders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                deliveryStatus: status,
                status: status === "delivered" ? "done" : o.status,
              }
            : o,
        ),
        notifications: [
          {
            id: uid("nt"),
            personId: order.personId,
            title: "Доставка",
            body:
              status === "print"
                ? `«${order.title}»: заявка на печать.`
                : status === "shipped"
                  ? `«${order.title}» передан в доставку.`
                  : `«${order.title}» доставлен.`,
            at: new Date().toISOString(),
            read: false,
            href: "/app/orders",
          },
          ...prev.notifications,
        ],
        audit: pushAudit(prev, "delivery", `${order.title}: ${status}`),
      });
      return { ok: true as const };
    },
    [commit, pushAudit],
  );

  const compensateOrder = useCallback(
    (orderId: string, otp?: string) => {
      const prev = stateRef.current;
      const actor = prev.people.find((p) => p.id === prev.currentUserId);
      const order = prev.orders.find((o) => o.id === orderId);
      if (!actor || (actor.role !== "hr" && actor.role !== "admin")) {
        return { ok: false as const, reason: "Только HR или админ" };
      }
      if (!order) return { ok: false as const, reason: "Заказ не найден" };
      if (otp !== "4242") {
        return { ok: false as const, reason: "Нужен код 2FA (в демо: 4242)" };
      }
      if (order.status === "cancelled" || order.status === "rejected") {
        return { ok: false as const, reason: "Уже закрыт возвратом" };
      }
      const next = refundOrder(
        prev,
        order,
        actor.id,
        "cancelled",
        "cancel",
        `${actor.name} компенсировал ошибочную операцию «${order.title}»`,
      );
      if ("error" in next) return { ok: false as const, reason: next.error };
      commit({
        ...next,
        orders: next.orders.map((o) =>
          o.id === orderId
            ? { ...o, note: `${o.note ? `${o.note} · ` : ""}компенсация` }
            : o,
        ),
      });
      return { ok: true as const };
    },
    [commit, refundOrder],
  );

  const notifyWindow = useCallback(() => {
    const prev = stateRef.current;
    const at = new Date().toISOString();
    const body = prev.window.open
      ? `Окно выбора открыто: ${prev.window.start} — ${prev.window.end}.`
      : `Окно выбора закрыто (${prev.window.end}). Изменения — по заявке HR.`;
    const extra = prev.people
      .filter(
        (p) =>
          p.role === "employee" ||
          p.role === "decret" ||
          p.role === "manager" ||
          p.role === "vip",
      )
      .map((p) => ({
        id: uid("nt"),
        personId: p.id,
        title: prev.window.open ? "Старт окна выбора" : "Окно выбора закрыто",
        body,
        at,
        read: false,
        href: "/app",
      }));
    commit({
      ...prev,
      notifications: [...extra, ...prev.notifications],
      audit: pushAudit(prev, "window_notify", `${extra.length}`),
    });
    return { ok: true as const, sent: extra.length };
  }, [commit, pushAudit]);

  const updateEmailTemplate = useCallback(
    (id: string, body: string) => {
      const prev = stateRef.current;
      commit({
        ...prev,
        emailTemplates: prev.emailTemplates.map((t) =>
          t.id === id ? { ...t, body } : t,
        ),
        audit: pushAudit(prev, "email_template", id),
      });
    },
    [commit, pushAudit],
  );

  const dashboardExport = useCallback(() => {
    const prev = stateRef.current;
    const employees = prev.people.filter(
      (p) => p.role === "employee" || p.role === "decret" || p.role === "manager",
    );
    const header = ["Отдел", "Штат", "Остаток баллов", "Заказов"].join("\t");
    const byDept = new Map<string, { n: number; left: number; orders: number }>();
    for (const p of employees) {
      const cur = byDept.get(p.department) ?? { n: 0, left: 0, orders: 0 };
      cur.n += 1;
      cur.left += totalBalance(p);
      cur.orders += prev.orders.filter((o) => o.personId === p.id).length;
      byDept.set(p.department, cur);
    }
    const rows = Array.from(byDept.entries()).map(([dept, v]) =>
      [dept, String(v.n), String(v.left), String(v.orders)].join("\t"),
    );
    return [header, ...rows].join("\n");
  }, []);

  const api: StoreApi = {
    ready,
    state,
    me,
    login,
    logout,
    resetDemo,
    setPackageIds,
    confirmPackage,
    skipOnboarding,
    addToCart,
    removeFromCart,
    clearCart,
    checkoutCart,
    buyNow,
    decideLeave,
    cancelOrder,
    fulfillOrder,
    setFrozen,
    manualPoints,
    archiveBenefit,
    createBenefit,
    setWindowOpen,
    createTicket,
    createGuestTicket,
    reopenTicket,
    setSuggestionStatus,
    toggleFund,
    createFund,
    createLottery,
    pingIntegration,
    updateBenefit,
    resolveTicket,
    escalateTicket,
    toggleSetting,
    setSettingNumber,
    activateFlex,
    transfer,
    donate,
    poolContribute,
    createPool,
    lotteryBuy,
    lotteryDraw,
    surveyAnswer,
    createSurvey,
    setSurveyOpen,
    publishNews,
    commentNews,
    moderateComment,
    setBannerActive,
    markNotificationRead,
    markAllNotificationsRead,
    resolveAnomaly,
    importPeopleCsv,
    suggestBenefit,
    resendCode,
    addCodes,
    setRole,
    setWindowDates,
    setWindowSegments,
    setChangeMode,
    accountingExport,
    saveNeedsQuiz,
    massBudgetPreview,
    applyMassBudget,
    upsertSegment,
    setPersonSegments,
    setCategoryLimit,
    createPromo,
    togglePromo,
    deleteBenefit,
    joinSocial,
    confirmOtp,
    replaceDms,
    refuseBaseDms,
    runEventGrant,
    sendBurnNotices,
    setExclusion,
    setRoleMap,
    createCategory,
    payoutExport,
    markDataGap,
    setDeliveryStatus,
    compensateOrder,
    notifyWindow,
    updateEmailTemplate,
    dashboardExport,
  };

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore outside provider");
  return ctx;
}
