import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import Loading from "../components/Loading";
export default function AdminAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ============================= */
  /* FETCH ACCOUNTS */
  /* ============================= */
  const fetchAccounts = async () => {
    try {
      const res = await api.get("/admin/accounts");
      setAccounts(res.data.accounts || []);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  /* ============================= */
  /* UPDATE STATUS */
  /* ============================= */
  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/accounts/${id}`, { status });
      toast.success(`Marked as ${status}`);
      fetchAccounts();
    } catch {
      toast.error("Update failed");
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  /* ============================= */
  /* LOADING */
  /* ============================= */
  if (loading) {
    return <Loading/>;
  }

  return (
    <div className="p-3 sm:p-6 md:p-8 max-w-5xl mx-auto">

      <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-5 sm:mb-6">
        Admin - Social Accounts
      </h2>

      {/* EMPTY */}
      {accounts.length === 0 && (
        <p className="text-gray-500 text-sm">No accounts found.</p>
      )}

      {/* LIST */}
      <div className="space-y-4">
        {Array.isArray(accounts) &&
          accounts.map((acc) => (
            <div
              key={acc.id}
              className="p-4 border rounded-xl flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white hover:shadow-md transition"
            >

              {/* LEFT */}
              <div className="flex-1 min-w-0">

                <p className="font-semibold text-sm sm:text-base break-words">
                  {acc.user?.name || "No Name"} (
                  {acc.user?.email || "No Email"})
                </p>

                <p className="text-xs sm:text-sm text-gray-600">
                  Platform: {acc.platform}
                </p>

                {/* 🔗 PROFILE */}
                <a
                  href={acc.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 text-xs sm:text-sm underline break-all block"
                >
                  {acc.profileUrl}
                </a>

                <p className="text-xs text-gray-500 mt-1 break-all">
                  Code: {acc.verificationCode}
                </p>

                {/* STATUS */}
                <p className="mt-1 text-sm">
                  Status:{" "}
                  <span
                    className={`font-semibold ${
                      acc.status === "verified"
                        ? "text-green-600"
                        : acc.status === "pending"
                        ? "text-yellow-500"
                        : "text-red-500"
                    }`}
                  >
                    {acc.status}
                  </span>
                </p>

              </div>

              {/* RIGHT BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">

                <button
                  onClick={() => updateStatus(acc.id, "verified")}
                  className="w-full sm:w-auto bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 text-sm"
                >
                  Approve
                </button>

                <button
                  onClick={() => updateStatus(acc.id, "rejected")}
                  className="w-full sm:w-auto bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 text-sm"
                >
                  Reject
                </button>

              </div>

            </div>
          ))}
      </div>
    </div>
  );
}