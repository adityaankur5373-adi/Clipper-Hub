  import prisma from "../prisma/client.js";
export const addUpi = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { upiId, provider } = req.body;

    if (!upiId) {
      return res.status(400).json({
        message: "UPI ID is required"
      });
    }
    if (!upiId.includes("@")) {
  return res.status(400).json({
    message: "Invalid UPI ID"
  });
}

    // 🔥 Check if already exists
    const existing = await prisma.paymentMethod.findFirst({
      where: { userId }
    });

    if (existing) {
      return res.status(400).json({
        message: "UPI already added. Use update instead."
      });
    }

    const payment = await prisma.paymentMethod.create({
      data: {
        userId,
        upiId,
        provider: provider || "GPay"
      }
    });

    res.json({
      message: "UPI added successfully ✅",
      payment
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
export const updateUpi = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { upiId } = req.body;

    if (!upiId) {
      return res.status(400).json({
        message: "UPI ID required"
      });
    }

    const existing = await prisma.paymentMethod.findFirst({
      where: { userId }
    });

    if (!existing) {
      return res.status(404).json({
        message: "No UPI found. Add first."
      });
    }

    const updated = await prisma.paymentMethod.update({
      where: { id: existing.id },
      data: { upiId }
    });

    res.json({
      message: "UPI updated successfully ✅",
      updated
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
};
export const getMyUpi = async (req, res) => {
  try {
    const userId = req.user.userId;

    const payment = await prisma.paymentMethod.findFirst({
      where: { userId }
    });

    res.json(payment);

  } catch (err) {
    res.status(500).json({ message: "Error fetching UPI" });
  }
};