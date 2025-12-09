import cron from "cron";
import { db } from "../config/db.js";
import {
  orders
} from "../db/schema.js";
import { eq, ne, and } from "drizzle-orm";

function getVietnamTimeHHMM() {
  const dateVN = new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" });
  const now = new Date(dateVN);

  const hh = now.getHours().toString().padStart(2, "0");
  const mm = now.getMinutes().toString().padStart(2, "0");

  return `${hh}:${mm}`;
}

const jobOrder = new cron.CronJob("*/1 * * * *", async () => {
  try {
    const currentTime = getVietnamTimeHHMM();

    const results = await db
      .select()
      .from(orders)
      .where(
          eq(orders.status, "Hẹn giao")
      );

    if (results.length === 0) {
      console.log("Không có đơn Hẹn giao.");
      return;
    }

    for (const order of results) {
      if (!order.timer) continue;

      const deliveryTime = order.timer.trim();

      if (deliveryTime <= currentTime) {
        console.log(`Cập nhật đơn ID ${order.orderId} sang 'Đang chờ'`);

        await db
          .update(orders)
          .set({ status: "Đang chờ" })
          .where(eq(orders.orderId, order.orderId));
      }
    }
  } catch (err) {
    console.error("Cron place order timer error:", err);
  }
});

export default jobOrder;
