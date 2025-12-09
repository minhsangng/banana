import cron from "cron";
import { db } from "../config/db.js";
import {
  orders,
  orderItems,
  dishes,
  stores,
  groupOrders,
  groupOrderItems,
  userPushTokens
} from "../db/schema.js";
import { eq } from "drizzle-orm";
import { Expo } from "expo-server-sdk";

const expo = new Expo();

function parseFloor(addr) {
  if (!addr) return { tower: null, floor: null };
  const tower = addr[0];
  const floor = parseInt(addr.slice(1));
  return { tower, floor };
}

function canJoinCluster(cluster, order) {
  const { tower, floor } = parseFloor(order.deliveryAddress);

  for (const o of cluster) {
    const c = parseFloor(o.deliveryAddress);
    if (c.tower !== tower) return false;
    if (Math.abs(c.floor - floor) > 2) return false;
  }
  return true;
}

async function getExistingGroups(storeId, area) {
  return await db
    .select()
    .from(groupOrders)
    .where(
      eq(groupOrders.storeId, storeId),
      eq(groupOrders.deliveryArea, area)
    );
}

async function getGroupQuantity(groupId) {
  const rows = await db
    .select({ qty: groupOrderItems.quantity })
    .from(groupOrderItems)
    .where(eq(groupOrderItems.groupOrderId, groupId));

  return rows.reduce((t, r) => t + r.qty, 0);
}

async function getOrCreateGroup(storeId, area) {
  const existing = await getExistingGroups(storeId, area);

  if (existing.length > 0) {
    for (const g of existing) {
      const total = await getGroupQuantity(g.groupOrderId);
      if (total < 3) return g.groupOrderId;
    }
  }

  const created = await db
    .insert(groupOrders)
    .values({
      storeId,
      deliveryArea: area,
      sumOfQuantity: 0,
    })
    .returning({ groupOrderId: groupOrders.groupOrderId });

  return created[0].groupOrderId;
}

async function assignToGroup(storeId, order) {
  const area = order.deliveryAddress[0];
  const groupId = await getOrCreateGroup(storeId, area);

  await db.insert(groupOrderItems).values({
    groupOrderId: groupId,
    userId: order.userId,
    orderId: order.orderId,
    quantity: order.quantity,
  });

  const total = await getGroupQuantity(groupId);

  await db
    .update(groupOrders)
    .set({ sumOfQuantity: total })
    .where(eq(groupOrders.groupOrderId, groupId));

  await db
    .update(orders)
    .set({ status: "Đang chuẩn bị" })
    .where(eq(orders.orderId, order.orderId));

  const userToken = await db
    .select()
    .from(userPushTokens)
    .where(eq(userPushTokens.userId, parseInt(order.userId)));
  const token = userToken[0].token;

  const message = {
    to: token,
    sound: "default",
    title: "Thông báo mới",
    body: `Đơn hàng #DH2640${order.orderId} đã đủ điều kiện giao đi`,
    data: {},
  };
  
  if (!Expo.isExpoPushToken(token)) return;

  const tickets = await expo.sendPushNotificationsAsync([message]);
}

const jobGroup = new cron.CronJob("*/1 * * * *", async () => {
  try {
    console.log("Cron grouping orders...");

    const pendingOrders = await db
      .select({
        orderId: orders.orderId,
        userId: orders.userId,
        deliveryAddress: orders.deliveryAddress,
        storeId: stores.storeId,
        quantity: orderItems.quantity,
      })
      .from(orders)
      .innerJoin(orderItems, eq(orders.orderId, orderItems.orderId))
      .innerJoin(dishes, eq(dishes.dishId, orderItems.dishId))
      .innerJoin(stores, eq(stores.storeId, dishes.storeId))
      .where(eq(orders.status, "Đang chờ"));

    if (pendingOrders.length === 0) return;

    const storeGroups = {};
    for (const o of pendingOrders) {
      if (!storeGroups[o.storeId]) storeGroups[o.storeId] = [];
      storeGroups[o.storeId].push(o);
    }

    for (const storeId in storeGroups) {
      const ordersOfStore = storeGroups[storeId];

      const clusters = [];
      let current = [];

      for (const o of ordersOfStore) {
        if (current.length === 0) {
          current.push(o);
        } else if (canJoinCluster(current, o)) {
          current.push(o);
        } else {
          clusters.push(current);
          current = [o];
        }
      }
      if (current.length > 0) clusters.push(current);

      for (const cluster of clusters) {
        const totalQty = cluster.reduce((s, o) => s + o.quantity, 0);

        if (totalQty < 3) continue;

        for (const o of cluster) {
          await assignToGroup(storeId, o);
        }
      }
    }
  } catch (err) {
    console.error("Cron group error:", err);
  }
});

export default jobGroup;
