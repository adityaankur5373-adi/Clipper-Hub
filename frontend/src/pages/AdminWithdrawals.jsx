import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import toast from "react-hot-toast";
import Loading from "../components/Loading";

export default function AdminWithdrawals() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/withdrawals");
      setData(res.data || []);
    } catch (err) {
      toast.error("Failed to load withdrawals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleUpdate = async (id, status) => {
    try {
      await api.patch(`/admin/withdrawal/${id}`, { status });
      toast.success(`Marked as ${status}`);
      fetchWithdrawals();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="flex min-h-screen bg-gray-50">
   

      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-semibold mb-6">
          Withdrawal Requests
        </h1>

        {data.length === 0 ? (
          <p className="text-gray-500">No withdrawals found</p>
        ) : (
          <>
            {/* ============================= */}
            {/* DESKTOP TABLE */}
            {/* ============================= */}
           <div className="hidden md:block bg-white border rounded-lg overflow-x-auto shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="p-3 text-left">User</th>
                    <th className="p-3 text-left">Amount</th>
                    <th className="p-3 text-left">UPI</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {data.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-3">
                        <p className="font-medium">{item.user?.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.user?.email}
                        </p>
                      </td>

                      <td className="p-3 font-semibold text-red-500">
                        ₹{item.amount}
                      </td>

                      <td className="p-3 text-gray-600">
                        {item.upiId || "N/A"}
                      </td>

                      <td className="p-3">
                        <StatusBadge status={item.status} />
                      </td>

                      <td className="p-3 space-x-2">
                        {item.status === "PENDING" && (
                          <>
                            <button
                              onClick={() =>
                                handleUpdate(item.id, "APPROVED")
                              }
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
                            >
                              Approve
                            </button>

                            <button
                              onClick={() =>
                                handleUpdate(item.id, "REJECTED")
                              }
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ============================= */}
            {/* MOBILE CARDS */}
            {/* ============================= */}
            <div className="md:hidden space-y-4">
              {data.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{item.user?.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.user?.email}
                      </p>
                    </div>

                    <StatusBadge status={item.status} />
                  </div>

                  <div className="mt-3 text-sm space-y-1">
                    <p>
                      <span className="text-gray-500">Amount:</span>{" "}
                      <span className="font-semibold text-red-500">
                        ₹{item.amount}
                      </span>
                    </p>

                    <p>
                      <span className="text-gray-500">UPI:</span>{" "}
                      {item.upiId || "N/A"}
                    </p>
                  </div>

                  {item.status === "PENDING" && (
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() =>
                          handleUpdate(item.id, "APPROVED")
                        }
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded text-sm"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() =>
                          handleUpdate(item.id, "REJECTED")
                        }
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================= */
/* STATUS BADGE COMPONENT */
/* ============================= */

function StatusBadge({ status }) {
  return (
    <span
      className={`px-2 py-1 text-xs rounded ${
        status === "PENDING"
          ? "bg-yellow-100 text-yellow-600"
          : status === "APPROVED"
          ? "bg-green-100 text-green-600"
          : "bg-red-100 text-red-600"
      }`}
    >
      {status}
    </span>
  );
}