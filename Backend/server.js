import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import socialRoutes from "./routes/social.routes.js"
import authRoutes from "./routes/auth.js";
import campaignRoutes from "./routes/campaignRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js"
import walletRoutes from "./routes/wallet.routes.js";
import submitRoutes from "./routes/submitRoutes.js"
dotenv.config();

const app = express();

// 🔥 CORS (IMPORTANT for cookies)
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// 🔥 Middlewares
app.use(express.json());
app.use(cookieParser());

// 🔥 Routes
app.use("/api/auth", authRoutes);
app.use("/api/social", socialRoutes)
app.use("/api", campaignRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment",paymentRoutes)
app.use("/api/wallet", walletRoutes);
app.use("/api",submitRoutes);
// 🔥 Test route
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// 🔥 Server start
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});