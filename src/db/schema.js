import { pgTable, numeric, varchar, integer } from "drizzle-orm/pg-core";

export const dishes = pgTable("favorites", {
  dishId: numeric("dish_id").primaryKey(),
  dishName: varchar("dish_name").notNull(),
  menuId: integer("menu_id").notNull(),
  categoryId: integer("category_id").notNull(),
  price: numeric("price"),
  description: varchar("description"),
  imageUrl: varchar("image_url"),
  status: varchar("status"),
});
