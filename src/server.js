import express from "express";
import { ENV } from "./config/env.js";
import { db } from "./config/db.js";
import { dishes, categories, users, stores, orders, orderItems } from "./db/schema.js";
import { eq, and, ilike } from "drizzle-orm";
import job from "./config/cron.js";
import cors from "cors";

const app = express();
const PORT = ENV.PORT || 5001;

if (ENV.NODE_ENV === "production") job.start();

app.use(cors());
app.use(express.json());

/* Test */
app.get("/api/banana", (req, res) => {
  res.status(200).json({ success: true });
});

/* Insert into dishes table */
app.post("/api/dishes", async (req, res) => {
  try {
    const { dishName, storeId, categoryId, price, description, imageUrl, status } = req.body;

    if (!userId || !recipeId || !title) {
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
        status
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
      .where(ilike(dishes.dishName, q));

    res.status(200).json(resultsSearch);
  } catch (error) {
    console.log("Error fetching the dishes", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/* Filter dish by category */
app.get("/api/category/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;

    const results = await db
      .select()
      .from(dishes)
      .where(eq(dishes.categoryId, parseInt(categoryId)));

    res.status(200).json(results);
  } catch (error) {
    console.log("Error fetching the dishes", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/* Select dishes table */
app.get("/api/dishes", async (req, res) => {
  try {
    const results = await db.select().from(dishes);

    res.status(200).json(results);
  } catch (error) {
    console.log("Error fetching the dishes", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/* Select categories table */
app.get("/api/categories", async (req, res) => {
  try {
    const results = await db.select().from(categories);

    res.status(200).json(results);
  } catch (error) {
    console.log("Error fetching the categories", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/* Select stores table */
app.get("/api/stores", async (req, res) => {
  try {
    const results = await db.select().from(stores);

    res.status(200).json(results);
  } catch (error) {
    console.log("Error fetching the dishes", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/* Select users table */
app.get("/api/users", async (req, res) => {
  try {
    const results = await db
      .select()
      .from(users);

    res.status(200).json(results);
  } catch (error) {
    console.log("Error fetching the users", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/* Login */
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const results = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.email, email),
          eq(users.password, password)
        )
      );

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    res.status(200).json({
      success: true,
      user: results[0],
    });
  } catch (error) {
    console.log("Error fetching the users", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/* Delete dishes table */
app.delete("/api/dishes/:dishId", async (req, res) => {
  try {
    const { dishId } = req.params;

    await db
      .delete(dishes)
      .where(eq(dishes.dishId, parseInt(dishId)));

    res.status(200).json({ message: "Dish deleted successfully" });
  } catch (error) {
    console.log("Error removing a favorite", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(5001, () => {
  console.log("Server is running on PORT:", PORT);
});
