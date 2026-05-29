/**
 * Bildirishnomalar uchun yordamchi: notifications jadvaliga yozadi
 * va bot orqali shaxsiy xabar (Telegram DM) yuboradi.
 */
import { getDb } from "../queries/connection";
import { notifyBot } from "./bot-notify";

export type NotificationType =
  | "new_review"
  | "new_tender_application"
  | "service_status_changed"
  | "deal_completed"
  | "new_contact";

export interface NotifyOptions {
  userId: number;          // foydalanuvchining ichki id si (users.id)
  type: NotificationType;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  sendDm?: boolean;        // standart: true
}

/**
 * 1) `notifications` jadvaliga yozadi
 * 2) `sendDm !== false` bo'lsa — bot webhook orqali Telegram DM yuboradi
 */
export async function notify(opts: NotifyOptions): Promise<void> {
  const sql = getDb();

  await sql`
    INSERT INTO notifications (user_id, type, title, body, data)
    VALUES (
      ${opts.userId},
      ${opts.type},
      ${opts.title},
      ${opts.body ?? null},
      ${opts.data ? JSON.stringify(opts.data) : null}
    )
  `;

  if (opts.sendDm === false) return;

  const rows = await sql`SELECT telegram_id FROM users WHERE id = ${opts.userId}`;
  if (!rows.length) return;
  const telegramId = Number(rows[0].telegram_id);
  if (!telegramId) return;

  await notifyBot("dm/send", {
    telegram_id: telegramId,
    title: opts.title,
    body: opts.body ?? "",
    type: opts.type,
    data: opts.data ?? {},
  });
}
