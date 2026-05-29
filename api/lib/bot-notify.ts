/**
 * Вызывает внутренний webhook бота для публикации событий
 */
const BOT_WEBHOOK_URL = process.env.BOT_WEBHOOK_URL || "http://bot:8001";
const WEBHOOK_SECRET = process.env.INTERNAL_WEBHOOK_SECRET || "changeme";

export async function notifyBot(
  event: string,
  payload: Record<string, unknown>
): Promise<unknown> {
  try {
    const resp = await fetch(`${BOT_WEBHOOK_URL}/webhook/${event}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": WEBHOOK_SECRET,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });
    if (!resp.ok) {
      console.error(`Bot webhook ${event} failed: ${resp.status}`);
      return null;
    }
    return await resp.json();
  } catch (e) {
    console.error(`Bot webhook ${event} error:`, e);
    return null;
  }
}
