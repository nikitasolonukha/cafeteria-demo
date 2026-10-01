"use client";

import Link from "next/link";
import { Button, PageHeader } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function NotificationsPage() {
  const { me, state, markNotificationRead, markAllNotificationsRead } = useStore();
  if (!me) return null;

  const list = state.notifications.filter((n) => n.personId === me.id);

  return (
    <div>
      <PageHeader
        title="Уведомления"
        lead="Статусы заказов, окно выбора, коды и переводы."
      />
      <div className="mb-4">
        <Button onClick={() => markAllNotificationsRead()}>Отметить все прочитанными</Button>
      </div>
      <ul className="divide-y divide-line border border-line bg-surface">
        {list.map((n) => (
          <li key={n.id} className={`px-4 py-3 ${n.read ? "" : "bg-paper"}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{n.title}</p>
                <p className="mt-1 text-sm text-muted">{n.body}</p>
                <p className="mt-1 text-xs text-muted">{formatDateTime(n.at)}</p>
              </div>
              <div className="flex gap-2">
                {!n.read ? (
                  <Button onClick={() => markNotificationRead(n.id)}>Прочитано</Button>
                ) : null}
                {n.href ? (
                  <Link href={n.href}>
                    <Button>Открыть</Button>
                  </Link>
                ) : (
                  <Link href="/app">
                    <Button>На главную</Button>
                  </Link>
                )}
              </div>
            </div>
          </li>
        ))}
        {!list.length ? (
          <li className="px-4 py-6 text-sm text-muted">Пока нет уведомлений</li>
        ) : null}
      </ul>
    </div>
  );
}
