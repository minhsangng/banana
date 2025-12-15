import cron from "cron";
import { db } from "../config/db.js";
import { orders, orderItems } from "../db/schema.js";
import { lt, inArray } from "drizzle-orm";

const jobCleanupOrders = new cron.CronJob("0 5 * * *", async () => {
  try {
    console.log("Cron cleanup orders bắt đầu");

    // Giờ VN
    const nowVN = new Date(Date.now() + 7 * 60 * 60 * 1000);

    // Lùi 3 tháng
    const threeMonthsAgo = new Date(nowVN);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    // Lấy danh sách order quá 3 tháng
    const oldOrders = await db
      .select({
        orderId: orders.orderId,
      })
      .from(orders)
      .where(lt(orders.orderDate, threeMonthsAgo));

    if (oldOrders.length === 0) {
      console.log("Không có orders quá 3 tháng");
      return;
    }

    const orderIds = oldOrders.map((o) => o.orderId);

    console.log(`Xóa ${orderIds.length} orders quá hạn`);

    // 1. Xóa orderItems trước
    await db
      .delete(orderItems)
      .where(inArray(orderItems.orderId, orderIds));

    // 2. Xóa orders
    await db
      .delete(orders)
      .where(inArray(orders.orderId, orderIds));

    console.log("Cleanup orders hoàn tất");
  } catch (err) {
    console.error("Cron cleanup error:", err);
  }
});

export default jobCleanupOrders;
