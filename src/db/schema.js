import { pgTable, numeric, varchar, integer, timestamp } from "drizzle-orm/pg-core";

export const dishes = pgTable("dishes", {
  dishId: integer("dish_id").primaryKey(),
  dishName: varchar("dish_name").notNull(),
  menuId: integer("menu_id").notNull(),
  categoryId: integer("category_id").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  description: varchar("description"),
  imageUrl: varchar("image_url"),
  status: varchar("status").notNull().default("Active"),
});

export const menus = pgTable("menus", {
  menuId: integer("menu_id").primaryKey(),
  storeId: integer("store_id").notNull(),
});

export const categories = pgTable("categories", {
  categoryId: integer("category_id").primaryKey(),
  categoryName: varchar("category_name").notNull(),
});

export const users = pgTable("users", {
  userId: integer("user_id").primaryKey(),
  fullName: varchar("full_name").notNull(),
  email: varchar("email").notNull().unique(),
  phoneNumber: varchar("phone_number").notNull().unique(),
  password: varchar("password").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  status: varchar("status").notNull().default("Active"),
});

export const stores = pgTable("stores", {
  storeId: integer("store_id").primaryKey(),
  storeName: varchar("store_name").notNull(),
  location: varchar("location").notNull(),
  phoneNumber: varchar("phone_number").notNull().unique(),
  logoUrl: varchar("logo_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  status: varchar("status").notNull().default("Active"),
});

export const orders = pgTable("orders", {
  orderId: integer("order_id").primaryKey(),
  orderDate: timestamp("order_date").notNull().defaultNow(),
  storeId: integer("store_id").notNull(),
  userId: integer("user_id").notNull(),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method").notNull().default("Cash"),
  status: varchar("status").notNull().default("Pending"),
});

export const orderItems = pgTable("order_items", {
  orderItemId: integer("order_item_id").primaryKey(),
  orderId: integer("order_id").notNull(),
  dishId: integer("dish_id").notNull(),
});