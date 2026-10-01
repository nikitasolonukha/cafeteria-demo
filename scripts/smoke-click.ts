/**
 * Полный клик-прогон демо: npx tsx scripts/smoke-click.ts
 */
import { chromium, type Page } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:3000";

type Row = { path: string; ok: boolean; note: string };

async function visit(page: Page, path: string): Promise<Row> {
  const res = await page.goto(BASE + path, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(350);
  const status = res?.status() ?? 0;
  const text = await page.locator("body").innerText().catch(() => "");
  const heading = await page.locator("h1").first().textContent().catch(() => "");
  const bad =
    status >= 400 ||
    /Application error|Unhandled Runtime|Something went wrong/i.test(text) ||
    text.trim().length < 30;
  return {
    path,
    ok: !bad,
    note: bad
      ? `status=${status} len=${text.length} h=${heading}`
      : `h=${(heading || "").trim()}`,
  };
}

async function login(page: Page, name: string) {
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    const key = Object.keys(localStorage).find((k) =>
      k.startsWith("cafeteria-demo"),
    );
    if (!key) return;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const data = JSON.parse(raw);
      data.currentUserId = null;
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: new RegExp(name) }).click();
  await page.waitForTimeout(700);
}

async function soft(label: string, fn: () => Promise<void>): Promise<Row> {
  try {
    await fn();
    return { path: label, ok: true, note: "ok" };
  } catch (e) {
    return { path: label, ok: false, note: String(e).slice(0, 180) };
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const rows: Row[] = [];

  await page.goto(BASE + "/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: /Сбросить демо/ }).click();
  await page.waitForTimeout(400);

  await login(page, "Мария Соколова");

  const storePages = [
    "/app",
    "/app/onboarding-quiz",
    "/app/package",
    "/app/catalog",
    "/app/catalog/hotel",
    "/app/catalog/psych",
    "/app/catalog/resort",
    "/app/catalog/cert-pay",
    "/app/catalog/leave-day",
    "/app/catalog/dms-family",
    "/app/catalog/fitness",
    "/app/catalog/merch",
    "/app/catalog/camp",
    "/app/catalog/vcard",
    "/app/catalog/kindergarten",
    "/app/catalog/club",
    "/app/catalog/gift-child",
    "/app/catalog/lang",
    "/app/cart",
    "/app/orders",
    "/app/wallet",
    "/app/health",
    "/app/news",
    "/app/promos",
    "/app/transfers",
    "/app/charity",
    "/app/pools",
    "/app/lottery",
    "/app/surveys",
    "/app/social",
    "/app/achievements",
    "/app/notifications",
    "/app/suggest",
    "/app/support",
  ];
  for (const p of storePages) rows.push(await visit(page, p));

  rows.push(
    await soft("action:tour", async () => {
      await page.goto(BASE + "/app");
      await page.waitForTimeout(300);
      const next = page.getByRole("button", { name: /^Далее$/ });
      if (await next.count()) await next.click();
      const skip = page.getByRole("button", { name: /Пропустить|Готово/ });
      if (await skip.count()) await skip.first().click();
    }),
  );

  rows.push(
    await soft("action:quiz", async () => {
      await page.goto(BASE + "/app/onboarding-quiz");
      await page.waitForTimeout(300);
      const labels = page.locator("label");
      // pick first option of each question group
      await labels.filter({ hasText: /^Здоровье$/ }).first().click();
      await labels.filter({ hasText: /^Да$/ }).first().click();
      await labels.filter({ hasText: /Цифровые сервисы/ }).first().click();
      await page.getByRole("button", { name: /Получить рекомендации|К пакету/ }).click();
      await page.waitForTimeout(500);
    }),
  );

  rows.push(
    await soft("action:buy-hotel", async () => {
      await page.goto(BASE + "/app/catalog/hotel");
      await page.getByRole("button", { name: /Оформить сейчас/ }).click();
      await page.waitForTimeout(1000);
    }),
  );

  rows.push(
    await soft("action:charity", async () => {
      await page.goto(BASE + "/app/charity");
      await page.getByRole("button", { name: /Подтвердить взнос/ }).click();
      await page.waitForTimeout(400);
    }),
  );

  rows.push(
    await soft("action:lottery", async () => {
      await page.goto(BASE + "/app/lottery");
      await page.getByRole("button", { name: /Купить билет/ }).click();
      await page.waitForTimeout(300);
    }),
  );

  rows.push(
    await soft("action:transfer", async () => {
      await page.goto(BASE + "/app/transfers");
      await page.getByRole("button", { name: /Выберите сотрудника|Новиков|Крылова|Лебедева/ }).first().click();
      await page.getByRole("button", { name: /Елена Крылова/ }).click();
      await page.getByRole("button", { name: /^Перевести$/ }).click();
      await page.waitForTimeout(400);
    }),
  );

  rows.push(
    await soft("action:pool", async () => {
      await page.goto(BASE + "/app/pools");
      await page.getByRole("button", { name: /^Внести$/ }).first().click();
      await page.waitForTimeout(300);
    }),
  );

  rows.push(
    await soft("action:survey", async () => {
      await page.goto(BASE + "/app/surveys");
      const radios = page.locator('input[type="radio"]');
      const n = await radios.count();
      // answer each question: first option of q1, first of q2...
      const names = await radios.evaluateAll((els) =>
        Array.from(new Set(els.map((e) => (e as HTMLInputElement).name))),
      );
      for (const name of names) {
        await page.locator(`input[type="radio"][name="${name}"]`).first().check();
      }
      await page.getByRole("button", { name: /Отправить ответы/ }).click();
      await page.waitForTimeout(300);
    }),
  );

  rows.push(
    await soft("action:social", async () => {
      await page.goto(BASE + "/app/social");
      await page.getByRole("button", { name: /Участвовать/ }).first().click();
    }),
  );

  rows.push(
    await soft("action:leave", async () => {
      await page.goto(BASE + "/app/catalog/leave-day");
      await page.getByRole("button", { name: /Оформить сейчас/ }).click();
      await page.waitForTimeout(800);
    }),
  );

  rows.push(
    await soft("action:news-comment", async () => {
      await page.goto(BASE + "/app/news");
      await page.getByLabel(/Комментарий/).first().fill("smoke comment");
      await page.getByRole("button", { name: /Отправить/ }).first().click();
    }),
  );

  rows.push(
    await soft("action:suggest", async () => {
      await page.goto(BASE + "/app/suggest");
      await page.getByLabel(/Название/).fill("Йога в офисе");
      await page.getByLabel(/Описание/).fill("Раз в неделю");
      await page.getByRole("button", { name: /Отправить HR/ }).click();
    }),
  );

  rows.push(
    await soft("action:support", async () => {
      await page.goto(BASE + "/app/support");
      await page.getByLabel(/Описание/).fill("smoke ticket");
      await page.getByLabel(/Вложение/).fill("smoke-receipt.png");
      await page.getByRole("button", { name: /Отправить|Создать/ }).click();
      await page.waitForTimeout(300);
      const t = await page.locator("body").innerText();
      if (!/smoke-receipt\.png|Обращение создано|вложения/i.test(t)) {
        throw new Error("support attachment not visible");
      }
    }),
  );

  rows.push(
    await soft("action:dms-replace", async () => {
      await page.goto(BASE + "/app/health");
      await page.getByRole("button", { name: /Оформить|Заменить|базовый/i }).first().click();
      await page.waitForTimeout(400);
      const t = await page.locator("body").innerText();
      if (!/Заявка|оформляется|активен|полис|ДМС/i.test(t)) {
        throw new Error("dms replace no feedback");
      }
    }),
  );

  rows.push(
    await soft("action:flex", async () => {
      await page.goto(BASE + "/app");
      const btn = page.getByRole("button", { name: /гибкий график/i });
      if (await btn.count()) await btn.click();
    }),
  );

  rows.push(
    await soft("action:cart-checkout", async () => {
      await page.goto(BASE + "/app/catalog/fitness");
      await page.getByRole("button", { name: /В корзину/ }).click();
      await page.waitForTimeout(400);
      const btn = page.getByRole("button", { name: /^Подтвердить$/ });
      if (await btn.count() && (await btn.isEnabled())) await btn.click();
      await page.waitForTimeout(400);
    }),
  );

  rows.push(
    await soft("action:buy-psych", async () => {
      await page.goto(BASE + "/app/catalog/psych");
      const btn = page.getByRole("button", { name: /Оформить сейчас/ });
      if (await btn.isEnabled()) await btn.click();
      await page.waitForTimeout(400);
    }),
  );

  rows.push(
    await soft("action:buy-merch", async () => {
      await page.goto(BASE + "/app/catalog/merch");
      const btn = page.getByRole("button", { name: /Оформить сейчас/ });
      if (await btn.isEnabled()) await btn.click();
      await page.waitForTimeout(400);
    }),
  );

  rows.push(
    await soft("action:buy-camp", async () => {
      await page.goto(BASE + "/app/catalog/camp");
      await page.getByLabel(/ФИО ребёнка/).fill("Соня Соколова");
      const btn = page.getByRole("button", { name: /Оформить сейчас/ });
      if (await btn.isEnabled()) await btn.click();
      await page.waitForTimeout(400);
    }),
  );

  rows.push(
    await soft("action:buy-docs", async () => {
      await page.goto(BASE + "/app/catalog/cert-pay");
      const btn = page.getByRole("button", { name: /Оформить сейчас/ });
      if (await btn.isEnabled()) await btn.click();
      await page.waitForTimeout(400);
    }),
  );

  rows.push(
    await soft("action:refuse-dms", async () => {
      await page.goto(BASE + "/app/health");
      await page.getByRole("button", { name: /Отказаться от базового ДМС/ }).click();
      await page.waitForTimeout(200);
    }),
  );

  rows.push(
    await soft("action:promo-code", async () => {
      await page.goto(BASE + "/app/catalog/vcard");
      const promo = page.getByLabel(/Промокод/);
      if (await promo.count()) await promo.fill("ALTAIR10");
      const btn = page.getByRole("button", { name: /Оформить сейчас/ });
      if (await btn.isEnabled()) await btn.click();
      await page.waitForTimeout(400);
    }),
  );

  rows.push(
    await soft("action:kindergarten", async () => {
      await page.goto(BASE + "/app/catalog/kindergarten");
      await page.getByLabel(/ФИО ребёнка/).fill("Соня Соколова");
      const btn = page.getByRole("button", { name: /Оформить сейчас/ });
      if (await btn.isEnabled()) await btn.click();
      await page.waitForTimeout(400);
    }),
  );

  rows.push(
    await soft("action:resend-self", async () => {
      await page.goto(BASE + "/app/orders");
      const btn = page.getByRole("button", { name: /Отправить код снова/ }).first();
      if (await btn.count()) await btn.click();
    }),
  );

  rows.push(
    await soft("action:notifications", async () => {
      await page.goto(BASE + "/app/notifications");
      await page.getByRole("button", { name: /Отметить все/ }).click();
    }),
  );

  rows.push(
    await soft("action:package-open", async () => {
      await page.goto(BASE + "/app/package");
      await page.waitForSelector("text=Пакет");
    }),
  );

  // Elena
  await login(page, "Елена Крылова");
  for (const p of [
    "/app",
    "/app/catalog",
    "/app/health",
    "/app/charity",
    "/app/transfers",
    "/app/news",
    "/app/orders",
    "/app/wallet",
  ]) {
    rows.push(await visit(page, p));
  }
  rows.push(
    await soft("assert:elena-no-dms", async () => {
      await page.goto(BASE + "/app/catalog");
      const t = await page.locator("body").innerText();
      if (/ДМС «Стандарт»/.test(t)) throw new Error("decret sees DMS");
    }),
  );

  // Igor
  await login(page, "Игорь Волков");
  rows.push(await visit(page, "/app"));
  rows.push(await visit(page, "/app/catalog"));
  rows.push(await visit(page, "/app/orders"));
  rows.push(
    await soft("assert:igor-general-only", async () => {
      await page.goto(BASE + "/app/catalog");
      const t = await page.locator("body").innerText();
      if (/ДМС «Стандарт»|Сертификат отеля/.test(t)) {
        throw new Error("vip sees restricted benefits");
      }
    }),
  );

  // Dmitry
  await login(page, "Дмитрий Новиков");
  rows.push(await visit(page, "/console/approvals"));
  rows.push(
    await soft("action:approve", async () => {
      const btn = page.getByRole("button", { name: /Одобрить/ }).first();
      if (await btn.count()) await btn.click();
    }),
  );

  // Anna
  await login(page, "Анна Лебедева");
  const consolePages = [
    "/console",
    "/console/approvals",
    "/console/people",
    "/console/people/maria",
    "/console/import",
    "/console/budgets",
    "/console/segments",
    "/console/catalog",
    "/console/categories",
    "/console/window",
    "/console/orders",
    "/console/events",
    "/console/tickets",
    "/console/news",
    "/console/promos",
    "/console/surveys",
    "/console/lottery",
    "/console/funds",
    "/console/anomalies",
    "/console/export",
    "/console/audit",
  ];
  for (const p of consolePages) rows.push(await visit(page, p));

  rows.push(
    await soft("action:import", async () => {
      await page.goto(BASE + "/console/import");
      await page.getByRole("button", { name: /Импортировать/ }).click();
    }),
  );

  rows.push(
    await soft("action:publish-news", async () => {
      await page.goto(BASE + "/console/news");
      await page.getByLabel(/Заголовок/).fill("Smoke news");
      await page.getByLabel(/Текст/).fill("CMS ok");
      await page.getByRole("button", { name: /Опубликовать/ }).click();
    }),
  );

  rows.push(
    await soft("action:anomaly-ok", async () => {
      await page.goto(BASE + "/console/anomalies");
      const btn = page.getByRole("button", { name: /Легитимно/ }).first();
      if (await btn.count()) await btn.click();
    }),
  );

  rows.push(
    await soft("action:budget-preview", async () => {
      await page.goto(BASE + "/console/budgets");
      await page.waitForSelector("text=Массовый пересчёт");
    }),
  );

  rows.push(
    await soft("action:event-grant", async () => {
      await page.goto(BASE + "/console/events");
      await page.getByRole("button", { name: /Запустить сейчас/ }).first().click();
      await page.waitForTimeout(300);
    }),
  );

  rows.push(
    await soft("action:burn-notices", async () => {
      await page.goto(BASE + "/console/events");
      await page.getByRole("button", { name: /Разослать напоминания/ }).click();
    }),
  );

  rows.push(
    await soft("action:fulfill", async () => {
      await page.goto(BASE + "/console/orders");
      const btn = page.getByRole("button", { name: /Исполнить/ }).first();
      if (await btn.count()) await btn.click();
    }),
  );

  rows.push(
    await soft("action:ticket-close", async () => {
      await page.goto(BASE + "/console/tickets");
      const close = page.getByRole("button", { name: /^Закрыть$/ }).first();
      if (await close.count()) await close.click();
    }),
  );

  rows.push(
    await soft("action:resend-code", async () => {
      await page.goto(BASE + "/console/tickets");
      const btn = page.getByRole("button", { name: /Отправить снова/ }).first();
      if (await btn.count()) await btn.click();
    }),
  );

  rows.push(
    await soft("action:catalog-create", async () => {
      await page.goto(BASE + "/console/catalog");
      await page.getByLabel(/^Название$/).fill("Smoke льгота");
      await page.getByRole("button", { name: /Создать позицию/ }).click();
    }),
  );

  rows.push(
    await soft("action:add-codes", async () => {
      await page.goto(BASE + "/console/catalog");
      await page.getByLabel(/Новые коды/).fill("SMOKE-1,SMOKE-2");
      await page.getByRole("button", { name: /Загрузить партию/ }).click();
    }),
  );

  rows.push(
    await soft("action:create-category", async () => {
      await page.goto(BASE + "/console/categories");
      await page.getByLabel(/Название полки/).fill("Smoke полка");
      await page.getByRole("button", { name: /^Создать$/ }).click();
    }),
  );

  rows.push(
    await soft("action:create-promo", async () => {
      await page.goto(BASE + "/console/promos");
      await page.getByLabel(/Название/).fill("Smoke promo");
      await page.getByRole("button", { name: /^Создать$/ }).click();
    }),
  );

  rows.push(
    await soft("action:create-survey", async () => {
      await page.goto(BASE + "/console/surveys");
      const title = page.getByLabel(/Название|Заголовок/).first();
      if (await title.count()) await title.fill("Smoke survey");
      await page.getByRole("button", { name: /^Создать$/ }).click();
    }),
  );

  rows.push(
    await soft("action:create-segment", async () => {
      await page.goto(BASE + "/console/segments");
      await page.getByLabel(/Новый сегмент/).fill("Smoke сегмент");
      await page.getByRole("button", { name: /Создать сегмент/ }).click();
    }),
  );

  rows.push(
    await soft("action:budget-apply", async () => {
      await page.goto(BASE + "/console/budgets");
      const btn = page.getByRole("button", { name: /Утвердить пересчёт/ });
      if (await btn.isEnabled()) await btn.click();
    }),
  );

  rows.push(
    await soft("action:export-copy", async () => {
      await page.goto(BASE + "/console/export");
      await page.waitForSelector("text=Выгрузки");
    }),
  );

  rows.push(
    await soft("action:people-freeze", async () => {
      await page.goto(BASE + "/console/people/elena");
      const btn = page.getByRole("button", { name: /Заморозить|Разморозить/ }).first();
      if (await btn.count()) await btn.click();
    }),
  );

  rows.push(
    await soft("action:banner-toggle", async () => {
      await page.goto(BASE + "/console/news");
      const btn = page.getByRole("button", { name: /Выключить|Включить/ }).first();
      if (await btn.count()) await btn.click();
    }),
  );

  rows.push(
    await soft("action:catalog-delete", async () => {
      await page.goto(BASE + "/console/catalog");
      const row = page.locator("tr").filter({ hasText: "Smoke льгота" });
      const del = row.getByRole("button", { name: /^Удалить$/ });
      if (await del.count()) await del.click();
    }),
  );

  rows.push(
    await soft("action:budget-period", async () => {
      await page.goto(BASE + "/console/budgets");
      await page.locator("select").selectOption("2025");
      const t = await page.locator("body").innerText();
      if (!/заблокировано/i.test(t)) throw new Error("past period not blocked");
      await page.locator("select").selectOption("2026");
    }),
  );

  rows.push(
    await soft("action:dashboard-export", async () => {
      await page.goto(BASE + "/console");
      await page.getByRole("button", { name: /Экспорт дашборда/ }).click();
    }),
  );

  rows.push(await visit(page, "/console/orders"));
  rows.push(await visit(page, "/console/funds"));

  // Pavel
  await login(page, "Павел Орлов");
  for (const p of [
    "/console/settings",
    "/console/integrations",
    "/console/roles",
    "/console/window",
    "/console/people/maria",
  ]) {
    rows.push(await visit(page, p));
  }

  rows.push(
    await soft("action:roles-cap", async () => {
      await page.goto(BASE + "/console/roles");
      await page.waitForSelector("text=Роли и исключения");
      const btn = page.getByRole("button", { name: /Исключить|Вернуть/ }).first();
      if (await btn.count()) await btn.click();
    }),
  );

  rows.push(
    await soft("action:2fa-grant", async () => {
      await page.goto(BASE + "/console/people/maria");
      await page.getByLabel(/Код 2FA/).fill("4242");
      await page.getByLabel(/Комментарий/).fill("smoke начисление");
      await page.getByRole("button", { name: /^Провести$/ }).click();
      await page.waitForTimeout(400);
      const t = await page.locator("body").innerText();
      if (!/записана|аудит|Операция/i.test(t)) throw new Error("no success text");
    }),
  );

  rows.push(
    await soft("action:lottery-draw", async () => {
      await page.goto(BASE + "/console/lottery");
      const draw = page.getByRole("button", { name: /Провести розыгрыш/ }).first();
      if (await draw.count()) await draw.click();
    }),
  );

  rows.push(
    await soft("action:window-notify", async () => {
      await page.goto(BASE + "/console/window");
      await page.getByRole("button", { name: /Разослать уведомление/ }).click();
    }),
  );

  rows.push(
    await soft("action:delivery", async () => {
      await page.goto(BASE + "/console/orders");
      const btn = page.getByRole("button", { name: /В доставку/ }).first();
      if (await btn.count()) await btn.click();
    }),
  );

  rows.push(
    await soft("action:compensate", async () => {
      await page.goto(BASE + "/console/orders");
      await page.getByPlaceholder(/2FA/).fill("4242");
      const btn = page.getByRole("button", { name: /Компенсировать/ }).first();
      if (await btn.count()) await btn.click();
    }),
  );

  rows.push(
    await soft("action:window-toggle", async () => {
      await page.goto(BASE + "/console/window");
      const close = page.getByRole("button", { name: /^Закрыть$/ });
      if (await close.isEnabled()) await close.click();
      await page.waitForTimeout(200);
      const open = page.getByRole("button", { name: /^Открыть$/ });
      if (await open.isEnabled()) await open.click();
    }),
  );

  rows.push(
    await soft("action:window-dates", async () => {
      await page.goto(BASE + "/console/window");
      await page.getByRole("button", { name: /Сохранить даты/ }).click();
    }),
  );

  rows.push(
    await soft("action:window-segment", async () => {
      await page.goto(BASE + "/console/window");
      await page.getByRole("button", { name: /Декрет/ }).click();
    }),
  );

  rows.push(
    await soft("action:settings-toggle", async () => {
      await page.goto(BASE + "/console/settings");
      await page.getByRole("button", { name: /Лотереи/ }).click();
      await page.getByRole("button", { name: /Лотереи/ }).click();
    }),
  );

  rows.push(
    await soft("action:integrations-ping", async () => {
      await page.goto(BASE + "/console/integrations");
      await page.getByRole("button", { name: /Проверить/ }).first().click();
      const t = await page.locator("body").innerText();
      if (!/симуляция/i.test(t)) throw new Error("no ping text");
    }),
  );

  const fails = rows.filter((r) => !r.ok);
  console.log(
    JSON.stringify(
      {
        total: rows.length,
        failed: fails.length,
        fails: fails.map((f) => `${f.path} :: ${f.note}`),
        actions: rows.filter((r) => r.path.startsWith("action")),
      },
      null,
      2,
    ),
  );

  await browser.close();
  if (fails.length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
