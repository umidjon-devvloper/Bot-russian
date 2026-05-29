import { createRouter, publicQuery } from "./middleware";
import { categoryRouter } from "./categoryRouter";
import { specialistRouter } from "./specialistRouter";
import { serviceRouter } from "./serviceRouter";
import { tenderRouter } from "./tenderRouter";
import { reviewRouter } from "./reviewRouter";
import { statsRouter } from "./statsRouter";
import { userRouter } from "./userRouter";
import { authRouter } from "./authRouter";
import { vacancyRouter } from "./vacancyRouter";
import { contactRouter } from "./contactRouter";
import { notificationRouter } from "./notificationRouter";
import { portfolioRouter } from "./portfolioRouter";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  category: categoryRouter,
  specialist: specialistRouter,
  service: serviceRouter,
  tender: tenderRouter,
  review: reviewRouter,
  stats: statsRouter,
  user: userRouter,
  vacancy: vacancyRouter,
  contact: contactRouter,
  notification: notificationRouter,
  portfolio: portfolioRouter,
});

export type AppRouter = typeof appRouter;
