import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role, // 🔥 ADD THIS
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "5d",
    }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role, // 🔥 ADD THIS (optional but good)
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
  );
};