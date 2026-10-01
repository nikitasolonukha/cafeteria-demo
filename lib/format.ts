export function formatPoints(n: number): string {
  return new Intl.NumberFormat("ru-RU").format(n);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function ageFromBirth(iso: string, now = new Date()): number {
  const birth = new Date(iso);
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
}

export const sectionLabels: Record<string, string> = {
  health: "Здоровье",
  rest: "Отдых",
  growth: "Развитие",
  care: "Забота о семье",
  general: "Общие предложения",
};

export const roleLabels: Record<string, string> = {
  employee: "Сотрудник",
  decret: "Декрет",
  vip: "ВИП",
  manager: "Руководитель",
  hr: "HR",
  admin: "Администратор",
};

export const orderStatusLabels: Record<string, string> = {
  created: "создан",
  processing: "в обработке",
  awaiting_approval: "на согласовании",
  done: "выполнен",
  cancelled: "отменён",
  rejected: "отклонён",
};

export const deliveryStatusLabels: Record<string, string> = {
  print: "печать и сборка",
  shipped: "в доставке",
  delivered: "доставлено",
};

export const ledgerKindLabels: Record<string, string> = {
  grant: "начисление",
  spend: "списание",
  refund: "возврат",
  manual_grant: "ручное начисление",
  manual_spend: "ручное списание",
  transfer_out: "перевод исходящий",
  transfer_in: "перевод входящий",
  transfer_fee: "комиссия перевода",
  charity: "благотворительность",
  charity_match: "матчинг компании",
  pool: "командный сбор",
  lottery: "лотерея",
};

export const auditActionLabels: Record<string, string> = {
  seed: "сид",
  order: "заказ",
  onboarding: "онбординг",
  flex: "гибкий график",
  approve: "одобрение",
  reject: "отказ",
  cancel: "отмена",
  fulfill: "исполнение",
  freeze: "заморозка",
  unfreeze: "разморозка",
  manual_grant: "начисление",
  manual_spend: "списание",
  archive: "архив",
  restore: "из архива",
  create_benefit: "новая позиция",
  window_open: "окно открыто",
  window_close: "окно закрыто",
  window_dates: "даты окна",
  window_mode: "режим окна",
  ticket: "обращение",
  ticket_done: "обращение закрыто",
  ticket_escalated: "эскалация",
  settings: "настройки",
  transfer: "перевод",
  charity: "благотворительность",
  pool: "сбор",
  pool_create: "новый сбор",
  lottery_ticket: "билет лотереи",
  lottery_draw: "розыгрыш",
  survey: "опрос",
  survey_create: "новый опрос",
  news: "новость",
  moderate: "модерация",
  anomaly: "аномалия",
  import: "импорт",
  suggest: "предложение льготы",
  resend_code: "повтор кода",
  codes: "коды",
  role: "роль",
};

export function orderStatusClass(status: string): string {
  switch (status) {
    case "done":
      return "text-pine";
    case "awaiting_approval":
    case "processing":
    case "created":
      return "text-ink";
    case "cancelled":
    case "rejected":
      return "text-danger";
    default:
      return "text-muted";
  }
}
