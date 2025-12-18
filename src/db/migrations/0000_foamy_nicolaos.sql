CREATE TABLE "categories" (
	"category_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "categories_category_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"category_name" varchar NOT NULL,
	"category_icon" varchar
);
--> statement-breakpoint
CREATE TABLE "dishes" (
	"dish_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "dishes_dish_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"dish_name" varchar NOT NULL,
	"store_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"price" numeric(10, 3),
	"description" varchar,
	"image_url" text,
	"rate_star" numeric DEFAULT 5 NOT NULL,
	"selled" integer DEFAULT 0 NOT NULL,
	"availability" integer NOT NULL,
	"status" varchar DEFAULT 'Active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"employee_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "employees_employee_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"store_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"favorite_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "favorites_favorite_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"dish_id" integer NOT NULL,
	"user_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "group_order_items" (
	"group_order_item_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "group_order_items_group_order_item_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"group_order_id" integer NOT NULL,
	"order_id" integer NOT NULL,
	"user_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "group_orders" (
	"group_order_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "group_orders_group_order_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"store_id" integer NOT NULL,
	"sum_of_quantity" integer NOT NULL,
	"delivery_area" varchar
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"order_item_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "order_items_order_item_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"order_id" integer NOT NULL,
	"dish_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"note" varchar
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"order_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "orders_order_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"order_code" varchar,
	"order_date" timestamp DEFAULT now() NOT NULL,
	"user_id" integer NOT NULL,
	"total_amount" numeric(10, 3) NOT NULL,
	"payment_method" varchar DEFAULT 'Cash' NOT NULL,
	"note" varchar,
	"delivery_address" varchar,
	"timer" varchar DEFAULT 'Giao ngay' NOT NULL,
	"status" varchar DEFAULT 'Pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"refresh_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "refresh_tokens_refresh_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"token" text NOT NULL,
	"user_id" integer NOT NULL,
	"revoked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp NOT NULL,
	"replaced_by" text,
	"otp" varchar,
	CONSTRAINT "refresh_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"review_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "reviews_review_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer,
	"dish_id" integer,
	"rate" numeric,
	"content" varchar,
	"order_id" integer
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"room_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "rooms_room_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"building" varchar,
	"floor" varchar,
	"room" varchar
);
--> statement-breakpoint
CREATE TABLE "stores" (
	"store_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "stores_store_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"store_name" varchar NOT NULL,
	"location" varchar NOT NULL,
	"logo_url" varchar,
	"bank_number" varchar,
	"bank_name" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"user_id" integer,
	"status" varchar DEFAULT 'Active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_push_tokens" (
	"user_push_token_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_push_tokens_user_push_token_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"token" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_user_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"full_name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone_number" varchar NOT NULL,
	"password" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"role" varchar DEFAULT 'Customer' NOT NULL,
	"status" varchar DEFAULT 'Active' NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_number_unique" UNIQUE("phone_number")
);
