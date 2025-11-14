import express from "express";
import { ENV } from "./config/env.js";
import { db } from "./config/db.js";
import { dishes, menus, categories, users, stores, orders, orderItems } from "./db/schema.js";
import { eq, and } from "drizzle-orm";
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
    const { dishName, menuId, categoryId, price, description, imageUrl, status } = req.body;

    if (!userId || !recipeId || !title) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newDish = await db
      .insert(dishes)
      .values({
        dishName,
        menuId,
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

    const resultsSearch = await db
      .select()
      .from(dishes)
      .where(eq(dishes.dishName.toLocaleLowerCase(), query.toLocaleLowerCase()));

    res.status(200).json(resultsSearch);
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
})

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
