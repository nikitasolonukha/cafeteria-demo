"""Patch seed.ts → v4 with categories, DMS, events, roleMap, attachments."""
from pathlib import Path
import re

p = Path(r"C:\Users\Никита\OneDrive\Рабочий стол\ТЕСТ кафетерий\lib\seed.ts")
t = p.read_text(encoding="utf-8")
t = t.replace("version: 3,", "version: 4,")
t = t.replace(
    'export const STORAGE_KEY = "cafeteria-demo-v3";',
    'export const STORAGE_KEY = "cafeteria-demo-v4";',
)
t = t.replace("(v3, полный скоуп)", "(v4, полный скоуп)")

# Add dms fields after needsQuizDone for maria
if "dmsProgramId" not in t:
    t = t.replace(
        "needsQuizDone: false,\n        flexibleSchedule: false,\n        burnable: 5000,",
        "needsQuizDone: false,\n        flexibleSchedule: false,\n        dmsProgramId: null,\n        dmsStatus: \"none\",\n        dmsExpiresAt: null,\n        burnNoticesSent: 0,\n        burnable: 5000,",
    )
    t = re.sub(
        r"needsQuizDone: true,\n(\s+)flexibleSchedule:",
        r'needsQuizDone: true,\n\1dmsProgramId: null,\n\1dmsStatus: "none",\n\1dmsExpiresAt: null,\n\1burnNoticesSent: 0,\n\1flexibleSchedule:',
        t,
    )
    # extraPeople
    t = t.replace(
        "needsQuizDone: true,\n      flexibleSchedule: i % 5 === 0,",
        'needsQuizDone: true,\n      dmsProgramId: null,\n      dmsStatus: "none" as const,\n      dmsExpiresAt: null,\n      burnNoticesSent: 0,\n      flexibleSchedule: i % 5 === 0,',
    )

# categoryId on benefits — map by id after benefits array via finalize block
finalize = r'''
    // enriched below
'''

# Insert before "integrations:" the new blocks if missing
if "categories:" not in t:
    needle = "    socialProjects: ["
    # find end of socialProjects and integrations - insert before integrations
    insert_before = "    integrations:"
    block = '''    categories: [
      { id: "cat-dms", section: "health", title: "Страхование" },
      { id: "cat-well", section: "health", title: "Wellbeing" },
      { id: "cat-hotel", section: "rest", title: "Проживание" },
      { id: "cat-tour", section: "rest", title: "Туризм" },
      { id: "cat-learn", section: "growth", title: "Обучение" },
      { id: "cat-cert", section: "growth", title: "Сертификация" },
      { id: "cat-kids", section: "care", title: "Дети" },
      { id: "cat-merch", section: "general", title: "Мерч" },
      { id: "cat-sport", section: "general", title: "Спорт" },
      { id: "cat-time", section: "general", title: "Время" },
    ],
    dms: {
      insurer: "СК «Рельеф»",
      included: [
        "Поликлиника и терапия",
        "Экстренная госпитализация",
        "Телемедицина 24/7",
        "Анализы по направлению",
      ],
      excluded: [
        "Эстетическая стоматология",
        "Санаторно-курортное лечение",
        "Плановая косметология",
      ],
      clinics: [
        {
          id: "cl1",
          title: "Клиника «Север»",
          address: "Екатеринбург, ул. Малышева, 36",
          profile: "терапия, диагностика",
        },
        {
          id: "cl2",
          title: "МЦ «УралМед»",
          address: "Екатеринбург, пр. Ленина, 48",
          profile: "стационар, экстренная помощь",
        },
        {
          id: "cl3",
          title: "Семейный центр «Олива»",
          address: "Челябинск, ул. Кирова, 12",
          profile: "педиатрия, семейная медицина",
        },
      ],
      programs: [
        {
          id: "prog-std",
          title: "ДМС «Стандарт»",
          benefitId: "dms-base",
          note: "Базовая программа сотрудника",
        },
        {
          id: "prog-family",
          title: "ДМС для члена семьи",
          benefitId: "dms-family",
          note: "Доплата баллами, возраст до 65",
        },
      ],
    },
    eventGrants: [
      {
        id: "ev-builder",
        title: "День строителя",
        amount: 500,
        burnable: true,
        audience: "builders",
        runAt: "2026-08-09",
        lastRunAt: null,
      },
      {
        id: "ev-ny",
        title: "Новый год",
        amount: 1000,
        burnable: true,
        audience: "all",
        runAt: "2026-12-25",
        lastRunAt: null,
      },
      {
        id: "ev-women",
        title: "8 марта",
        amount: 300,
        burnable: false,
        audience: "female",
        runAt: "2026-03-08",
        lastRunAt: null,
      },
      {
        id: "ev-men",
        title: "23 февраля",
        amount: 300,
        burnable: false,
        audience: "male",
        runAt: "2026-02-23",
        lastRunAt: null,
      },
    ],
    roleMap: {
      employee: ["storefront"],
      decret: ["storefront"],
      vip: ["storefront"],
      manager: ["storefront", "console", "approvals"],
      hr: ["storefront", "console", "catalog_edit", "budgets", "approvals", "audit"],
      admin: [
        "storefront",
        "console",
        "catalog_edit",
        "budgets",
        "approvals",
        "audit",
        "settings",
      ],
    },
    emailTemplates: [
      {
        id: "tpl-window",
        title: "Старт окна выбора",
        body: "Открыто окно выбора льгот. Зайдите в кафетерий и подтвердите набор.",
      },
      {
        id: "tpl-burn",
        title: "Сгорание баллов",
        body: "Часть сгораемых баллов истекает. Успейте потратить остаток.",
      },
      {
        id: "tpl-order",
        title: "Статус заказа",
        body: "Статус вашего заказа обновлён. Подробности — в разделе «Заказы».",
      },
    ],
    integrations:'''
    if insert_before not in t:
        raise SystemExit("integrations needle missing")
    t = t.replace(insert_before, block, 1)

