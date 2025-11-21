import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "./config/db.js";
import { users } from "./db/schema.js";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "secretkey123";
const SALT_ROUNDS = 10;

// Tạo token
function signToken(user) {
  return jwt.sign(
    { id: user.userId, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// ---------------- REGISTER ------------------
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password } = req.body;

    if (!fullName || !email || !phoneNumber || !password) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const exist = await db.select().from(users).where(eq(users.email, email));
    if (exist.length > 0) {
      return res.status(409).json({ success: false, message: "Email exists" });
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  
    const date = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);
    
    const inserted = await db
      .insert(users)
      .values({ fullName, email, phoneNumber, password: hashed, createdAt: date })
      .returning();

    const user = inserted[0];

    res.status(201).json({
      success: true,
      user: {
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ---------------- LOGIN ------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const results = await db.select().from(users).where(eq(users.email, email));
    if (results.length === 0) {
      return res.status(401).json({ success: false, message: "Email not found" });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Wrong password" });
    }

    const token = signToken(user);

    res.json({
      success: true,
      token,
      user: {
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ---------------- Middleware bảo vệ ------------------
export function protect(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const token = auth.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
}

export default router;
