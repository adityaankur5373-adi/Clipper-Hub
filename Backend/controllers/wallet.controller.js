import prisma from "../prisma/client.js";


export const getBalance = async (req, res) => {
  try {
    const userId = req.user.userId;

  const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    paymentMethods: true
  }
});

    res.json({
  balance: Math.max(0, user.balance)
});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch balance" });
  }
};
export const requestWithdrawal = async (req, res) => {
  try {
    console.log("WITHDRAW API HIT");

    const userId = req.user.userId;
    const { amount } = req.body;

    const parsedAmount = Number(amount);

    /* ============================= */
    /* VALIDATION */
    /* ============================= */

    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    /* ============================= */
    /* TRANSACTION (SAFE) */
    /* ============================= */

    const result = await prisma.$transaction(async (tx) => {

      // ✅ Fetch user inside transaction
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: {
          paymentMethods: {
            where: { isDefault: true },
            take: 1,
          },
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const paymentMethod = user.paymentMethods[0];

      // ❌ no payment method
      if (!paymentMethod) {
        throw new Error("Add payment method first");
      }

      // ❌ minimum withdrawal
      if (parsedAmount < 50) {
        throw new Error("Minimum withdrawal is ₹50");
      }

      // 🔥 CRITICAL FIX: prevent negative balance
      if (user.balance < parsedAmount) {
        throw new Error("Insufficient balance");
      }

      // ❌ already pending
      const existing = await tx.withdrawal.findFirst({
        where: {
          userId,
          status: "PENDING",
        },
      });

      if (existing) {
        throw new Error("You already have a pending withdrawal");
      }

      /* ============================= */
      /* CREATE WITHDRAWAL */
      /* ============================= */

      const withdrawal = await tx.withdrawal.create({
        data: {
          userId,
          amount: parsedAmount,
          upiId: paymentMethod.upiId,
        },
      });

      /* ============================= */
      /* UPDATE BALANCE */
      /* ============================= */

      await tx.user.update({
        where: { id: userId },
        data: {
          balance: {
            decrement: parsedAmount,
          },
        },
      });

      return withdrawal;
    });

    res.json({
      message: "Withdrawal request submitted",
      withdrawal: result,
    });

  } catch (error) {
    console.error("WITHDRAW ERROR:", error);

    res.status(400).json({
      message: error.message || "Withdrawal failed",
    });
  }
};