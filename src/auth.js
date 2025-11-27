import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "./config/db.js";
import { users, refreshTokens } from "./db/schema.js"; // thêm refreshTokens schema
import { eq } from "drizzle-orm";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config();
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET; // ACCESS token secret
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET; // REFRESH token secret
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "10");

if (!JWT_SECRET || !REFRESH_SECRET) {
  console.error("JWT_SECRET and REFRESH_TOKEN_SECRET must be set in .env");
  process.exit(1);
}

// Expirations (config via env)
const ACCESS_EXPIRES = process.env.ACCESS_EXPIRES || "15m"; // e.g. 15m
const REFRESH_EXPIRES = process.env.REFRESH_EXPIRES || "30d"; // e.g. 30d

/* ---------------- Helpers ---------------- */
function signAccessToken(user) {
  // include small payload; add role if needed
  return jwt.sign(
    {
      id: user.userId,
      email: user.email,
      role: user.role,
      jti: uuidv4(),
    },
    JWT_SECRET,
    { expiresIn: ACCESS_EXPIRES }
  );
}

function signRefreshToken(user, jti) {
  // include jti to be able to rotate / track
  return jwt.sign(
    {
      id: user.userId,
      jti,
    },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES }
  );
}

async function saveRefreshTokenToDB(token, userId, expiresAt, replacedBy = null) {
  // db.insert(refreshTokens)... using your drizzle schema for refresh_tokens
  return await db
    .insert(refreshTokens)
    .values({
      token,
      userId,
      expiresAt,
      replacedBy,
      revoked: false,
    })
    .returning();
}

async function revokeRefreshTokenInDB(token, replacedBy = null) {
  await db
    .update(refreshTokens)
    .set({ revoked: true, replacedBy })
    .where(eq(refreshTokens.token, token));
}

async function findRefreshTokenInDB(token) {
  const rows = await db.select().from(refreshTokens).where(eq(refreshTokens.token, token));
  return rows.length ? rows[0] : null;
}

