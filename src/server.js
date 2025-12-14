import express from "express";
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
  employees,
  reviews,
} from "./db/schema.js";
import {
  eq,
  ne,
  sql,
  and,
  ilike,
  or,
  isNull,
  desc,
  between,
  inArray,
} from "drizzle-orm";
import job from "./config/cron.js";
import jobCancel from "./config/cronCancelOrder.js";
import jobGroup from "./config/cronGroupOrder.js";
import jobOrder from "./config/cronOrderTimer.js";
import { Expo } from "expo-server-sdk";
import cors from "cors";
import authRouter from "./auth.js";

const app = express();
const PORT = ENV.PORT || 5001;

const expo = new Expo();

if (ENV.NODE_ENV === "production") {
  job.start();
  jobCancel.start();
  jobGroup.start();
  jobOrder.start();
}

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

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

async function generateOrderCode() {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
  );

  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");

  const datePart = `${yy}${mm}${dd}`;

  const todayPrefix = `DHB_${datePart}_`;

  const rows = await db
    .select()
    .from(orders)
    .where(ilike(orders.orderCode, `${todayPrefix}%`));

  const lastIndex =
    rows.length > 0
      ? Math.max(
          ...rows.map((r) => {
            const code = r.orderCode;
            if (!code) return 0;
            const m = String(code).match(/_(\d+)$/);
            return m ? Number(m[1]) : 0;
          })
        )
      : 0;

  const newIndex = lastIndex + 1;

  return `${todayPrefix}${newIndex.toString().padStart(3, "0")}`;
}

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
      .select({ ...dishes, storeName: stores.storeName })
      .from(dishes)
      .innerJoin(stores, eq(stores.storeId, dishes.storeId))
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
    const dishId = Number(req.params.dishId);
    const userId = Number(req.params.userId);

    const results = await db
      .select({
        ...dishes,

        avgRate: sql`
          COALESCE(AVG(${reviews.rate}), 0)
        `,

        reviews: sql`
          COALESCE(
            JSON_AGG(
              DISTINCT JSONB_BUILD_OBJECT(
                'reviewId', ${reviews.reviewId},
                'userName', ${users.fullName},
                'rate', ${reviews.rate},
                'content', ${reviews.content}
              )
            ) FILTER (WHERE ${reviews.reviewId} IS NOT NULL),
            '[]'
          )
        `,

        isFavorite: sql`
          CASE 
            WHEN ${favorites.favoriteId} IS NULL THEN false
            ELSE true
          END
        `,
      })
      .from(dishes)
      .leftJoin(reviews, eq(reviews.dishId, dishes.dishId))
      .leftJoin(users, eq(users.userId, reviews.userId))
      .leftJoin(
        favorites,
        and(eq(favorites.dishId, dishes.dishId), eq(favorites.userId, userId))
      )
      .where(and(eq(dishes.dishId, dishId), eq(dishes.status, "Active")))
      .groupBy(dishes.dishId, favorites.favoriteId);

    res.status(200).json(results[0] ?? null);
  } catch (error) {
    console.log("Error fetching the dish", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/ownerdishdetail/:dishId", async (req, res) => {
  try {
    const { dishId } = req.params;

    const results = await db
      .select({
        ...dishes,
        categoryId: categories.categoryId,
        categoryName: categories.categoryName,
      })
      .from(dishes)
      .innerJoin(categories, eq(categories.categoryId, dishes.categoryId))
      .where(eq(dishes.dishId, parseInt(dishId)));

    if (results.length === 0) res.json([]);

    res.json(results);
  } catch (error) {
    console.error(error);
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
      .innerJoin(users, eq(users.userId, userId))
      .where(eq(stores.userId, parseInt(userId)));

    res.status(200).json(results);
  } catch (error) {
    console.log("Error fetching the dishes", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/ownerupdatestatusdish/:dishId/:status", async (req, res) => {
  try {
    const { dishId, status } = req.params;

    const results = await db
      .update(dishes)
      .set({ status })
      .where(eq(dishes.dishId, parseInt(dishId)));

    res.json({
      success: results.rowsAffected !== 0 ? true : false,
      message:
        (status === "Active" ? "Mở" : "Khóa") +
        " món " +
        (results.rowsAffected !== 0 ? "thành công" : "thất bại"),
    });

    res.status(200).json(results);
  } catch (error) {
    console.log("Error fetching the dishes", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/ownerupdatestatusemployee/:userId/:status", async (req, res) => {
  try {
    const { userId, status } = req.params;

    const results = await db
      .update(users)
      .set({ status })
      .where(eq(users.userId, parseInt(userId)));

    res.json({
      success: results.rowsAffected !== 0 ? true : false,
      message:
        (status === "Active" ? "Mở" : "Khóa") +
        " nhân viên " +
        (results.rowsAffected !== 0 ? "thành công" : "thất bại"),
    });

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

app.post("/api/updatedishinfo", async (req, res) => {
  try {
    const { dishId, dishName, categoryId, price, description, image } =
      req.body;

    const rows = await db
      .select()
      .from(dishes)
      .where(eq(dishes.dishId, parseInt(dishId)));

    if (rows.length === 0) {
      return res.json({ success: false, message: "Dish not found" });
    }

    const oldData = rows[0];

    const updateData = {};

    if (dishName !== oldData.dishName) updateData.dishName = dishName;
    if (categoryId !== oldData.categoryId) updateData.categoryId = categoryId;
    if (price) updateData.price = price;
    if (description) updateData.description = description;
    if (image !== oldData.imageUrl) updateData.imageUrl = image;

    await db
      .update(dishes)
      .set({
        dishName: updateData.dishName,
        categoryId: updateData.categoryId,
        price: updateData.price,
        description: updateData.description,
        imageUrl: updateData.imageUrl,
      })
      .where(eq(dishes.dishId, parseInt(dishId)));

    res.json({ success: true, message: "Cập nhật thành công" });
  } catch (error) {
    console.log("Error update dish", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.post("/api/owneradddish", async (req, res) => {
  try {
    const { dishName, userId, categoryId, price, description, image } =
      req.body;

    const storeRecords = await db
      .select({ storeId: stores.storeId })
      .from(stores)
      .where(eq(stores.userId, parseInt(userId)))
      .limit(1);

    const storeId = storeRecords[0].storeId;

    const rows = await db.insert(dishes).values({
      dishName,
      storeId: parseInt(storeId),
      categoryId,
      price,
      description,
      imageUrl: image,
    });

    if (!rows) {
      return res.json({ success: false, message: "Thêm món mới thất bại" });
    }

    return res.json({ success: true, message: "Thêm món mới thành công" });
  } catch (error) {
    console.log("Error add dish", error);
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

app.get("/api/paymentinfo/:orderId/:userId/:role", async (req, res) => {
  try {
    const { orderId, userId, role } = req.params;

    if (role === "Owner") {
      const results = await db
        .select({
          orderCode: orders.orderCode,
          totalAmount: orders.totalAmount,
          bankName: stores.bankName,
          bankNumber: stores.bankNumber,
        })
        .from(users)
        .innerJoin(stores, eq(stores.userId, users.userId))
        .innerJoin(orders, eq(orders.orderId, parseInt(orderId)))
        .where(eq(users.userId, parseInt(userId)));

      res.status(200).json(results);
    }

    const results = await db
      .select()
      .from(users)
      .where(eq(users.userId, parseInt(userId)));

    res.status(200).json(results);
  } catch (error) {
    console.log("Error fetching the users", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/accountuser/:userId/:role", async (req, res) => {
  try {
    const { userId, role } = req.params;

    if (role === "Owner") {
      const results = await db
        .select({
          ...users,
          storeName: stores.storeName,
          location: stores.location,
          bankName: stores.bankName,
          bankNumber: stores.bankNumber,
        })
        .from(users)
        .innerJoin(stores, eq(stores.userId, users.userId))
        .where(eq(users.userId, parseInt(userId)));

      res.status(200).json(results);
    }

    const results = await db
      .select()
      .from(users)
      .where(eq(users.userId, parseInt(userId)));

    res.status(200).json(results);
  } catch (error) {
    console.log("Error fetching the users", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.post("/api/updateaccount", async (req, res) => {
  try {
    const {
      userId,
      fullName,
      email,
      phoneNumber,
      role,
      storeName,
      location,
      bankName,
      bankNumber,
    } = req.body;

    const resultUser = await db
      .update(users)
      .set({ fullName, email, phoneNumber })
      .where(eq(users.userId, parseInt(userId)));

    if (role === "Owner") {
      const resultStore = await db
        .update(stores)
        .set({ storeName, location, bankName, bankNumber })
        .where(eq(stores.userId, parseInt(userId)));
    }

    if (resultUser.rowsAffected === 0)
      res.json({
        success: false,
        message: "Cập nhật thông tin cá nhân thất bại",
      });

    res.json({
      success: true,
      message: "Cập nhật thông tin cá nhân thành công",
    });
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
        rateStar: dishes.rateStar,
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

app.get("/api/orderdetail/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    const rows = await db
      .select({
        orderId: orders.orderId,
        orderCode: orders.orderCode,
        orderStatus: orders.status,
        orderDate: orders.orderDate,
        totalAmount: orders.totalAmount,
        deliveryAddress: orders.deliveryAddress,

        orderItemId: orderItems.orderItemId,
        quantity: orderItems.quantity,

        dishId: dishes.dishId,
        dishName: dishes.dishName,
        dishPrice: dishes.price,
        dishImage: dishes.imageUrl,

        reviewId: reviews.reviewId,
      })
      .from(orders)
      .innerJoin(orderItems, eq(orderItems.orderId, orders.orderId))
      .innerJoin(dishes, eq(dishes.dishId, orderItems.dishId))
      .leftJoin(
        reviews,
        and(
          eq(reviews.dishId, orderItems.dishId),
          eq(reviews.orderId, orders.orderId)
        )
      )
      .where(eq(orders.orderId, parseInt(orderId)));

    const grouped = {};
    rows.forEach((row) => {
      if (!grouped[row.orderId]) {
        grouped[row.orderId] = {
          orderId: row.orderId,
          orderCode: row.orderCode,
          orderStatus: row.orderStatus,
          orderDate: row.orderDate,
          totalAmount: row.totalAmount,
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
        isReviewed: !!row.reviewId,
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
          ne(orders.status, "Bị hủy"),
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
        orderCode: orders.orderCode,
        orderStatus: orders.status,
        totalAmount: orders.totalAmount,
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
          orderCode: row.orderCode,
          orderStatus: row.orderStatus,
          totalAmount: row.totalAmount,
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
      .innerJoin(users, eq(users.userId, stores.userId))
      .where(
        and(
          status === "1"
            ? inArray(orders.status, [
                "Đang chờ",
                "Đang chuẩn bị",
                "Đang giao",
                "Đã đến",
              ])
            : status === "2"
            ? eq(orders.status, "Hoàn thành")
            : eq(orders.status, "Bị hủy"),
          eq(stores.userId, parseInt(userId))
        )
      );

    if (groups.length === 0) {
      return res.json([]);
    }

    const groupOrderIds = groups.map((go) => go.orders.orderId);

    const rows = await db
      .select({
        orderId: orders.orderId,
        orderCode: orders.orderCode,
        orderStatus: orders.status,
        orderDate: orders.orderDate,
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
          orderCode: row.orderCode,
          orderStatus: row.orderStatus,
          orderDate: row.orderDate,
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

app.get("/api/employees/:ownerId", async (req, res) => {
  try {
    const { ownerId } = req.params;

    const results = await db
      .select({ ...employees })
      .from(stores)
      .innerJoin(users, eq(users.userId, stores.userId))
      .innerJoin(employees, eq(employees.storeId, stores.storeId))
      .where(eq(stores.userId, parseInt(ownerId)));

    if (results.length === 0) res.json([]);
    const employeeResults = await db
      .select({
        ...employees,
        fullName: users.fullName,
        email: users.email,
        phoneNumber: users.phoneNumber,
        status: users.status,
      })
      .from(employees)
      .innerJoin(users, eq(users.userId, employees.userId))
      .where(
        inArray(
          employees.employeeId,
          results.map((r) => r.employeeId)
        )
      );

    res.json(employeeResults);
  } catch (error) {
    console.log(error);
  }
});

app.post("/api/employee/add", async (req, res) => {
  try {
    const { ownerId } = req.body;

    const results = await db
      .select({ storeId: stores.storeId })
      .from(stores)
      .innerJoin(users, eq(users.userId, stores.userId))
      .where(eq(stores.userId, parseInt(ownerId)));

    if (results.length === 0) res.json([]);

    const storeId = results[0].storeId;

    const lastUser = await db
      .select()
      .from(users)
      .orderBy(desc(users.userId))
      .limit(1);

    if (lastUser.length === 0) {
      return res.json({ success: false, message: "Không tìm thấy user mới." });
    }

    const lastUserId = lastUser[0].userId;

    await db.insert(employees).values({
      storeId,
      userId: lastUserId,
    });

    res.json({ success: true, message: "Thêm nhân viên thành công" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Thêm nhân viên thất bại" });
  }
});

const orderStatus = [
  "Giỏ hàng",
  "Đang chờ",
  "Đang chuẩn bị",
  "Đang giao",
  "Đã đến",
  "Hoàn thành",
  "Bị hủy",
];

app.post("/api/updateorderowner", async (req, res) => {
  try {
    const { orderId, paymentMethod, status } = req.body;

    const newStatus = orderStatus[parseInt(status) + 1];

    const result = await db
      .update(orders)
      .set({ paymentMethod, status: newStatus })
      .where(eq(orders.orderId, parseInt(orderId)));

    if (result.rowsAffected === 0)
      res.json({
        success: false,
        message: "Cập nhật trạng thái đơn hàng thất bại",
      });

    if (newStatus === "Hoàn thành") {
      const results = await db
        .select({
          dishId: orderItems.dishId,
          quantity: orderItems.quantity,
        })
        .from(orders)
        .innerJoin(orderItems, eq(orderItems.orderId, orders.orderId))
        .where(eq(orders.orderId, parseInt(orderId)));

      for (const item of results) {
        await db
          .update(dishes)
          .set({
            selled: sql`${dishes.selled} + ${item.quantity}`,
          })
          .where(eq(dishes.dishId, item.dishId));
      }
    }

    res.json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công",
    });
  } catch (error) {
    console.error(error);
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
      const orderDate = new Date(Date.now() + 7 * 60 * 60 * 1000);
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
          ne(orders.status, "Bị hủy"),
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

app.post("/api/checkout", async (req, res) => {
  try {
    const { userId, address, timer, note } = req.body;

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
    } else {
      const orderCode = await generateOrderCode();
      const orderDate = new Date(Date.now() + 7 * 60 * 60 * 1000);
      for (const cart of carts) {
        await db
          .update(orders)
          .set({
            orderCode,
            orderDate,
            deliveryAddress: address,
            timer,
            note,
            status: "Đang chờ",
          })
          .where(eq(orders.orderId, parseInt(cart.orderId)));
      }
    }

    res.json({ success: true, message: "Đặt hàng thành công" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/notifycation/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const results = await db
      .select({
        dishId: dishes.dishId,
        dishName: dishes.dishName,
        count: sql`COUNT(DISTINCT ${orders.userId})`.as("count"),
      })
      .from(orders)
      .innerJoin(orderItems, eq(orderItems.orderId, orders.orderId))
      .innerJoin(dishes, eq(dishes.dishId, orderItems.dishId))
      .where(
        and(eq(orders.status, "Đang chờ"), ne(orders.userId, parseInt(userId)))
      )
      .groupBy(dishes.dishId, dishes.dishName);

    res.json(results);
  } catch (error) {
    console.log("Lấy thông báo thất bại: ", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

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

    const existingFavorite = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, parseInt(userId)),
          eq(favorites.dishId, parseInt(dishId))
        )
      );

    if (existingFavorite.length === 0) {
      const result = await db.insert(favorites).values({ dishId, userId });

      if (result.rowsAffected === 0)
        res.json({ success: false, message: "Thêm món yêu thích thất bại" });
      res.json({ success: true, message: "Thêm món yêu thích thành công" });
    }
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

app.post("/api/revenue", async (req, res) => {
  try {
    const { userId, start, end } = req.body;

    const startDate = new Date(`${start}T00:00:00+07:00`);
    const endDate = new Date(`${end}T23:59:59+07:00`);

    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).json({ error: "Ngày không hợp lệ" });
    }

    const results = await db
      .select({ date: orders.orderDate, revenue: orders.totalAmount })
      .from(orders)
      .innerJoin(orderItems, eq(orderItems.orderId, orders.orderId))
      .innerJoin(dishes, eq(dishes.dishId, orderItems.dishId))
      .innerJoin(stores, eq(stores.storeId, dishes.storeId))
      .where(
        and(
          eq(orders.status, "Hoàn thành"),
          between(orders.orderDate, startDate, endDate),
          eq(stores.userId, parseInt(userId))
        )
      );

    const summary = {};

    results.forEach((item) => {
      const day = item.date.toISOString().split("T")[0];

      if (!summary[day]) {
        summary[day] = {
          date: day,
          totalRevenue: 0,
          totalOrders: 0,
        };
      }

      summary[day].totalRevenue += Number(item.revenue);
      summary[day].totalOrders += 1;
    });

    res.status(200).json(Object.values(summary));
  } catch (error) {
    console.log("Error fetching the orders", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.post("/api/topdishes", async (req, res) => {
  try {
    const { userId, start, end } = req.body;

    const startDate = new Date(`${start}T00:00:00+07:00`);
    const endDate = new Date(`${end}T23:59:59+07:00`);

    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).json({ error: "Ngày không hợp lệ" });
    }

    // Lấy các món thuộc đơn hàng hoàn thành
    const results = await db
      .select({
        dishId: dishes.dishId,
        dishName: dishes.dishName,
        totalQuantity: orderItems.quantity,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orders.orderId, orderItems.orderId))
      .innerJoin(dishes, eq(dishes.dishId, orderItems.dishId))
      .innerJoin(stores, eq(stores.storeId, dishes.storeId))
      .where(
        and(
          eq(orders.status, "Hoàn thành"),
          between(orders.orderDate, startDate, endDate),
          eq(stores.userId, Number(userId))
        )
      );

    // Gom nhóm theo món ăn
    const summary = {};

    results.forEach((item) => {
      if (!summary[item.dishId]) {
        summary[item.dishId] = {
          dishId: item.dishId,
          dishName: item.dishName,
          quantity: 0,
        };
      }
      summary[item.dishId].quantity += item.totalQuantity;
    });

    // Chuyển sang array và sắp xếp
    const topDishes = Object.values(summary)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    res.status(200).json(topDishes);
  } catch (error) {
    console.error("Error fetching top dishes:", error);
    res.status(500).json({ error: "Có lỗi xảy ra khi lấy top món" });
  }
});

app.post("/api/topcategories", async (req, res) => {
  try {
    const { userId, start, end } = req.body;

    const startDate = new Date(`${start}T00:00:00+07:00`);
    const endDate = new Date(`${end}T23:59:59+07:00`);

    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).json({ error: "Ngày không hợp lệ" });
    }

    const results = await db
      .select({
        categoryId: categories.categoryId,
        categoryName: categories.categoryName,
        quantity: sql`COALESCE(SUM(${orderItems.quantity}), 0)`,
      })
      .from(categories)
      .leftJoin(dishes, eq(dishes.categoryId, categories.categoryId))
      .leftJoin(
        stores,
        and(
          eq(stores.storeId, dishes.storeId),
          eq(stores.userId, parseInt(userId))
        )
      )
      .leftJoin(orderItems, eq(orderItems.dishId, dishes.dishId))
      .leftJoin(
        orders,
        and(
          eq(orders.orderId, orderItems.orderId),
          eq(orders.status, "Hoàn thành"),
          between(orders.orderDate, startDate, endDate)
        )
      )
      .groupBy(categories.categoryId)
      .orderBy(categories.categoryId);

    res.status(200).json(results);
  } catch (error) {
    console.log("Error fetching top categories", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.post("/api/addreview", async (req, res) => {
  try {
    const reviewsPayload = req.body;

    if (!Array.isArray(reviewsPayload) || reviewsPayload.length === 0) {
      return res.json({
        success: false,
        message: "Payload không hợp lệ",
      });
    }

    const values = reviewsPayload.map((item) => {
      if (!item.userId || !item.dishId || !item.rating || !item.orderId) {
        throw new Error("Thiếu dữ liệu review");
      }

      return {
        userId: item.userId,
        dishId: item.dishId,
        orderId: Number(item.orderId),
        rate: item.rating,
        content: item.content || "",
      };
    });

    // 1. Insert review
    await db.insert(reviews).values(values);

    // 2. Lấy danh sách dishId cần update
    const dishIds = [...new Set(values.map((v) => v.dishId))];

    // 3. Update rateStar cho từng món
    for (const dishId of dishIds) {
      const avgResult = await db
        .select({
          avgRate: sql`COALESCE(AVG(${reviews.rate}), 0)`,
        })
        .from(reviews)
        .where(eq(reviews.dishId, dishId));

      const avgRate = Number(avgResult[0]?.avgRate || 0).toFixed(1);

      await db
        .update(dishes)
        .set({ rateStar: avgRate })
        .where(eq(dishes.dishId, dishId));
    }

    res.json({
      success: true,
      message: "Thêm đánh giá thành công",
    });
  } catch (error) {
    console.error("Add review error:", error);
    res.json({
      success: false,
      message: "Thêm đánh giá thất bại",
    });
  }
});

/* MESSAGE RUNNING */
app.listen(5001, () => {
  console.log("Server is running on PORT:", PORT);
});
