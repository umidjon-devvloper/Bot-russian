import { z } from "zod";
import { createRouter, publicMutation, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { notifyBot } from "./lib/bot-notify";
import { notify } from "./lib/notifications";
import { recalcSpecialist } from "./lib/recalc-specialist";

export const contactRouter = createRouter({
  /**
   * Buyurtmachi mutaxassis bilan kontakt ochadi (xizmat sahifasidan).
   * Status: chat
   */
  start: publicMutation
    .input(z.object({
      telegramId: z.number(),
      specialistId: z.number(),
      serviceId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const sql = getDb();
      const users = await sql`SELECT id, first_name FROM users WHERE telegram_id = ${input.telegramId}`;
      if (!users.length) throw new Error("User not found");
      const customerId = Number(users[0].id);
      const customerName = users[0].first_name || "Заказчик";
      if (customerId === input.specialistId) throw new Error("Self contact");

      const [row] = await sql`
        INSERT INTO contacts (customer_id, specialist_id, service_id, status)
        VALUES (${customerId}, ${input.specialistId}, ${input.serviceId ?? null}, 'chat')
        RETURNING id
      `;
      await sql`UPDATE specialist_profiles SET total_contacts = total_contacts + 1 WHERE user_id = ${input.specialistId}`;
      if (input.serviceId) {
        await sql`UPDATE services SET contact_clicks = contact_clicks + 1 WHERE id = ${input.serviceId}`;
      }

      await notify({
        userId: input.specialistId,
        type: "new_contact",
        title: "Новое обращение к вам",
        body: `${customerName} хочет с вами связаться.`,
        data: { contactId: Number(row.id), serviceId: input.serviceId },
      });

      return { ok: true, id: Number(row.id) };
    }),

  /**
   * Kontakt statusini o'zgartirish.
   * `completed` ga o'tilganda — `deals` jadvalida yozuv yaratiladi,
   * bot webhooki orqali jurnal joylanadi va ikkala tomon DM oladi.
   */
  setStatus: publicMutation
    .input(z.object({
      telegramId: z.number(),
      contactId: z.number(),
      status: z.enum(["chat", "deal_started", "completed", "disputed", "cancelled"]),
      dealAmount: z.number().optional(),
      dealDeadline: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const sql = getDb();
      const users = await sql`SELECT id FROM users WHERE telegram_id = ${input.telegramId}`;
      if (!users.length) throw new Error("User not found");
      const actorId = Number(users[0].id);

      const contactRows = await sql`
        SELECT c.*,
               uc.first_name AS cust_first, uc.last_name AS cust_last,
               us.first_name AS spec_first, us.last_name AS spec_last,
               s.title AS service_title
        FROM contacts c
        JOIN users uc ON uc.id = c.customer_id
        JOIN users us ON us.id = c.specialist_id
        LEFT JOIN services s ON s.id = c.service_id
        WHERE c.id = ${input.contactId}
      `;
      if (!contactRows.length) throw new Error("Contact not found");
      const c = contactRows[0] as any;
      if (Number(c.customer_id) !== actorId && Number(c.specialist_id) !== actorId) {
        throw new Error("Forbidden");
      }
      const previousStatus = c.status as string;

      const isCustomer = Number(c.customer_id) === actorId;
      await sql`
        UPDATE contacts SET
          status = ${input.status},
          deal_amount = COALESCE(${input.dealAmount ?? null}, deal_amount),
          deal_deadline = COALESCE(${input.dealDeadline ?? null}, deal_deadline),
          confirmed_by_customer = CASE WHEN ${isCustomer} THEN true ELSE confirmed_by_customer END,
          confirmed_by_specialist = CASE WHEN ${!isCustomer} THEN true ELSE confirmed_by_specialist END,
          updated_at = NOW()
        WHERE id = ${input.contactId}
      `;

      // completed bo'lganda va avval completed bo'lmagan bo'lsa — bitim yozish
      if (input.status === "completed" && previousStatus !== "completed") {
        const amount = input.dealAmount ?? Number(c.deal_amount || 0);
        const custName = `${c.cust_first || ""} ${c.cust_last || ""}`.trim() || "Заказчик";
        const specName = `${c.spec_first || ""} ${c.spec_last || ""}`.trim() || "Специалист";
        const serviceTitle = c.service_title || "Услуга";

        const [deal] = await sql`
          INSERT INTO deals (contact_id, customer_id, specialist_id, service_title, amount, status)
          VALUES (${input.contactId}, ${c.customer_id}, ${c.specialist_id}, ${serviceTitle}, ${amount}, 'completed')
          RETURNING id
        `;

        await sql`
          UPDATE specialist_profiles
          SET total_deals = total_deals + 1, updated_at = NOW()
          WHERE user_id = ${c.specialist_id}
        `;
        await sql`
          UPDATE customer_profiles
          SET total_hires = total_hires + 1, updated_at = NOW()
          WHERE user_id = ${c.customer_id}
        `;

        // Telegram-jurnalga avtomatik joylash
        await notifyBot("deal/completed", {
          deal_id: Number(deal.id),
          customer_name: custName,
          specialist_name: specName,
          service_title: serviceTitle,
          amount,
        });

        // Status va profil to'ldirilganligini qayta hisoblash
        const recalc = await recalcSpecialist(Number(c.specialist_id));

        // DM обеим сторонам
        await notify({
          userId: Number(c.specialist_id),
          type: "deal_completed",
          title: "Сделка завершена 🤝",
          body: `Сделка с ${custName} завершена. Ожидайте отзыв.`,
          data: { contactId: input.contactId, dealId: Number(deal.id) },
        });
        await notify({
          userId: Number(c.customer_id),
          type: "deal_completed",
          title: "Сделка завершена 🤝",
          body: `Сделка с ${specName} завершена. Оставьте отзыв!`,
          data: { contactId: input.contactId, dealId: Number(deal.id), specialistId: Number(c.specialist_id) },
        });

        if (recalc?.changed) {
          const labels: Record<string, string> = { master: "Мастер ⭐", expert: "Эксперт 🏆", top: "Топ 💎" };
          const label = labels[recalc.status];
          if (label) {
            await notify({
              userId: Number(c.specialist_id),
              type: "service_status_changed",
              title: `Поздравляем! Новый статус: ${label}`,
              body: "Ваш статус на бирже обновлён.",
              data: { newStatus: recalc.status },
            });
          }
        }
      }

      return { ok: true };
    }),

  /**
   * Foydalanuvchi o'zining kontaktlari ro'yxati.
   */
  list: publicQuery
    .input(z.object({ telegramId: z.number() }))
    .query(async ({ input }) => {
      const sql = getDb();
      const users = await sql`SELECT id FROM users WHERE telegram_id = ${input.telegramId}`;
      if (!users.length) return [];
      const userId = Number(users[0].id);

      const rows = await sql`
        SELECT c.*, s.title AS service_title,
               uc.first_name AS cust_first, uc.photo_url AS cust_photo,
               us.first_name AS spec_first, us.photo_url AS spec_photo
        FROM contacts c
        LEFT JOIN services s ON s.id = c.service_id
        JOIN users uc ON uc.id = c.customer_id
        JOIN users us ON us.id = c.specialist_id
        WHERE c.customer_id = ${userId} OR c.specialist_id = ${userId}
        ORDER BY c.updated_at DESC
        LIMIT 50
      `;
      return rows.map((r: any) => ({
        id: Number(r.id),
        status: r.status,
        serviceTitle: r.service_title,
        dealAmount: r.deal_amount ? Number(r.deal_amount) : null,
        customerId: Number(r.customer_id),
        specialistId: Number(r.specialist_id),
        customerName: r.cust_first,
        customerPhoto: r.cust_photo,
        specialistName: r.spec_first,
        specialistPhoto: r.spec_photo,
        isCustomer: Number(r.customer_id) === userId,
        updatedAt: r.updated_at,
      }));
    }),
});
