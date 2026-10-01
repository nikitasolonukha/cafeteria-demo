from pathlib import Path

p = Path(r"C:\Users\Никита\OneDrive\Рабочий стол\ТЕСТ кафетерий\lib\seed.ts")
t = p.read_text(encoding="utf-8")
t = t.replace("version: 2,", "version: 3,")
t = t.replace(
    'export const STORAGE_KEY = "cafeteria-demo-v2";',
    'export const STORAGE_KEY = "cafeteria-demo-v3";',
)
t = t.replace("gamification: false,", "gamification: true,")
t = t.replace(
    """        onboardingDone: false,
        flexibleSchedule: false,
        burnable: 5000,""",
    """        onboardingDone: false,
        needsQuizDone: false,
        flexibleSchedule: false,
        burnable: 5000,""",
    1,
)
t = t.replace(
    "onboardingDone: true,\n        flexibleSchedule:",
    "onboardingDone: true,\n        needsQuizDone: true,\n        flexibleSchedule:",
)
t = t.replace(
    """      onboardingDone: true,
      flexibleSchedule: i % 5 === 0,""",
    """      onboardingDone: true,
      needsQuizDone: true,
      flexibleSchedule: i % 5 === 0,""",
)
needle = "    suggestions: [],\n    integrations:"
insert = """    suggestions: [],
    promos: [
      {
        id: "promo-1",
        title: "Кэшбэк на развитие",
        section: "growth",
        cashbackPct: 10,
        budgetLeft: 50000,
        start: "2026-10-01",
        end: "2026-10-31",
        active: true,
        spent: 0,
        redemptions: 0,
      },
      {
        id: "promo-2",
        title: "Осенний кэшбэк на отдых",
        section: "rest",
        cashbackPct: 5,
        budgetLeft: 30000,
        start: "2026-10-01",
        end: "2026-10-31",
        active: true,
        spent: 1500,
        redemptions: 1,
      },
    ],
    badges: [
      { id: "bdg-order", title: "Первая льгота", description: "Оформили первый заказ", rule: "first_order" },
      { id: "bdg-charity", title: "Доброе дело", description: "Взнос в фонд", rule: "charity" },
      { id: "bdg-survey", title: "Голос команды", description: "Прошли опрос", rule: "survey" },
      { id: "bdg-lottery", title: "Участник розыгрыша", description: "Купили билет лотереи", rule: "lottery" },
      { id: "bdg-transfer", title: "Щедрая рука", description: "Перевели баллы коллеге", rule: "transfer" },
      { id: "bdg-pool", title: "Командный игрок", description: "Взнос в сбор", rule: "pool" },
    ],
    categoryLimits: [
      { section: "health", maxPerYear: 0, enabled: false },
      { section: "rest", maxPerYear: 5000, enabled: false },
      { section: "growth", maxPerYear: 4000, enabled: false },
      { section: "care", maxPerYear: 0, enabled: false },
      { section: "general", maxPerYear: 0, enabled: false },
    ],
    socialProjects: [
      {
        id: "sp-1",
        title: "Субботник на Чусовой",
        body: "Запись волонтёров на октябрь. Баллы не списываются — социальная инициатива.",
        active: true,
      },
      {
        id: "sp-2",
        title: "Донорский день",
        body: "Корпоративный донорский выезд 20 октября.",
        active: true,
      },
    ],
    integrations:"""
if needle not in t:
    raise SystemExit("needle missing")
t = t.replace(needle, insert)
# also update audit detail
t = t.replace("(v2, полный скоуп)", "(v3, полный скоуп)")
p.write_text(t, encoding="utf-8")
print("ok", t.count("needsQuizDone"), "version3", "version: 3" in t)
