CREATE TABLE "categories" (
	"category_id" integer PRIMARY KEY NOT NULL,
	"category_name" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dishes" (
	"dish_id" integer PRIMARY KEY NOT NULL,
	"dish_name" varchar NOT NULL,
	"menu_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"description" varchar,
	"image_url" varchar,
	"status" varchar DEFAULT 'Active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menus" (
	"menu_id" integer PRIMARY KEY NOT NULL,
	"store_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"order_item_id" integer PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"dish_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"order_id" integer PRIMARY KEY NOT NULL,
	"order_date" timestamp DEFAULT now() NOT NULL,
	"store_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"payment_method" varchar DEFAULT 'Cash' NOT NULL,
	"status" varchar DEFAULT 'Pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stores" (
	"store_id" integer PRIMARY KEY NOT NULL,
	"store_name" varchar NOT NULL,
	"location" varchar NOT NULL,
	"phone_number" varchar NOT NULL,
	"logo_url" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"status" varchar DEFAULT 'Active' NOT NULL,
	CONSTRAINT "stores_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"full_name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone_number" varchar NOT NULL,
	"password" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"status" varchar DEFAULT 'Active' NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_number_unique" UNIQUE("phone_number")
);
