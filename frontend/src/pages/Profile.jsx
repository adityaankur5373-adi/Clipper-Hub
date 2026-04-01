import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import toast from "react-hot-toast";
import Loading from "../components/Loading";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [upi, setUpi] = useState("");
  const [provider, setProvider] = useState("UPI");
  const [loading, setLoading] = useState(true);

  /* ============================= */
  /* FETCH PROFILE + BALANCE */
  /* ============================= */

  const fetchData = async () => {
    try {
      setLoading(true);

      const [profileRes, balanceRes] = await Promise.all([
        api.get("/auth/me"),
        api.get("/wallet/balance"),
      ]);

      setUser(profileRes.data);
      setBalance(balanceRes.data.balance || 0);

      // 👉 set default payment method in input
      const payment = profileRes.data.paymentMethods?.[0];
      setUpi(payment?.upiId || "");
      setProvider(payment?.provider || "UPI");

    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const payment = user?.paymentMethods?.[0];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 md:ml-16 p-4 sm:p-6">
        {loading ? (
          <Loading />
        ) : (
          <>
            {/* TOP */}
            <div className="bg-white border rounded-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <h1 className="text-xl font-semibold">{user?.name}</h1>
                  <p className="text-gray-500 text-sm">{user?.email}</p>
                  <p className="text-gray-500 text-sm">
                    user id: {user?.id}
                  </p>
                </div>

                <div className="text-left md:text-right">
                  <p className="text-sm text-gray-500">Balance</p>
                  <p className="text-2xl font-bold text-red-500">
                    ₹{balance}
                  </p>
                </div>
              </div>
            </div>

            {/* GRID */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* PAYMENT */}
              <div className="bg-white border rounded-lg p-6">
                <h2 className="font-semibold mb-3">Payment (UPI)</h2>

                {!payment && (
                  <p className="text-red-500 text-sm mb-3">
                    Add payment method to withdraw money
                  </p>
                )}

                {payment && (
                  <p className="text-green-600 text-sm mb-3">
                    {payment.provider}: {payment.upiId}
                  </p>
                )}

                <div className="space-y-3">
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full border p-2 rounded"
                  >
                    <option>Google Pay</option>
                    <option>PhonePe</option>
                    <option>Paytm</option>
                    <option>UPI</option>
                  </select>

                  <input
                    value={upi}
                    onChange={(e) => setUpi(e.target.value)}
                    placeholder="Enter UPI ID"
                    className="w-full border p-2 rounded"
                  />

                  <button
                    onClick={handleSaveUpi}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded"
                  >
                    {payment ? "Update UPI" : "Add UPI"}
                  </button>
                </div>
              </div>

              {/* WALLET */}
              <div className="bg-white border rounded-lg p-6">
                <h2 className="font-semibold mb-3">Wallet</h2>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Minimum Withdrawal</span>
                    <span>₹50</span>
                  </div>
                </div>

                <button
                  onClick={handleWithdraw}
                  className={`mt-5 w-full py-2 rounded text-white ${
                    !payment
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                  disabled={!payment}
                >
                  Withdraw
                </button>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );

  /* ============================= */
  /* SAVE UPI */
  /* ============================= */

  async function handleSaveUpi() {
    try {
      if (!upi) return toast.error("Enter UPI ID");

      const payload = { upiId: upi, provider };

      if (payment) {
        await api.patch("/payment/upi/update", payload);
        toast.success("UPI updated");
      } else {
        await api.post("/payment/upi/add", payload);
        toast.success("UPI added");
      }

      fetchData();

    } catch (err) {
      toast.error(err?.response?.data?.message || "Error");
    }
  }

  /* ============================= */
  /* WITHDRAW */
  /* ============================= */

  async function handleWithdraw() {
    try {
      if (!payment) {
        return toast.error("Add payment method first");
      }

      if (balance < 50) {
        return toast.error("Minimum withdrawal ₹50");
      }

      await api.post("/wallet/withdraw", {
        amount: balance,
      });

      toast.success("Withdrawal request sent");
      fetchData();

    } catch (err) {
      toast.error(err?.response?.data?.message || "Error");
    }
  }
}