/**
 * Валидация данных Telegram Mini App / Telegram Login Widget
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
import crypto from "crypto";

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
}

/**
 * Валидирует initData из Telegram Mini App
 */
export function validateTelegramInitData(
  initData: string,
  botToken: string
): TelegramUser | null {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    if (!hash) return null;

    params.delete("hash");

    const dataCheckArr: string[] = [];
    params.forEach((value, key) => {
      dataCheckArr.push(`${key}=${value}`);
    });
    dataCheckArr.sort();
    const dataCheckString = dataCheckArr.join("\n");

    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(botToken)
      .digest();

    const hmac = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    if (hmac !== hash) return null;

    const authDate = parseInt(params.get("auth_date") || "0", 10);
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400) return null;

    const userStr = params.get("user");
    if (!userStr) return null;

    return JSON.parse(userStr) as TelegramUser;
  } catch {
    return null;
  }
}

/**
 * Валидирует данные Telegram Login Widget (для web-версии)
 */
export function validateTelegramLoginWidget(
  data: Record<string, string>,
  botToken: string
): TelegramUser | null {
  try {
    const { hash, ...rest } = data;
    if (!hash) return null;

    const dataCheckArr = Object.entries(rest)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`);

    const dataCheckString = dataCheckArr.join("\n");

    const secretKey = crypto
      .createHash("sha256")
      .update(botToken)
      .digest();

    const hmac = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    if (hmac !== hash) return null;

    const authDate = parseInt(rest.auth_date || "0", 10);
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400) return null;

    return {
      id: parseInt(rest.id, 10),
      first_name: rest.first_name,
      last_name: rest.last_name,
      username: rest.username,
      photo_url: rest.photo_url,
      auth_date: authDate,
    };
  } catch {
    return null;
  }
}
