import cron from "cron";
import { db } from "../config/db.js";
import { orders, groupOrders, groupOrderItems } from "../db/schema.js";
import { lt, eq, and, sum } from "drizzle-orm";

const jobCancel = new cron.CronJob("*/1 * * * *", async () => {
  try {
    const nowVN = new Date(Date.now() + 7 * 60 * 60 * 1000);

    const oneHourAgoVN = new Date(nowVN.getTime() - 60 * 60 * 1000);

    const pendingOrders = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.status, "Đang chờ"),
          lt(orders.orderDate, oneHourAgoVN)
        )
      );

    if (pendingOrders.length === 0) {
      console.log("Không có đơn cần hủy");
      return;
    }

    for (const order of pendingOrders) {
      console.log(`Hủy đơn ${order.orderId}`);

      await db
        .update(orders)
        .set({ status: "Bị hủy" })
        .where(eq(orders.orderId, order.orderId));

      const item = await db
        .select()
        .from(groupOrderItems)
        .where(eq(groupOrderItems.orderId, order.orderId))
        .limit(1);

      if (item.length === 0) continue;

      const groupId = item[0].groupOrderId;

      await db
        .delete(groupOrderItems)
        .where(eq(groupOrderItems.orderId, item[0].orderId));

      const remaining = await db
        .select({
          total: sum(groupOrderItems.quantity).as("total"),
        })
        .from(groupOrderItems)
        .where(eq(groupOrderItems.groupOrderId, groupId));

      const sumQuantity = remaining[0].total ?? 0;

      if (sumQuantity === 0) {
        console.log(`GroupOrder ${groupId} trống → XÓA`);

        await db
          .delete(groupOrders)
          .where(eq(groupOrders.id, groupId));

        await db
          .delete(groupOrderItems)
          .where(eq(groupOrderItems.groupOrderId, groupId));
      } else {
        await db
          .update(groupOrders)
          .set({ sumOfQuantity: sumQuantity })
          .where(eq(groupOrders.id, groupId));

        console.log(
          `Cập nhật GroupOrder ${groupId}: sumOfQuantity = ${sumQuantity}`
        );
      }
    }
  } catch (err) {
    console.error("Cron error:", err);
  }
});

export default jobCancel;