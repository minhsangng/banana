import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "./config/db.js";
import { users, refreshTokens } from "./db/schema.js";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { sendEmail } from "./sendEmail.js";

dotenv.config();
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "10");

if (!JWT_SECRET || !REFRESH_SECRET) {
  console.error("JWT_SECRET and REFRESH_TOKEN_SECRET must be set in .env");
  process.exit(1);
}

// Expirations (config via env)
const ACCESS_EXPIRES = process.env.ACCESS_EXPIRES || "15m";
const REFRESH_EXPIRES = process.env.REFRESH_EXPIRES || "30d";

/* ---------------- Helpers ---------------- */
function signAccessToken(user) {
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
  return jwt.sign(
    {
      id: user.userId,
      jti,
    },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES }
  );
}

async function saveRefreshTokenToDB(
  token,
  userId,
  expiresAt,
  replacedBy = null
) {
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
  const rows = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.token, token));
  return rows.length ? rows[0] : null;
}

/* ---------------- REGISTER ------------------ */
router.post("/register", async (req, res) => {
  try {
    let { fullName, email, phoneNumber, password, role } = req.body;

    if (!role || role !== "") role = "Customer";

    if (!fullName || !email || !phoneNumber || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
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

    const refreshExpiryDate = new Date(
      Date.now() + parseRefreshExpiryToMs(REFRESH_EXPIRES)
    );

    await saveRefreshTokenToDB(refreshToken, user.userId, refreshExpiryDate);

    res.status(201).json({
      success: true,
      user: {
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
      },
      token: accessToken,
      refreshToken,
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
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }
    email = email.trim().toLowerCase();

    const results = await db.select().from(users).where(eq(users.email, email));
    if (results.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const accessToken = signAccessToken(user);

    const refreshJti = uuidv4();
    const refreshToken = signRefreshToken(user, refreshJti);
    const refreshExpiryDate = new Date(
      Date.now() + parseRefreshExpiryToMs(REFRESH_EXPIRES)
    );

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
    if (!refreshToken)
      return res
        .status(400)
        .json({ success: false, message: "Missing refreshToken" });

    let payload;
    try {
      payload = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch (err) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });
    }

    const dbToken = await findRefreshTokenInDB(refreshToken);
    if (!dbToken) {
      return res
        .status(401)
        .json({ success: false, message: "Refresh token not found" });
    }

    if (dbToken.revoked) {
      return res
        .status(401)
        .json({ success: false, message: "Refresh token revoked" });
    }

    if (new Date(dbToken.expiresAt) < new Date()) {
      return res
        .status(401)
        .json({ success: false, message: "Refresh token expired" });
    }

    await revokeRefreshTokenInDB(refreshToken);

    const userRows = await db
      .select()
      .from(users)
      .where(eq(users.userId, payload.id));
    if (!userRows.length) {
      return res
        .status(401)
        .json({ success: false, message: "User no longer exists" });
    }
    const user = userRows[0];

    const newAccessToken = signAccessToken(user);
    const newJti = uuidv4();
    const newRefreshToken = signRefreshToken(user, newJti);
    const newRefreshExpiry = new Date(
      Date.now() + parseRefreshExpiryToMs(REFRESH_EXPIRES)
    );

    await saveRefreshTokenToDB(
      newRefreshToken,
      user.userId,
      newRefreshExpiry,
      null
    );

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
    if (!refreshToken)
      return res
        .status(400)
        .json({ success: false, message: "Missing refreshToken" });

    const dbToken = await findRefreshTokenInDB(refreshToken);
    if (!dbToken) {
      return res.json({ success: true, message: "Logged out" });
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
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Nhập đầy đủ mật khẩu" });
    }

    const userRows = await db
      .select()
      .from(users)
      .where(eq(users.userId, userId));
    if (!userRows.length)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    const user = userRows[0];

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match)
      return res
        .status(401)
        .json({ success: false, message: "Mật khẩu hiện tại không đúng" });

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await db
      .update(users)
      .set({ password: hashed })
      .where(eq(users.userId, userId));

    await db
      .update(refreshTokens)
      .set({ revoked: true })
      .where(eq(refreshTokens.userId, userId));

    res.json({ success: true, message: "Đổi mật khẩu thành công" });
  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ---------------- Quên mật khẩu ------------------ */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    
    const userRows = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()));

    if (!userRows.length) {
      return res.json({ success: true }); 
    }

    const user = userRows[0];

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await db.insert(refreshTokens).values({
      userId: user.userId,
      token: resetToken,
      expires
    });

    await sendEmail(
      email,
      "Mã khôi phục mật khẩu",
      `<h3>Mã OTP của bạn: <b>${otp}</b></h3>`
    );

    res.json({
      success: true,
      message: "OTP đã được gửi đến email",
      resetToken
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

router.post("/verify-otp", async (req, res) => {
  const { otp, resetToken } = req.body;

  const rows = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.token, resetToken));

  if (!rows.length)
    return res.status(400).json({ success: false, message: "Token không hợp lệ" });

  const reset = rows[0];

  if (reset.otp !== otp)
    return res.status(400).json({ success: false, message: "OTP sai" });

  if (new Date(reset.expires) < new Date())
    return res.status(400).json({ success: false, message: "OTP hết hạn" });

  res.json({
    success: true,
    allowReset: true,
    resetToken
  });
});

router.post("/reset-password", async (req, res) => {
  const { resetToken, newPassword } = req.body;

  const rows = await db
    .select()
    .from(passwordResetsTable)
    .where(eq(passwordResetsTable.token, resetToken));

  if (!rows.length)
    return res.status(400).json({ success: false, message: "Token không hợp lệ" });

  const reset = rows[0];

  if (new Date(reset.expires) < new Date())
    return res.status(400).json({ success: false, message: "Token hết hạn" });

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await db
    .update(users)
    .set({ password: hashed })
    .where(eq(users.userId, reset.userId));

  await db
    .delete(passwordResetsTable)
    .where(eq(passwordResetsTable.id, reset.id));

  res.json({
    success: true,
    message: "Đặt lại mật khẩu thành công"
  });
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
    console.log("JWT VERIFY ERROR:", err.message);
  return res.status(401).json({ success: false, message: "Invalid token" });
  }
}

export default router;

/* ---------------- Utility: parse expiry to ms ---------------- */
function parseRefreshExpiryToMs(expStr) {
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
      return num * 24 * 60 * 60 * 1000;
  }
}
