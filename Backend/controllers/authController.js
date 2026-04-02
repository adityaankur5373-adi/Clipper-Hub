import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma/client.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/token.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* ============================= */
/* COOKIE OPTIONS */
/* ============================= */
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "none",
  path: "/",
};

/* ============================= */
/* SIGNUP */
/* ============================= */
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
      },
    });

    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role, // 🔥 ADDED
      },
    });

  } catch (err) {
    if (err.code === "P2002") {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

/* ============================= */
/* LOGIN */
/* ============================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password)
      return res.status(400).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);

    if (!valid)
      return res.status(400).json({ error: "Wrong password" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
      },
    });

    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role, // 🔥 ADDED
      },
    });

  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

/* ============================= */
/* GOOGLE LOGIN */
/* ============================= */
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (verifyError) {
      return res.status(401).json({ error: "Invalid Google token" });
    }

    const payload = ticket.getPayload();
    const { email, name, sub: googleId, picture } = payload;

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { email, name, avatar: picture },
      });
    }

    let account = await prisma.account.findFirst({
      where: {
        provider: "google",
        providerAccountId: googleId,
      },
    });

    if (!account) {
      await prisma.account.create({
        data: {
          userId: user.id,
          provider: "google",
          providerAccountId: googleId,
        },
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
      },
    });

    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role, // 🔥 ADDED
      },
    });

  } catch {
    res.status(401).json({ error: "Invalid Google token" });
  }
};

/* ============================= */
/* REFRESH */
/* ============================= */
export const refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.sendStatus(401);

    const stored = await prisma.refreshToken.findFirst({
      where: { token },
      include: { user: true },
    });

    if (!stored) return res.sendStatus(403);

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err) => {
      if (err) return res.sendStatus(403);

      const accessToken = generateAccessToken(stored.user);

      res.json({
        accessToken,
        user: {
          id: stored.user.id,
          email: stored.user.email,
          name: stored.user.name,
          role: stored.user.role, // 🔥 ADDED
        },
      });
    });

  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

/* ============================= */
/* LOGOUT */
/* ============================= */
export const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      await prisma.refreshToken.deleteMany({
        where: { token },
      });
    }

    res.clearCookie("refreshToken", { path: "/" });

    res.json({ message: "Logged out successfully" });

  } catch {
    res.status(500).json({ error: "Server error" });
  }
};