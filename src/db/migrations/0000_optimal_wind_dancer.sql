CREATE TABLE "dishes" (
	"dish_id" numeric PRIMARY KEY NOT NULL,
	"dish_name" varchar NOT NULL,
	"menu_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"price" numeric,
	"description" varchar,
	"image_url" varchar,
	"status" varchar
);