/* ---------------- REGISTER ------------------ */
router.post("/register", async (req, res) => {
  try {
    let { fullName, email, phoneNumber, password, role } = req.body;

    if (!role) role = "Customer";

    if (!fullName || !email || !phoneNumber || !password) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    email = email.trim().toLowerCase();

    const exist = await db.select().from(users).where(eq(users.email, email));
    if (exist.length > 0) {
      return res.status(409).json({ success: false, message: "Email exists" });
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const date = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);

    const inserted = await db
      .insert(users)
      .values({
        fullName,
        email,
        phoneNumber,
        password: hashed,
        role,
        createdAt: date,
      })
      .returning();

    const user = inserted[0];

    // Optionally, issue tokens immediately (auto-login)
    res.status(201).json({
      success: true,
      message: "Register success"
    });

    // compute expiresAt timestamp for refresh token (Date)
    const refreshExpiryDate = new Date(Date.now() + parseRefreshExpiryToMs(REFRESH_EXPIRES));

    await saveRefreshTokenToDB(refreshToken, user.userId, refreshExpiryDate);

    res.status(201).json({
      success: true,
      user: {
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
      },
      token: accessToken,
      refreshToken, // mobile: store in SecureStore
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ---------------- LOGIN ------------------ */
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }
    email = email.trim().toLowerCase();

    const results = await db.select().from(users).where(eq(users.email, email));
    if (results.length === 0) {
      // security: you can return generic message "Invalid credentials"
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const accessToken = signAccessToken(user);

    // Create refresh token (rotation) and store in DB
    const refreshJti = uuidv4();
    const refreshToken = signRefreshToken(user, refreshJti);
    const refreshExpiryDate = new Date(Date.now() + parseRefreshExpiryToMs(REFRESH_EXPIRES));

    await saveRefreshTokenToDB(refreshToken, user.userId, refreshExpiryDate);

    res.json({
      success: true,
      token: accessToken,
      refreshToken,
      user: {
        userId: user.userId,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ---------------- REFRESH TOKEN ------------------ */
router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: "Missing refreshToken" });

    // verify signature
    let payload;
    try {
      payload = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }

    // check db record
    const dbToken = await findRefreshTokenInDB(refreshToken);
    if (!dbToken) {
      return res.status(401).json({ success: false, message: "Refresh token not found" });
    }

    if (dbToken.revoked) {
      return res.status(401).json({ success: false, message: "Refresh token revoked" });
    }

    // check expiry (DB) just in case
    if (new Date(dbToken.expiresAt) < new Date()) {
      return res.status(401).json({ success: false, message: "Refresh token expired" });
    }

    // All good -> rotate: revoke old token and issue new refresh + new access
    // revoke old
    await revokeRefreshTokenInDB(refreshToken);

    // fetch user
    const userRows = await db.select().from(users).where(eq(users.userId, payload.id));
    if (!userRows.length) {
      return res.status(401).json({ success: false, message: "User no longer exists" });
    }
    const user = userRows[0];

    const newAccessToken = signAccessToken(user);
    const newJti = uuidv4();
    const newRefreshToken = signRefreshToken(user, newJti);
    const newRefreshExpiry = new Date(Date.now() + parseRefreshExpiryToMs(REFRESH_EXPIRES));

    // Save new refresh token to DB
    await saveRefreshTokenToDB(newRefreshToken, user.userId, newRefreshExpiry, null);

    res.json({
      success: true,
      token: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    console.error("REFRESH TOKEN ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ---------------- LOGOUT (revoke refresh token) ------------------ */
router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: "Missing refreshToken" });

    const dbToken = await findRefreshTokenInDB(refreshToken);
    if (!dbToken) {
      return res.json({ success: true, message: "Logged out" }); // idempotent
    }

    await revokeRefreshTokenInDB(refreshToken);
    res.json({ success: true, message: "Logged out" });
  } catch (err) {
    console.error("LOGOUT ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ---------------- Đặt lại mật khẩu ------------------ */
router.post("/change-password", protect, async (req, res) => {
  try {
    const userId = req.user.id;  // từ middleware protect
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    // Lấy user từ DB
    const userRows = await db.select().from(users).where(eq(users.userId, userId));
    if (!userRows.length) return res.status(404).json({ success: false, message: "User not found" });
    const user = userRows[0];

    // So sánh password hiện tại
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(401).json({ success: false, message: "Mật khẩu hiện tại không đúng" });

    // Hash mật khẩu mới
    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password
    await db.update(users).set({ password: hashed }).where(eq(users.userId, userId));

    // Optionally: revoke tất cả refresh tokens
    await db.update(refreshTokens).set({ revoked: true }).where(eq(refreshTokens.userId, userId));

    res.json({ success: true, message: "Đổi mật khẩu thành công" });
  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ---------------- Quên mật khẩu ------------------ */
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ success: false, message: "Missing fields" });

  try {
    const resets = await db.select().from(passwordResetsTable).where(eq(passwordResetsTable.token, token));
    if (!resets.length) return res.status(400).json({ success: false, message: "Token invalid" });

    const reset = resets[0];
    if (isBefore(new Date(reset.expires), new Date())) return res.status(400).json({ success: false, message: "Token expired" });

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await db.update(usersTable).set({ password: hashed }).where(eq(usersTable.userId, reset.userId));

    // Xóa token sau khi reset
    await db.delete(passwordResetsTable).where(eq(passwordResetsTable.id, reset.id));

    res.json({ success: true, message: "Mật khẩu đã được đặt lại thành công" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ---------------- Middleware bảo vệ ------------------ */
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

/* ---------------- Utility: parse expiry to ms ---------------- */
function parseRefreshExpiryToMs(expStr) {
  // expStr examples: "30d", "15m"
  const num = parseInt(expStr.slice(0, -1));
  const unit = expStr.slice(-1);

  switch (unit) {
    case "d":
      return num * 24 * 60 * 60 * 1000;
    case "h":
      return num * 60 * 60 * 1000;
    case "m":
      return num * 60 * 1000;
    case "s":
      return num * 1000;
    default:
      // default to days if unknown
      return num * 24 * 60 * 60 * 1000;
  }
}
