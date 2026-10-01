export type Role = "employee" | "decret" | "vip" | "manager" | "hr" | "admin";

export type SectionId = "health" | "rest" | "growth" | "care" | "general";

export type BenefitType =
  | "certificate"
  | "leave"
  | "dms"
  | "digital"
  | "physical"
  | "family"
  | "non_financial"
  | "booking"
  | "docs";

export type OrderStatus =
  | "created"
  | "processing"
  | "awaiting_approval"
  | "done"
  | "cancelled"
  | "rejected";

export type LedgerKind =
  | "grant"
  | "spend"
  | "refund"
  | "manual_grant"
  | "manual_spend"
  | "transfer_out"
  | "transfer_in"
  | "transfer_fee"
  | "charity"
  | "charity_match"
  | "pool"
  | "lottery";

export type Person = {
  id: string;
  name: string;
  role: Role;
  title: string;
  department: string;
  grade: "A" | "B" | "C" | null;
  years: number;
  managerId: string | null;
  onboardingDone: boolean;
  needsQuizDone: boolean;
  flexibleSchedule: boolean;
  burnable: number;
  burnableUntil: string | null;
  durable: number;
  frozen: boolean;
  city?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  gender?: "m" | "f";
  segmentIds?: string[];
  exclusion?: boolean;
  needsAnswers?: Record<string, string>;
  badgeIds?: string[];
  dmsProgramId?: string | null;
  dmsStatus?: "none" | "active" | "processing" | "expired";
  dmsExpiresAt?: string | null;
  burnNoticesSent?: number;
};

export type BenefitAttachment = {
  id: string;
  title: string;
  kind: "pdf" | "image";
  /** Демо: плейсхолдер, не реальный файл */
  href: string;
};

export type CatalogCategory = {
  id: string;
  section: SectionId;
  title: string;
};

export type Benefit = {
  id: string;
  title: string;
  description: string;
  section: SectionId;
  categoryId?: string;
  type: BenefitType;
  price: number;
  supplier: string;
  archived: boolean;
  conditions: string;
  packageGrade?: ("A" | "B" | "C")[];
  codes?: string[];
  usedCodes?: string[];
  codeExpiresAt?: string;
  limitPerPeriod?: number;
  seatsLeft?: number;
  maxSum?: number;
  attachments?: BenefitAttachment[];
  imageLabel?: string;
};

export type CartItem = {
  benefitId: string;
  qty: number;
  meta?: Record<string, string>;
};

export type Order = {
  id: string;
  personId: string;
  benefitId: string;
  title: string;
  price: number;
  status: OrderStatus;
  createdAt: string;
  code?: string;
  note?: string;
  approverId?: string;
  meta?: Record<string, string>;
  deliveryStatus?: "print" | "shipped" | "delivered";
};

export type LedgerEntry = {
  id: string;
  personId: string;
  kind: LedgerKind;
  amount: number;
  burnableDelta: number;
  durableDelta: number;
  comment: string;
  at: string;
  actorId: string;
};

export type Ticket = {
  id: string;
  personId: string;
  topic: string;
  body: string;
  status: "open" | "done" | "escalated";
  createdAt: string;
  slaHours?: number;
  attachments?: string[];
};

export type AuditEntry = {
  id: string;
  at: string;
  actorId: string;
  action: string;
  detail: string;
};

export type NewsComment = {
  id: string;
  personId: string;
  body: string;
  at: string;
  hidden?: boolean;
};

export type NewsItem = {
  id: string;
  title: string;
  body: string;
  published: boolean;
  at: string;
  comments: NewsComment[];
};

export type Banner = {
  id: string;
  title: string;
  body: string;
  href: string;
  active: boolean;
};

export type PlatformSettings = {
  lottery: boolean;
  transfers: boolean;
  charity: boolean;
  teamPools: boolean;
  surveys: boolean;
  news: boolean;
  socialProjects: boolean;
  startPackage: boolean;
  gamification: boolean;
  tour: boolean;
  balanceWheel: boolean;
  transferCommission: number;
  transferMin: number;
  charityMatch: number;
  pointRubRate: number;
  codeStockThreshold: number;
  anomalyLargeSpend: number;
  supportSlaHours: number;
  burnDefaultMonths: number;
  passwordMinLength: number;
  maxManualGrant: number;
};

export type SelectionWindow = {
  title: string;
  start: string;
  end: string;
  open: boolean;
  changeMode: "inform" | "restrict";
  segmentIds?: string[];
};

