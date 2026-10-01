import { spendPoints, totalBalance } from "./rules";
import type {
  Anomaly,
  AppNotification,
  CharityDonation,
  DemoState,
  LedgerEntry,
  Person,
  TransferRecord,
} from "./types";

export function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function patchPeople(
  people: Person[],
  id: string,
  updater: (p: Person) => Person,
): Person[] {
  return people.map((p) => (p.id === id ? updater(p) : p));
}

function audit(
  prev: DemoState,
  action: string,
  detail: string,
): DemoState["audit"] {
  return [
    {
      id: uid("aud"),
      at: new Date().toISOString(),
      actorId: prev.currentUserId ?? "system",
      action,
      detail,
    },
    ...prev.audit,
  ];
}

function notify(
  prev: DemoState,
  personId: string,
  title: string,
  body: string,
  href?: string,
): AppNotification[] {
  return [
    {
      id: uid("nt"),
      personId,
      title,
      body,
      at: new Date().toISOString(),
      read: false,
      href,
    },
    ...prev.notifications,
  ];
}

function maybeAnomaly(
  prev: DemoState,
  personId: string,
  amount: number,
  detail: string,
): Anomaly[] {
  if (amount < prev.settings.anomalyLargeSpend) return prev.anomalies;
  return [
    {
      id: uid("an"),
      at: new Date().toISOString(),
      personId,
      rule: "Крупная операция",
      detail,
      status: "open",
    },
    ...prev.anomalies,
  ];
}

export function transferPoints(
  prev: DemoState,
  toId: string,
  amount: number,
  comment: string,
): { ok: true; next: DemoState } | { ok: false; reason: string } {
  if (!prev.settings.transfers) return { ok: false, reason: "Переводы выключены" };
  const from = prev.people.find((p) => p.id === prev.currentUserId);
  const to = prev.people.find((p) => p.id === toId);
  if (!from || !to) return { ok: false, reason: "Сотрудник не найден" };
  if (from.id === to.id) return { ok: false, reason: "Нельзя перевести себе" };
  if (from.frozen) return { ok: false, reason: "Баллы заморожены" };
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, reason: "Укажите сумму" };
  }
  if (amount < prev.settings.transferMin) {
    return {
      ok: false,
      reason: `Минимум перевода — ${prev.settings.transferMin} баллов`,
    };
  }
  const fee = Math.ceil(amount * prev.settings.transferCommission);
  const total = amount + fee;
  if (totalBalance(from) < total) {
    return { ok: false, reason: `Нужно ${total} баллов (сумма + комиссия ${fee})` };
  }

  const out = spendPoints(from, total);
  const transfer: TransferRecord = {
    id: uid("tr"),
    fromId: from.id,
    toId: to.id,
    amount,
    fee,
    at: new Date().toISOString(),
    comment: comment.trim() || "Перевод баллов",
  };

  const ledger: LedgerEntry[] = [
    {
      id: uid("led"),
      personId: from.id,
      kind: "transfer_out",
      amount,
      burnableDelta: out.burnableDelta + (fee > 0 ? 0 : 0),
      durableDelta: out.durableDelta,
      comment: `Перевод → ${to.name}: ${amount}`,
      at: transfer.at,
      actorId: from.id,
    },
    {
      id: uid("led"),
      personId: from.id,
      kind: "transfer_fee",
      amount: fee,
      burnableDelta: 0,
      durableDelta: 0,
      comment: `Комиссия перевода ${Math.round(prev.settings.transferCommission * 100)}%`,
      at: transfer.at,
      actorId: from.id,
    },
    {
      id: uid("led"),
      personId: to.id,
      kind: "transfer_in",
      amount,
      burnableDelta: 0,
      durableDelta: amount,
      comment: `Перевод от ${from.name}`,
      at: transfer.at,
      actorId: from.id,
    },
  ];

  // Fix ledger deltas: spendPoints already applied total to from
  ledger[0] = {
    ...ledger[0],
    burnableDelta: out.burnableDelta,
    durableDelta: out.durableDelta,
    amount: total,
    comment: `Перевод → ${to.name}: ${amount} + комиссия ${fee}`,
    kind: "transfer_out",
  };
  // Remove separate fee ledger to avoid double-count display; keep one line
  const ledgerClean = [ledger[0], ledger[2]];

  let next: DemoState = {
    ...prev,
    people: patchPeople(
      patchPeople(prev.people, from.id, (p) => ({
        ...p,
        burnable: out.burnable,
        durable: out.durable,
      })),
      to.id,
      (p) => ({ ...p, durable: p.durable + amount }),
    ),
    transfers: [transfer, ...prev.transfers],
    ledger: [...ledgerClean, ...prev.ledger],
    notifications: notify(
      prev,
      to.id,
      "Вам перевели баллы",
      `${from.name}: +${amount} несгораемых`,
      "/app/wallet",
    ),
    audit: audit(prev, "transfer", `${from.name} → ${to.name}: ${amount} (комиссия ${fee})`),
    anomalies: maybeAnomaly(
      prev,
      from.id,
      total,
      `Перевод ${amount} + комиссия ${fee} → ${to.name}`,
    ),
  };
  return { ok: true, next };
}

