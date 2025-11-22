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
} from "./db/schema.js";
import { eq, and, ilike, desc, between, inArray } from "drizzle-orm";
import job from "./config/cron.js";
import cors from "cors";
import authRouter, { protect } from "./auth.js";

const app = express();
const PORT = ENV.PORT || 5001;

if (ENV.NODE_ENV === "production") job.start();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

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
app.get("/api/dish/:dishId", async (req, res) => {
  try {
    const { dishId } = req.params;

    const results = await db
      .select()
      .from(dishes)
      .where(
        and(eq(dishes.dishId, parseInt(dishId)), eq(dishes.status, "Active"))
      );

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
          eq(orders.status, "Success"),
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
app.get("/api/orders", async (req, res) => {
  try {
    const results = await db.select().from(orders);

    res.status(200).json(results);
  } catch (error) {
    console.log("Error fetching the orders", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/* Add to cart */
app.post("/api/cart/add", async (req, res) => {
  try {
    const { userId, dishId, quantity } = req.body;
    
    if (!userId || !dishId || !quantity) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const [cart] = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .where(eq(orders.status, "Cart"));

    let orderId;

    if (!cart) {
      const orderDate = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);

      await db.insert(orders).values({
        orderDate,
        userId,
        totalAmount: 0,
        status: "Cart",
      });

      orderId = await db
        .select(orderId)
        .from(orders)
        .orderBy(desc(orders.orderId))[0];
    } else {
      orderId = cart.orderId;
    }
    
    const existingItem = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId))
      .where(eq(orderItems.dishId, dishId));
      
    if (existingItem.length > 0) {
      const currentQty = existingItem[0].quantity;

      await db
        .update(orderItems)
        .set({ quantity: currentQty + quantity })
        .where(eq(orderItems.orderItemId, existingItem[0].orderItemId));

      return res.json({
        message: "Updated item quantity",
        orderId,
      });
    } else {
      await db.insert(orderItems).values({
        orderId,
        dishId,
        quantity,
      });

      res.json({
        message: "Added new item to cart",
        orderId,
      });
    }
  } catch (error) {
    console.log("Error adding to cart", error);
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
        and(eq(orders.userId, parseInt(userId)), eq(orders.status, "Cart"))
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

/* MESSAGE RUNNING */
app.listen(5001, () => {
  console.log("Server is running on PORT:", PORT);
});
