import express, { response } from "express";
import { ENV } from "./config/env.js";
import { db } from "./config/db.js";
import {
  dishes,
  categories,
  users,
  stores,
  orders,
  orderItems,
  favorites,
  groupOrders,
  groupOrderItems,
  userPushTokens,
  rooms,
} from "./db/schema.js";
import {
  eq,
  ne,
  lt,
  sql,
  and,
  ilike,
  desc,
  between,
  inArray,
} from "drizzle-orm";
import job from "./config/cron.js";
import { Expo } from "expo-server-sdk";
import cors from "cors";
import authRouter, { protect } from "./auth.js";
import { getRounds } from "bcrypt";

const app = express();
const PORT = ENV.PORT || 5001;

const expo = new Expo();

if (ENV.NODE_ENV === "production") job.start();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

app.post("/api/updatepushtoken", async (req, res) => {
  try {
    const { userId, token } = req.body;

    const existingUser = await db
      .select()
      .from(userPushTokens)
      .where(eq(userPushTokens.userId, parseInt(userId)));

    if (existingUser.length === 0) {
      await db
        .insert(userPushTokens)
        .values({ userId: parseInt(userId), token });
    } else {
      await db
        .update(userPushTokens)
        .set({ token })
        .where(eq(userPushTokens.userId, parseInt(userId)));
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

app.post("/api/pushnotification", async (req, res) => {
  const { userId, title, content, metadata } = req.body;
  const userToken = await db
    .select()
    .from(userPushTokens)
    .where(eq(userPushTokens.userId, parseInt(userId)));
  const token = userToken[0].token;

  const message = {
    to: token,
    sound: "default",
    title: title,
    body: content,
    data: metadata || {},
  };

  if (!Expo.isExpoPushToken(token)) {
    return res.status(400).json({ error: "Invalid push token" });
  }

  const tickets = await expo.sendPushNotificationsAsync([message]);

  return res.status(200).json(tickets);
});

app.use("/api/auth", authRouter);

/* TEST */
app.get("/api/healthz", (req, res) => {
  res.status(200).json({ success: true });
});

/* DISH API */
/* Insert dishes */
app.post("/api/dishes", async (req, res) => {
  try {
    const {
      dishName,
      storeId,
      categoryId,
      price,
      description,
      imageUrl,
      status,
      selled,
      availability,
    } = req.body;

    if (!dishName || !storeId || !categoryId || !price) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newDish = await db
      .insert(dishes)
      .values({
        dishName,
        storeId,
        categoryId,
        price,
        description,
        imageUrl,
        status,
        selled,
        availability,
      })
      .returning();

    res.status(201).json(newDish[0]);
  } catch (error) {
    console.log("Error adding favorite", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/* Search dish*/
app.get("/api/search/:query", async (req, res) => {
  try {
    const { query } = req.params;
    const q = `%${query}%`;

    const resultsSearch = await db
      .select()
      .from(dishes)
      .where(and(ilike(dishes.dishName, q), eq(dishes.status, "Active")));

    res.status(200).json(resultsSearch);
  } catch (error) {
    console.log("Error fetching the dishes", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/* Selct dish by categoryId */
app.get("/api/dishes/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;

    const results = await db
      .select()
      .from(dishes)
      .where(
        and(
          eq(dishes.categoryId, parseInt(categoryId)),
          eq(dishes.status, "Active")
        )
      );

    res.status(200).json(results);
  } catch (error) {
    console.log("Error fetching the dishes", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/* Select dish detail */
app.get("/api/dish/:dishId/:userId", async (req, res) => {
  try {
    const { dishId, userId } = req.params;

    let results = [];
    const userFavorites = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, parseInt(userId)),
          eq(favorites.dishId, parseInt(dishId))
        )
      );

    if (userFavorites.length === 0) {
      results = await db
        .select()
        .from(dishes)
        .where(
          and(eq(dishes.dishId, parseInt(dishId)), eq(dishes.status, "Active"))
        );
    } else {
      results = await db
        .select({ ...dishes, userId: favorites.userId })
        .from(dishes)
        .innerJoin(favorites, eq(favorites.userId, parseInt(userId)))
        .where(
          and(eq(dishes.dishId, parseInt(dishId)), eq(dishes.status, "Active"))
        );
    }

    res.status(200).json(results);
  } catch (error) {
    console.log("Error fetching the dishes", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/ownerdish/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const results = await db
      .select({
        dishId: dishes.dishId,
        dishName: dishes.dishName,
        storeId: dishes.storeId,
        categoryId: dishes.categoryId,
        price: dishes.price,
        imageUrl: dishes.imageUrl,
        selled: dishes.selled,
        availability: dishes.availability,
        status: dishes.status,
      })
      .from(dishes)
      .innerJoin(stores, eq(stores.storeId, dishes.storeId))
      .innerJoin(users, eq(users.userId, userId));

    res.status(200).json(results);
  } catch (error) {
    console.log("Error fetching the dishes", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/* Select all dish */
app.get("/api/dishes", async (req, res) => {
  try {
    const results = await db.select().from(dishes);

    res.status(200).json(results);
  } catch (error) {
    console.log("Error fetching the dishes", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/* Select dish best seller in limit range */
app.get("/api/dishes/bestseller/:limit", async (req, res) => {
  try {
    const limit = parseInt(req.params.limit);

    let query = db
      .select()
      .from(dishes)
      .where(eq(dishes.status, "Active"))
      .orderBy(desc(dishes.selled));

    if (limit !== 0) {
      query = query.limit(limit);
    }

    const results = await query;

    res.status(200).json(results);
  } catch (error) {
    console.log("Error fetching the dishes", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/* CATEGORY API */
/* Select all categories */
app.get("/api/categories", async (req, res) => {
  try {
    const results = await db.select().from(categories);

    res.status(200).json(results);
  } catch (error) {
    console.log("Error fetching the categories", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/* STORE API */
/* Select all stores */
app.get("/api/stores", async (req, res) => {
  try {
    const results = await db
      .select()
      .from(stores)
      .where(eq(stores.status, "Active"));

    res.status(200).json(results);
  } catch (error) {
    console.log("Error fetching the dishes", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/* USER API */
/* Select all users */
app.get("/api/users", async (req, res) => {
  try {
    const results = await db
      .select()
      .from(users)
      .where(eq(users.role, "Customer"))
      .orderBy(desc(users.createdAt))
      .limit(10);

    res.status(200).json(results);
  } catch (error) {
    console.log("Error fetching the users", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/* FAVORITES */
/* Select favorites */
app.get("/api/favorites/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const results = await db
      .select({
        favoritesId: favorites.favoriteId,
        userId: favorites.userId,
        dishId: dishes.dishId,
        dishName: dishes.dishName,
        storeId: dishes.storeId,
        categoryId: dishes.categoryId,
        price: dishes.price,
        imageUrl: dishes.imageUrl,
        selled: dishes.selled,
        status: dishes.status,
      })
      .from(favorites)
      .innerJoin(dishes, eq(dishes.dishId, favorites.dishId))
      .where(eq(favorites.userId, parseInt(userId)));

    res.status(200).json(results);
  } catch (error) {
    console.log("Error fetching the orders", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/* ORDER API */
/* Select revenue in limit range */
app.get("/api/orders/:start/:end", async (req, res) => {
  try {
    const { start, end } = req.params;
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).json({ error: "Ngày không hợp lệ" });
    }

    const results = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.status, "Hoàn thành"),
          between(orders.orderDate, startDate, endDate)
        )
      );

    res.status(200).json(results);
  } catch (error) {
    console.log("Error fetching the orders", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/* Select all order */
app.get("/api/orders/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const rows = await db
      .select({
        orderId: orders.orderId,
        orderStatus: orders.status,
        deliveryAddress: orders.deliveryAddress,
        orderItemId: orderItems.orderItemId,
        quantity: orderItems.quantity,
        dishId: dishes.dishId,
        dishName: dishes.dishName,
        dishPrice: dishes.price,
        dishImage: dishes.imageUrl,
      })
      .from(orders)
      .innerJoin(orderItems, eq(orderItems.orderId, orders.orderId))
      .innerJoin(dishes, eq(dishes.dishId, orderItems.dishId))
      .where(
        and(
          eq(orders.userId, parseInt(userId)),
          ne(orders.status, "Bị hủy"),
          ne(orders.status, "Giỏ hàng")
        )
      );

    const grouped = {};
    rows.forEach((row) => {
      if (!grouped[row.orderId]) {
        grouped[row.orderId] = {
          orderId: row.orderId,
          orderStatus: row.orderStatus,
          deliveryAddress: row.deliveryAddress,
          items: [],
        };
      }

      grouped[row.orderId].items.push({
        orderItemId: row.orderItemId,
        quantity: row.quantity,
        dishId: row.dishId,
        dishName: row.dishName,
        dishPrice: row.dishPrice,
        dishImage: row.dishImage,
      });
    });

    res.status(200).json(Object.values(grouped));
  } catch (error) {
    console.log("Error fetching the orders", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/currentorder/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const rows = await db
      .select({
        orderId: orders.orderId,
        orderStatus: orders.status,
        deliveryAddress: orders.deliveryAddress,
        orderItemId: orderItems.orderItemId,
        quantity: orderItems.quantity,
        dishId: dishes.dishId,
        dishName: dishes.dishName,
        dishPrice: dishes.price,
        dishImage: dishes.imageUrl,
      })
      .from(orders)
      .innerJoin(orderItems, eq(orderItems.orderId, orders.orderId))
      .innerJoin(dishes, eq(dishes.dishId, orderItems.dishId))
      .where(
        and(
          eq(orders.userId, parseInt(userId)),
          ne(orders.status, "Hoàn thành"),
          ne(orders.status, "Giỏ hàng")
        )
      );

    const grouped = {};
    rows.forEach((row) => {
      if (!grouped[row.orderId]) {
        grouped[row.orderId] = {
          orderId: row.orderId,
          orderStatus: row.orderStatus,
          deliveryAddress: row.deliveryAddress,
          items: [],
        };
      }

      grouped[row.orderId].items.push({
        orderItemId: row.orderItemId,
        quantity: row.quantity,
        dishId: row.dishId,
        dishName: row.dishName,
        dishPrice: row.dishPrice,
        dishImage: row.dishImage,
      });
    });

    res.status(200).json(Object.values(grouped));
  } catch (error) {
    console.log("Error fetching the orders", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/passorder/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const rows = await db
      .select({
        orderId: orders.orderId,
        orderStatus: orders.status,
        deliveryAddress: orders.deliveryAddress,
        orderItemId: orderItems.orderItemId,
        quantity: orderItems.quantity,
        dishId: dishes.dishId,
        dishName: dishes.dishName,
        dishPrice: dishes.price,
        dishImage: dishes.imageUrl,
      })
      .from(orders)
      .innerJoin(orderItems, eq(orderItems.orderId, orders.orderId))
      .innerJoin(dishes, eq(dishes.dishId, orderItems.dishId))
      .where(
        and(
          eq(orders.userId, parseInt(userId)),
          inArray(orders.status, ["Hoàn thành", "Bị hủy"])
        )
      );

    const grouped = {};
    rows.forEach((row) => {
      if (!grouped[row.orderId]) {
        grouped[row.orderId] = {
          orderId: row.orderId,
          orderStatus: row.orderStatus,
          deliveryAddress: row.deliveryAddress,
          items: [],
        };
      }

      grouped[row.orderId].items.push({
        orderItemId: row.orderItemId,
        quantity: row.quantity,
        dishId: row.dishId,
        dishName: row.dishName,
        dishPrice: row.dishPrice,
        dishImage: row.dishImage,
      });
    });

    res.status(200).json(Object.values(grouped));
  } catch (error) {
    console.log("Error fetching the orders", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/* Select order by owner */
app.get("/api/ordersowner/:userId/:status", async (req, res) => {
  try {
    const { userId, status } = req.params;

    const groups = await db
      .select()
      .from(groupOrderItems)
      .innerJoin(
        groupOrders,
        eq(groupOrders.groupOrderId, groupOrderItems.groupOrderId)
      )
      .innerJoin(orders, eq(orders.orderId, groupOrderItems.orderId))
      .innerJoin(stores, eq(stores.storeId, groupOrders.storeId))
      .where(
        and(
          eq(groupOrderItems.userId, parseInt(userId)),
          status === "Đang chuẩn bị"
            ? inArray(orders.status, ["Đang chờ", "Đang giao", "Đang chuẩn bị"])
            : eq(orders.status, status)
        )
      );

    if (groups.length === 0) {
      return res.json([]);
    }

    const groupOrderIds = groups.map((go) => go.orders.orderId);

    const rows = await db
      .select({
        orderId: orders.orderId,
        orderStatus: orders.status,
        deliveryAddress: orders.deliveryAddress,
        orderItemId: orderItems.orderItemId,
        quantity: orderItems.quantity,
        dishId: dishes.dishId,
        dishName: dishes.dishName,
        dishPrice: dishes.price,
        dishImage: dishes.imageUrl,
        storeId: stores.storeId,
      })
      .from(orders)
      .innerJoin(orderItems, eq(orderItems.orderId, orders.orderId))
      .innerJoin(dishes, eq(dishes.dishId, orderItems.dishId))
      .innerJoin(stores, eq(stores.storeId, dishes.storeId))
      .where(inArray(orders.orderId, groupOrderIds));

    const grouped = {};
    rows.forEach((row) => {
      if (!grouped[row.orderId]) {
        grouped[row.orderId] = {
          orderId: row.orderId,
          orderStatus: row.orderStatus,
          deliveryAddress: row.deliveryAddress,
          items: [],
        };
      }

      grouped[row.orderId].items.push({
        orderItemId: row.orderItemId,
        quantity: row.quantity,
        dishId: row.dishId,
        dishName: row.dishName,
        dishPrice: row.dishPrice,
        dishImage: row.dishImage,
        storeId: row.storeId,
      });
    });

    res.status(200).json(Object.values(grouped));
  } catch (error) {
    console.log("Error fetching the group orders", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/* Add to cart */
app.post("/api/cart/add", async (req, res) => {
  try {
    const { userId, dishId, quantity, note } = req.body;

    if (!userId || !dishId || !quantity) {
      return res.status(400).json({ error: "Thiếu thông tin đơn hàng" });
    }

    const dishRecord = await db
      .select({
        price: dishes.price,
        storeId: dishes.storeId,
      })
      .from(dishes)
      .where(eq(dishes.dishId, dishId));

    if (dishRecord.length === 0) {
      return res.status(400).json({ error: "Không tìm thấy món" });
    }

    const dishPrice = parseFloat(dishRecord[0].price);
    const newDishStoreId = dishRecord[0].storeId;

    const carts = await db
      .select()
      .from(orders)
      .where(
        and(eq(orders.userId, parseInt(userId)), eq(orders.status, "Giỏ hàng"))
      );

    let targetOrderId = null;
    if (carts.length > 0) {
      for (const cart of carts) {
        const cartItems = await db
          .select({
            dishId: orderItems.dishId,
            storeId: dishes.storeId,
          })
          .from(orderItems)
          .innerJoin(dishes, eq(orderItems.dishId, dishes.dishId))
          .where(eq(orderItems.orderId, cart.orderId));

        const hasSameStore = cartItems.some(
          (it) => it.storeId === newDishStoreId
        );

        if (hasSameStore) {
          targetOrderId = cart.orderId;
          break;
        }
      }
    }

    if (!targetOrderId) {
      const orderDate = new Date(Date.now() + 7 * 3600 * 1000);
      const newOrder = await db
        .insert(orders)
        .values({
          orderDate,
          userId: parseInt(userId),
          totalAmount: dishPrice * quantity,
          status: "Giỏ hàng",
        })
        .returning({ orderId: orders.orderId });

      targetOrderId = newOrder[0].orderId;
    }

    const existingItem = await db
      .select()
      .from(orderItems)
      .where(
        and(
          eq(orderItems.orderId, targetOrderId),
          eq(orderItems.dishId, dishId)
        )
      );

    if (existingItem.length > 0) {
      const newQty = existingItem[0].quantity + quantity;
      await db
        .update(orderItems)
        .set({ quantity: newQty, note })
        .where(eq(orderItems.orderItemId, existingItem[0].orderItemId));
    } else {
      await db.insert(orderItems).values({
        orderId: targetOrderId,
        dishId,
        quantity,
        note,
      });
    }

    const total = await db
      .select({
        total: sql`SUM(${orderItems.quantity} * ${dishes.price})`,
      })
      .from(orderItems)
      .innerJoin(dishes, eq(orderItems.dishId, dishes.dishId))
      .where(eq(orderItems.orderId, targetOrderId));

    const totalAmount = total[0].total ?? 0;

    await db
      .update(orders)
      .set({ totalAmount })
      .where(eq(orders.orderId, targetOrderId));

    return res.json({
      success: true,
      message:
        existingItem.length > 0 ? "Updated item quantity" : "Added new item",
      orderId: targetOrderId,
      mergedIntoExistingStoreOrder:
        !!carts.length &&
        !!targetOrderId &&
        carts.some((c) => c.orderId === targetOrderId),
    });
  } catch (e) {
    console.log("Error adding to cart", e);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/* Get cart */
app.get("/api/cart/get/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const ordersList = await db
      .select()
      .from(orders)
      .where(
        and(eq(orders.userId, parseInt(userId)), eq(orders.status, "Giỏ hàng"))
      );

    if (ordersList.length === 0) {
      return res.json([]);
    }

    const orderIds = ordersList.map((order) => parseInt(order.orderId));
    const orderItemsList = await db
      .select()
      .from(orderItems)
      .fullJoin(dishes, eq(dishes.dishId, orderItems.dishId))
      .where(inArray(orderItems.orderId, orderIds));

    res.json(orderItemsList);
  } catch (error) {
    console.log("Error fetching the cart", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/* Update cart */
app.post("/api/cart/update", async (req, res) => {
  try {
    const { orderItemId, quantity } = req.body;

    if (quantity <= 0)
      return res.status(400).json({ message: "Invalid quantity" });

    await db
      .update(orderItems)
      .set({ quantity })
      .where(eq(orderItems.orderItemId, orderItemId));

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

/* Get order by id */
app.get("/api/order/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    const results = await db
      .select()
      .from(orders)
      .where(eq(orders.orderId, orderId));

    if (results.length === 0) res.json([]);

    const orderIds = results.map((order) => parseInt(order.orderId));
    const orderItemsList = await db
      .select()
      .from(orderItems)
      .fullJoin(dishes, eq(dishes.dishId, orderItems.dishId))
      .where(inArray(orderItems.orderId, orderIds));

    res.json(orderItemsList);
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/cancelorder/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    const results = await db
      .update(orders)
      .set({ status: "Bị hủy" })
      .where(eq(orders.orderId, orderId));

    if (results.rowsAffected === 0)
      res.json({
        success: false,
        message: `Hủy đơn #DH2604${orderId} thất bại`,
      });

    res.json({
      success: true,
      message: `Đơn hàng #DH2604${orderId} đã bị hủy`,
    });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

/* Get order by id */
app.get("/api/ordercheckout/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const results = await db
      .select()
      .from(orders)
      .where(
        and(eq(orders.userId, parseInt(userId)), eq(orders.status, "Giỏ hàng"))
      );

    if (results.length === 0) return res.json([]);

    const orderIds = results.map((order) => parseInt(order.orderId));

    const orderItemsList = await db
      .select()
      .from(orderItems)
      .fullJoin(dishes, eq(dishes.dishId, orderItems.dishId))
      .where(inArray(orderItems.orderId, orderIds));

    const grouped = {};

    orderItemsList.forEach((item) => {
      const oid = item.order_items.orderId;
      const sid = item.dishes.storeId;

      const key = `${sid}-${oid}`;

      if (!grouped[key]) {
        grouped[key] = {
          storeId: sid,
          orderId: oid,
          items: [],
        };
      }

      grouped[key].items.push({
        orderItemId: item.order_items.orderItemId,
        dishId: item.order_items.dishId,
        quantity: item.order_items.quantity,
        dishName: item.dishes.dishName,
        price: item.dishes.price,
        imageUrl: item.dishes.imageUrl,
        note: item.order_items.note,
      });
    });

    res.json(Object.values(grouped));
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/orderbeingprocessed/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const ordersList = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.userId, parseInt(userId)),
          ne(orders.status, "Hoàn thành"),
          ne(orders.status, "Giỏ hàng")
        )
      );

    if (ordersList.length === 0) return res.json([]);

    const orderIds = ordersList.map((order) => order.orderId);

    const flatList = await db
      .select({
        orderItemId: orderItems.orderItemId,
        quantity: orderItems.quantity,
        dishId: dishes.dishId,
        dishName: dishes.dishName,
        dishPrice: dishes.price,
        dishImage: dishes.imageUrl,
        storeId: stores.storeId,
        storeName: stores.storeName,
        orderId: orders.orderId,
        orderStatus: orders.status,
        deliveryAddress: orders.deliveryAddress,
      })
      .from(orderItems)
      .innerJoin(dishes, eq(dishes.dishId, orderItems.dishId))
      .innerJoin(orders, eq(orders.orderId, orderItems.orderId))
      .innerJoin(stores, eq(stores.storeId, dishes.storeId))
      .where(inArray(orderItems.orderId, orderIds));

    // === GROUP BY orderId ===
    const grouped = {};

    flatList.forEach((item) => {
      const id = item.orderId;

      if (!grouped[id]) {
        grouped[id] = {
          orderId: id,
          orderStatus: item.orderStatus,
          deliveryAddress: item.deliveryAddress,
          storeId: item.storeId,
          storeName: item.storeName,
          items: [],
        };
      }

      grouped[id].items.push({
        orderItemId: item.orderItemId,
        dishId: item.dishId,
        dishName: item.dishName,
        dishPrice: item.dishPrice,
        dishImage: item.dishImage,
        quantity: item.quantity,
      });
    });

    const response = Object.values(grouped);

    res.json(response);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

/* Remove order items */
app.delete("/api/orderItem/:orderItemId", async (req, res) => {
  try {
    const { orderItemId } = req.params;

    if (!orderItemId) {
      return res.status(400).json({ message: "orderItemId is required" });
    }

    const result = await db
      .delete(orderItems)
      .where(eq(orderItems.orderItemId, parseInt(orderItemId)));

    if (result.rowsAffected === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy orderItem để xoá" });
    }

    res.json({
      success: true,
      message: "Xoá orderItem thành công",
      deletedId: orderItemId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server khi xoá orderItem" });
  }
});

/* Get suggest address */
app.get("/api/address", async (req, res) => {
  try {
    const results = await db.select().from(rooms);

    res.json(results);
  } catch (error) {
    res.status(500).json(error);
  }
});

function parseAddress(addr) {
  const match = addr.match(/^([A-Z]+)(\d+)\.(\d+)$/i);
  if (!match) return null;

  return {
    building: match[1].toUpperCase(),
    floor: Number(match[2]),
    room: Number(match[3]),
  };
}

const BUILDING_ORDER = ["A", "H", "B", "E", "X", "V", "D", "F", "T"];

function buildingsAreNear(b1, b2) {
  const i1 = BUILDING_ORDER.indexOf(b1);
  const i2 = BUILDING_ORDER.indexOf(b2);

  if (i1 === -1 || i2 === -1) return false;

  return Math.abs(i1 - i2) <= 2;
}

function isNearAddress(addr1, addr2) {
  const a = parseAddress(addr1);
  const b = parseAddress(addr2);

  if (!a || !b) return false;

  const nearBuilding = buildingsAreNear(a.building, b.building);
  if (nearBuilding) {
    if (a.floor === b.floor) {
      return true;
    } else {
      return Math.abs(a.floor - b.floor) <= 2;
    }
  } else return false;
}

app.get("/api/checkout/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Lấy các đơn đang chờ
    const pendingOrders = await db
      .select({
        orderId: orders.orderId,
        userId: orders.userId,
        storeId: stores.storeId,
        quantity: orderItems.quantity,
        dishId: orderItems.dishId,
        address: orders.deliveryAddress,
      })
      .from(orders)
      .innerJoin(orderItems, eq(orderItems.orderId, orders.orderId))
      .innerJoin(dishes, eq(dishes.dishId, orderItems.dishId))
      .innerJoin(stores, eq(stores.storeId, dishes.storeId))
      .where(and(eq(orders.status, "Đang chờ"), eq(orders.userId, userId)));

    if (pendingOrders.length === 0) {
      return res.json({ success: true, message: "Không có đơn để gộp" });
    }

    const storeGroups = {};
    pendingOrders.forEach((o) => {
      if (!storeGroups[o.storeId]) storeGroups[o.storeId] = [];
      storeGroups[o.storeId].push(o);
    });

    for (const storeId of Object.keys(storeGroups)) {
      const ordersInStore = storeGroups[storeId];

      let existingGroup = await db
        .select()
        .from(groupOrders)
        .where(
          and(
            eq(groupOrders.storeId, parseInt(storeId)),
            lt(groupOrders.sumOfQuantity, 3)
          )
        );

      let groupOrderId;

      if (existingGroup.length === 0) {
        /* const created = await db
          .insert(groupOrders)
          .values({
            storeId,
            sumOfQuantity: totalQuantity,
          })
          .returning({ groupOrderId: groupOrders.groupOrderId });

        groupOrderId = created[0].groupOrderId; */
      } else {
        groupOrderId = existingGroup[0].groupOrderId;

        const rows = await db
          .select({
            groupOrderId: groupOrders.groupOrderId,
            storeId: groupOrders.storeId,
            sumOfQuantity: groupOrders.sumOfQuantity,
            userId: groupOrderItems.userId,
            orderId: groupOrderItems.orderId,
          })
          .from(groupOrders)
          .innerJoin(
            groupOrderItems,
            eq(groupOrderItems.groupOrderId, groupOrders.groupOrderId)
          )
          .where(eq(groupOrders.groupOrderId, groupOrderId));

        const grouped = {};

        rows.forEach((row) => {
          const id = row.groupOrderId;
          if (!grouped[id]) {
            grouped[id] = {
              groupOrderId: row.groupOrderId,
              storeId: row.storeId,
              sumOfQuantity: row.sumOfQuantity,
              items: [],
            };
          }
          grouped[id].items.push({ orderId: row.orderId, userId: row.userId });
        });

        const orderGrouped = Object.values(grouped)[0];

        let orderIds = [];
        for (const item of orderGrouped.items) {
          if (!orderIds.includes(item.orderId)) orderIds.push(item.orderId);
        }

        const allOrders = await db
          .select()
          .from(orders)
          .where(inArray(orders.orderId, orderIds));

        let filterOrders = [];
        let addedOrderIds = [];
        for (let i = 0; i < allOrders.length - 1; i++) {
          for (let j = i + 1; j < allOrders.length; j++) {
            if (
              isNearAddress(
                allOrders[i].deliveryAddress,
                allOrders[j].deliveryAddress
              )
            ) {
              if (!addedOrderIds.has(allOrders[i].orderId)) {
                filterOrders.push(allOrders[i]);
                addedOrderIds.add(allOrders[i].orderId);
              }
              if (!addedOrderIds.has(allOrders[j].orderId)) {
                filterOrders.push(allOrders[j]);
                addedOrderIds.add(allOrders[j].orderId);
              }
            }
          }
        }

        console.log(filterOrders);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi tạo đơn hàng" });
  }
});

/* app.get("/api/checkout/:userId", async (req, res) => {
  try {
    /* const { userId, address, note } = req.body;

    const carts = await db
      .select()
      .from(orders)
      .where(
        and(eq(orders.userId, parseInt(userId)), eq(orders.status, "Giỏ hàng"))
      );

    if (carts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không có đơn giỏ hàng nào để thanh toán",
      });
    }

    for (const cart of carts) {
      await db
        .update(orders)
        .set({
          deliveryAddress: address,
          orderDate: new Date(Date.now() + 7 * 60 * 60 * 1000),
          note,
          status: "Đang chờ",
        })
        .where(eq(orders.orderId, cart.orderId));
    }
    
    const pendingOrders = await db
      .select({
        orderId: orders.orderId,
        userId: orders.userId,
        storeId: stores.storeId,
        quantity: orderItems.quantity,
        dishId: orderItems.dishId,
        deliveryAddress: orders.deliveryAddress,
      })
      .from(orders)
      .innerJoin(orderItems, eq(orderItems.orderId, orders.orderId))
      .innerJoin(dishes, eq(dishes.dishId, orderItems.dishId))
      .innerJoin(stores, eq(stores.storeId, dishes.storeId))
      .where(eq(orders.status, "Đang chờ"));

    if (pendingOrders.length === 0) {
      return res.json({ success: true, message: "Không có đơn để gộp" });
    }

    const storeGroups = {};
    pendingOrders.forEach((o) => {
      if (!storeGroups[o.storeId]) storeGroups[o.storeId] = [];
      storeGroups[o.storeId].push(o);
    });

    let allFilteredOrders = [];

    for (const storeId of Object.keys(storeGroups)) {
      const ordersInStore = storeGroups[storeId];

      let existingGroup = await db
        .select()
        .from(groupOrders)
        .where(
          and(
            eq(groupOrders.storeId, storeId),
            lt(groupOrders.sumOfQuantity, 3)
          )
        );

      let groupOrderId;

      if (existingGroup.length === 0) {
        /* const created = await db
          .insert(groupOrders)
          .values({
            storeId,
            sumOfQuantity: totalQuantity,
          })
          .returning({ groupOrderId: groupOrders.groupOrderId });

        groupOrderId = created[0].groupOrderId;
      } else {
        groupOrderId = existingGroup[0].groupOrderId;

        const rows = await db
          .select({
            groupOrderId: groupOrders.groupOrderId,
            storeId: groupOrders.storeId,
            sumOfQuantity: groupOrders.sumOfQuantity,
            userId: groupOrderItems.userId,
            orderId: groupOrderItems.orderId,
          })
          .from(groupOrders)
          .innerJoin(
            groupOrderItems,
            eq(groupOrderItems.groupOrderId, groupOrders.groupOrderId)
          )
          .where(eq(groupOrders.groupOrderId, groupOrderId));

        const grouped = {};

        rows.forEach((row) => {
          const id = row.groupOrderId;
          if (!grouped[id]) {
            grouped[id] = {
              groupOrderId: row.groupOrderId,
              storeId: row.storeId,
              sumOfQuantity: row.sumOfQuantity,
              items: [],
            };
          }
          grouped[id].items.push({ orderId: row.orderId, userId: row.userId });
        });

        const orderGrouped = Object.values(grouped)[0];

        let orderIds = [];
        for (const item of orderGrouped.items) {
          orderIds.push(item.orderId);
        }

        const orderNearest = await db
          .select()
          .from(orders)
          .where(inArray(orders.orderId, orderIds));

        let filterOrdersMap = new Map();

        for (let i = 0; i < orderNearest.length-1; i++) {
          for (let j = i + 1; j < orderNearest.length; j++) {
            const a = orderNearest[i];
            const b = orderNearest[j];

            if (isNearAddress(a.deliveryAddress, b.deliveryAddress)) {
              filterOrdersMap.set(a.orderId, a);
              filterOrdersMap.set(b.orderId, b);
            }
          }
        }

        const filterOrders = Array.from(filterOrdersMap.values());

        allFilteredOrders.push(...filterOrders);
      }
    }
    res.json(allFilteredOrders);

    /* 
        for (const u of uniqueUserLists) {
          const userToken = await db
            .select()
            .from(userPushTokens)
            .where(eq(userPushTokens.userId, u.userId));

          const token = userToken[0]?.token;

          if (token) {
            await expo.sendPushNotificationsAsync([
              {
                to: token,
                sound: "default",
                title: "Thông báo mới",
                body: `Đơn hàng #DH260${u.orderId} đã đủ điều kiện để giao đi!`,
                data: {},
              },
            ]);
          }

          await db
            .update(orders)
            .set({ status: "Đang chuẩn bị" })
            .where(eq(orders.orderId, u.orderId));
        }
      }
    }

    res.json({
      success: true,
      message: "Đặt hàng thành công",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi tạo đơn hàng" });
  }
}); */

app.get("/api/orderpending", async (req, res) => {
  try {
    const results = await db
      .select()
      .from(orders)
      .innerJoin(orderItems, eq(orderItems.orderId, orders.orderId))
      .innerJoin(dishes, eq(dishes.dishId, orderItems.dishId))
      .innerJoin(stores, eq(stores.storeId, dishes.storeId))
      .where(eq(orders.status, "Đang chờ"));

    res.status(200).json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lấy thông tin đơn hàng thất bại" });
  }
});

/* FAVORITES */
/* Add favorites */
app.get("/api/favorite/add/:userId/:dishId", async (req, res) => {
  try {
    const { userId, dishId } = req.params;

    const result = await db.insert(favorites).values({ dishId, userId });

    if (result.rowsAffected === 0)
      res.json({ success: false, message: "Thêm món yêu thích thất bại" });
    res.json({ success: true, message: "Thêm món yêu thích thành công" });
  } catch (error) {
    res.status(500).json(error);
  }
});

/* Remove favorites */
app.get("/api/favorite/remove/:userId/:dishId", async (req, res) => {
  try {
    const { userId, dishId } = req.params;

    const result = await db
      .delete(favorites)
      .where(and(eq(favorites.dishId, dishId), eq(favorites.userId, userId)));

    if (result.rowsAffected === 0)
      res.json({ success: false, message: "Xóa món yêu thích thất bại" });
    res.json({ success: true, message: "Xóa món yêu thích thành công" });
  } catch (error) {
    res.status(500).json(error);
  }
});

/* MESSAGE RUNNING */
app.listen(5001, () => {
  console.log("Server is running on PORT:", PORT);
});
