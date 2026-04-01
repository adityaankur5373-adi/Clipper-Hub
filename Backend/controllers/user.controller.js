  import prisma from "../prisma/client.js";
  export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        paymentMethods: true
      }
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // 👉 get first UPI (since you use only one)
    const payment = user.paymentMethods[0] || null;

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      balance: user.balance,

       paymentMethods: user.paymentMethods 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error fetching profile"
    });
  }
};