export function donateCharity(
  prev: DemoState,
  fundId: string,
  amount: number,
): { ok: true; next: DemoState } | { ok: false; reason: string } {
  if (!prev.settings.charity) {
    return { ok: false, reason: "Благотворительность выключена" };
  }
  const person = prev.people.find((p) => p.id === prev.currentUserId);
  const fund = prev.funds.find((f) => f.id === fundId && f.active);
  if (!person || !fund) return { ok: false, reason: "Фонд не найден" };
  if (person.frozen) return { ok: false, reason: "Баллы заморожены" };
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, reason: "Укажите сумму" };
  }
  if (amount < prev.settings.transferMin) {
    return {
      ok: false,
      reason: `Минимум — ${prev.settings.transferMin} баллов`,
    };
  }
  if (totalBalance(person) < amount) {
    return { ok: false, reason: "Недостаточно баллов" };
  }

  const spent = spendPoints(person, amount);
  const matchAmount = Math.round(amount * prev.settings.charityMatch);
  const donation: CharityDonation = {
    id: uid("don"),
    personId: person.id,
    fundId,
    amount,
    matchAmount,
    certificateCode: `CH-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    at: new Date().toISOString(),
  };

  const ledger: LedgerEntry[] = [
    {
      id: uid("led"),
      personId: person.id,
      kind: "charity",
      amount,
      burnableDelta: spent.burnableDelta,
      durableDelta: spent.durableDelta,
      comment: `${fund.title}: взнос`,
      at: donation.at,
      actorId: person.id,
    },
  ];
  if (matchAmount > 0) {
    ledger.push({
      id: uid("led"),
      personId: person.id,
      kind: "charity_match",
      amount: matchAmount,
      burnableDelta: 0,
      durableDelta: 0,
      comment: `${fund.title}: матчинг компании ×${prev.settings.charityMatch}`,
      at: donation.at,
      actorId: "system",
    });
  }

  const next: DemoState = {
    ...prev,
    people: patchPeople(prev.people, person.id, (p) => ({
      ...p,
      burnable: spent.burnable,
      durable: spent.durable,
    })),
    donations: [donation, ...prev.donations],
    ledger: [...ledger, ...prev.ledger],
    notifications: notify(
      prev,
      person.id,
      "Сертификат участника",
      `Код ${donation.certificateCode}. Матчинг компании: ${matchAmount} баллов.`,
      "/app/charity",
    ),
    audit: audit(
      prev,
      "charity",
      `${person.name}: ${amount} → ${fund.title} (матч ${matchAmount})`,
    ),
  };
  return { ok: true, next };
}

export function contributePool(
  prev: DemoState,
  poolId: string,
  amount: number,
): { ok: true; next: DemoState } | { ok: false; reason: string } {
  if (!prev.settings.teamPools) {
    return { ok: false, reason: "Командные сборы выключены" };
  }
  const person = prev.people.find((p) => p.id === prev.currentUserId);
  const pool = prev.pools.find((p) => p.id === poolId);
  if (!person || !pool) return { ok: false, reason: "Сбор не найден" };
  if (!pool.open) return { ok: false, reason: "Сбор закрыт" };
  if (person.frozen) return { ok: false, reason: "Баллы заморожены" };
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, reason: "Укажите сумму" };
  }
  if (totalBalance(person) < amount) {
    return { ok: false, reason: "Недостаточно баллов" };
  }

  const spent = spendPoints(person, amount);
  const at = new Date().toISOString();
  const next: DemoState = {
    ...prev,
    people: patchPeople(prev.people, person.id, (p) => ({
      ...p,
      burnable: spent.burnable,
      durable: spent.durable,
    })),
    pools: prev.pools.map((p) =>
      p.id === poolId
        ? {
            ...p,
            contributions: [
              ...p.contributions,
              { personId: person.id, amount, at },
            ],
          }
        : p,
    ),
    ledger: [
      {
        id: uid("led"),
        personId: person.id,
        kind: "pool",
        amount,
        burnableDelta: spent.burnableDelta,
        durableDelta: spent.durableDelta,
        comment: `Взнос: ${pool.title}`,
        at,
        actorId: person.id,
      },
      ...prev.ledger,
    ],
    audit: audit(prev, "pool", `${person.name}: ${amount} → ${pool.title}`),
  };
  return { ok: true, next };
}

export function buyLotteryTicket(
  prev: DemoState,
  lotteryId: string,
): { ok: true; next: DemoState } | { ok: false; reason: string } {
  if (!prev.settings.lottery) return { ok: false, reason: "Лотерея выключена" };
  const person = prev.people.find((p) => p.id === prev.currentUserId);
  const lot = prev.lotteries.find((l) => l.id === lotteryId);
  if (!person || !lot) return { ok: false, reason: "Лотерея не найдена" };
  if (!lot.open || lot.drawn) return { ok: false, reason: "Розыгрыш закрыт" };
  if (person.frozen) return { ok: false, reason: "Баллы заморожены" };
  if (totalBalance(person) < lot.ticketPrice) {
    return { ok: false, reason: "Недостаточно баллов" };
  }

  const spent = spendPoints(person, lot.ticketPrice);
  const at = new Date().toISOString();
  const ticket = { id: uid("lt"), personId: person.id, at };
  const next: DemoState = {
    ...prev,
    people: patchPeople(prev.people, person.id, (p) => ({
      ...p,
      burnable: spent.burnable,
      durable: spent.durable,
    })),
    lotteries: prev.lotteries.map((l) =>
      l.id === lotteryId ? { ...l, tickets: [...l.tickets, ticket] } : l,
    ),
    ledger: [
      {
        id: uid("led"),
        personId: person.id,
        kind: "lottery",
        amount: lot.ticketPrice,
        burnableDelta: spent.burnableDelta,
        durableDelta: spent.durableDelta,
        comment: `Билет: ${lot.title}`,
        at,
        actorId: person.id,
      },
      ...prev.ledger,
    ],
    audit: audit(prev, "lottery_ticket", `${person.name}: ${lot.title}`),
  };
  return { ok: true, next };
}

export function drawLottery(
  prev: DemoState,
  lotteryId: string,
): { ok: true; next: DemoState } | { ok: false; reason: string } {
  const actor = prev.people.find((p) => p.id === prev.currentUserId);
  if (!actor || (actor.role !== "admin" && actor.role !== "hr")) {
    return { ok: false, reason: "Недостаточно прав" };
  }
  const lot = prev.lotteries.find((l) => l.id === lotteryId);
  if (!lot) return { ok: false, reason: "Лотерея не найдена" };
  if (lot.drawn) return { ok: false, reason: "Уже разыграно" };
  if (!lot.tickets.length) return { ok: false, reason: "Нет билетов" };

  const shuffled = [...lot.tickets].sort(() => Math.random() - 0.5);
  const winners = lot.prizes.map((prize, i) => {
    const ticket = shuffled[i % shuffled.length];
    return { prizeId: prize.id, personId: ticket.personId, ticketId: ticket.id };
  });

  let people = prev.people;
  let ledger = prev.ledger;
  let notifications = prev.notifications;
  const at = new Date().toISOString();

  for (const w of winners) {
    const prize = lot.prizes.find((p) => p.id === w.prizeId)!;
    people = patchPeople(people, w.personId, (p) => ({
      ...p,
      durable: p.durable + prize.points,
    }));
    ledger = [
      {
        id: uid("led"),
        personId: w.personId,
        kind: "grant",
        amount: prize.points,
        burnableDelta: 0,
        durableDelta: prize.points,
        comment: `Приз лотереи: ${prize.title}`,
        at,
        actorId: actor.id,
      },
      ...ledger,
    ];
    notifications = [
      {
        id: uid("nt"),
        personId: w.personId,
        title: "Вы выиграли в лотерее",
        body: prize.title,
        at,
        read: false,
        href: "/app/lottery",
      },
      ...notifications,
    ];
  }

  const next: DemoState = {
    ...prev,
    people,
    ledger,
    notifications,
    lotteries: prev.lotteries.map((l) =>
      l.id === lotteryId
        ? { ...l, drawn: true, open: false, winners }
        : l,
    ),
    audit: audit(prev, "lottery_draw", lot.title),
  };
  return { ok: true, next };
}

export function submitSurvey(
  prev: DemoState,
  surveyId: string,
  answers: Record<string, string>,
): { ok: true; next: DemoState } | { ok: false; reason: string } {
  if (!prev.settings.surveys) return { ok: false, reason: "Опросы выключены" };
  const personId = prev.currentUserId;
  if (!personId) return { ok: false, reason: "Нет пользователя" };
  const survey = prev.surveys.find((s) => s.id === surveyId);
  if (!survey || !survey.open) return { ok: false, reason: "Опрос закрыт" };
  if (survey.responses.some((r) => r.personId === personId)) {
    return { ok: false, reason: "Вы уже прошли опрос" };
  }
  for (const q of survey.questions) {
    if (!answers[q.id]) return { ok: false, reason: "Ответьте на все вопросы" };
  }

  const next: DemoState = {
    ...prev,
    surveys: prev.surveys.map((s) =>
      s.id === surveyId
        ? {
            ...s,
            responses: [
              ...s.responses,
              {
                id: uid("resp"),
                personId,
                at: new Date().toISOString(),
                answers,
              },
            ],
          }
        : s,
    ),
    audit: audit(prev, "survey", `${personId}: ${survey.title}`),
  };
  return { ok: true, next };
}