export type TransferRecord = {
  id: string;
  fromId: string;
  toId: string;
  amount: number;
  fee: number;
  at: string;
  comment: string;
};

export type CharityFund = {
  id: string;
  title: string;
  description: string;
  active: boolean;
};

export type CharityDonation = {
  id: string;
  personId: string;
  fundId: string;
  amount: number;
  matchAmount: number;
  certificateCode: string;
  at: string;
};

export type TeamPool = {
  id: string;
  title: string;
  description: string;
  goal: number;
  ownerId: string;
  open: boolean;
  contributions: { personId: string; amount: number; at: string }[];
};

export type LotteryPrize = {
  id: string;
  title: string;
  points: number;
};

export type Lottery = {
  id: string;
  title: string;
  description: string;
  ticketPrice: number;
  open: boolean;
  drawn: boolean;
  prizes: LotteryPrize[];
  tickets: { id: string; personId: string; at: string }[];
  winners: { prizeId: string; personId: string; ticketId: string }[];
};

export type SurveyQuestion = {
  id: string;
  text: string;
  options: string[];
};

export type Survey = {
  id: string;
  title: string;
  description: string;
  open: boolean;
  questions: SurveyQuestion[];
  responses: {
    id: string;
    personId: string;
    at: string;
    answers: Record<string, string>;
  }[];
};

export type AppNotification = {
  id: string;
  personId: string;
  title: string;
  body: string;
  at: string;
  read: boolean;
  href?: string;
};

export type Anomaly = {
  id: string;
  at: string;
  personId: string;
  rule: string;
  detail: string;
  status: "open" | "ok" | "blocked";
};

export type Segment = {
  id: string;
  title: string;
  sectionAllow: SectionId[] | "all";
};

export type BenefitSuggestion = {
  id: string;
  personId: string;
  title: string;
  body: string;
  at: string;
  status: "new" | "seen";
};

export type PromoCampaign = {
  id: string;
  title: string;
  section: SectionId | "all";
  cashbackPct: number;
  budgetLeft: number;
  start: string;
  end: string;
  active: boolean;
  spent: number;
  redemptions: number;
};

export type BadgeDef = {
  id: string;
  title: string;
  description: string;
  rule: "first_order" | "charity" | "survey" | "lottery" | "transfer" | "pool";
};

export type CategoryLimit = {
  section: SectionId;
  maxPerYear: number;
  enabled: boolean;
};

export type DmsClinic = {
  id: string;
  title: string;
  address: string;
  profile: string;
};

export type DmsInfo = {
  insurer: string;
  included: string[];
  excluded: string[];
  clinics: DmsClinic[];
  programs: {
    id: string;
    title: string;
    benefitId: string;
    note: string;
  }[];
};

export type EventGrant = {
  id: string;
  title: string;
  amount: number;
  burnable: boolean;
  audience: "all" | "male" | "female" | "builders";
  runAt: string | null;
  lastRunAt: string | null;
};

export type RoleCapability =
  | "storefront"
  | "console"
  | "catalog_edit"
  | "budgets"
  | "audit"
  | "settings"
  | "approvals";

export type RoleMap = Record<Role, RoleCapability[]>;

export type DemoState = {
  version: 4;
  currentUserId: string | null;
  people: Person[];
  benefits: Benefit[];
  categories: CatalogCategory[];
  cart: CartItem[];
  packageIds: string[];
  orders: Order[];
  ledger: LedgerEntry[];
  tickets: Ticket[];
  audit: AuditEntry[];
  news: NewsItem[];
  banners: Banner[];
  window: SelectionWindow;
  settings: PlatformSettings;
  transfers: TransferRecord[];
  funds: CharityFund[];
  donations: CharityDonation[];
  pools: TeamPool[];
  lotteries: Lottery[];
  surveys: Survey[];
  notifications: AppNotification[];
  anomalies: Anomaly[];
  segments: Segment[];
  suggestions: BenefitSuggestion[];
  promos: PromoCampaign[];
  badges: BadgeDef[];
  categoryLimits: CategoryLimit[];
  socialProjects: {
    id: string;
    title: string;
    body: string;
    active: boolean;
    joinedIds?: string[];
  }[];
  dms: DmsInfo;
  eventGrants: EventGrant[];
  roleMap: RoleMap;
  emailTemplates: { id: string; title: string; body: string }[];
  integrations: {
    id: string;
    title: string;
    status: "ok" | "warn" | "down";
    detail: string;
    lastCheckAt?: string;
  }[];
};