# After return { ... } we need to enrich benefits - inject before closing of createSeed
# Find `return {` and wrap - easier: after people/benefits built, map in place

# Add category + attachments to known benefit ids via string replace on each benefit block
cats = {
    "dms-base": ("cat-dms", "Полис ДМС", "pdf"),
    "dms-family": ("cat-dms", "Условия семьи", "pdf"),
    "dent": ("cat-well", "Прайс стоматологии", "pdf"),
    "hotel": ("cat-hotel", "Буклет отеля", "image"),
    "camp": ("cat-kids", "Программа смены", "pdf"),
    "course": ("cat-learn", "Программа курса", "pdf"),
    "leave-day": ("cat-time", "Регламент отпуска", "pdf"),
    "merch": ("cat-merch", "Фото худи", "image"),
    "fitness": ("cat-sport", "Карта клубов", "pdf"),
    "psych": ("cat-well", "Правила сессии", "pdf"),
    "lang": ("cat-learn", "Расписание групп", "pdf"),
    "flex": ("cat-time", "Положение о графике", "pdf"),
    "cert-pay": ("cat-cert", "Форма компенсации", "pdf"),
    "resort": ("cat-tour", "Схема базы", "image"),
    "vcard": ("cat-merch", "Условия карты", "pdf"),
}

for bid, (cid, att_title, kind) in cats.items():
    # insert after `id: "bid",` line the categoryId - only once
    pattern = f'id: "{bid}",\n'
    repl = (
        f'id: "{bid}",\n'
        f'        categoryId: "{cid}",\n'
        f'        imageLabel: "{att_title}",\n'
        f'        attachments: [{{ id: "att-{bid}", title: "{att_title}", kind: "{kind}", href: "#demo-{kind}-{bid}" }}],\n'
    )
    if f'categoryId: "{cid}"' not in t.split(f'id: "{bid}"')[1][:400]:
        t = t.replace(pattern, repl, 1)

# Give nina a sample active DMS for demo variety
t = t.replace(
    '''        id: "nina",
        name: "Нина Белова",
        role: "employee",
        title: "Бухгалтер",
        department: "Финансы",
        grade: "B",
        years: 5,
        managerId: "anna",
        onboardingDone: true,
        needsQuizDone: true,
        dmsProgramId: null,
        dmsStatus: "none",
        dmsExpiresAt: null,''',
    '''        id: "nina",
        name: "Нина Белова",
        role: "employee",
        title: "Бухгалтер",
        department: "Финансы",
        grade: "B",
        years: 5,
        managerId: "anna",
        onboardingDone: true,
        needsQuizDone: true,
        dmsProgramId: "prog-std",
        dmsStatus: "active",
        dmsExpiresAt: "2027-09-30",''',
)

# one exclusion example — anton? or add to e28
# mark last extra person if possible - simpler: set anton exclusion
if "exclusion: true" not in t:
    t = t.replace(
        '''        id: "anton",
        name: "Антон Рыбаков",
        role: "employee",''',
        '''        id: "anton",
        name: "Антон Рыбаков",
        role: "employee",
        // exclusion flag set below''',
    )
    # cleaner: after anton frozen line
    t = t.replace(
        '''        id: "anton",
        name: "Антон Рыбаков",
        role: "employee",
        // exclusion flag set below
        title: "Мастер участка",
        department: "Производство",
        grade: "C",
        years: 7,
        managerId: "sergey",
        onboardingDone: true,
        needsQuizDone: true,
        dmsProgramId: null,
        dmsStatus: "none",
        dmsExpiresAt: null,
        burnNoticesSent: 0,
        flexibleSchedule: false,
        burnable: 0,
        burnableUntil: "2027-10-01",
        durable: 3200,
        frozen: false,''',
        '''        id: "anton",
        name: "Антон Рыбаков",
        role: "employee",
        title: "Мастер участка",
        department: "Производство",
        grade: "C",
        years: 7,
        managerId: "sergey",
        onboardingDone: true,
        needsQuizDone: true,
        dmsProgramId: null,
        dmsStatus: "none",
        dmsExpiresAt: null,
        burnNoticesSent: 0,
        flexibleSchedule: false,
        burnable: 0,
        burnableUntil: "2027-10-01",
        durable: 3200,
        frozen: false,
        exclusion: true,''',
    )

p.write_text(t, encoding="utf-8")
print("patched", "categories" in t, "version: 4" in t, t.count("categoryId"))
