import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function AdminCampaigns() {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      const res = await api.get("/campaign/all");
      setRequests(res.data);
    } catch {
      toast.error("Failed to load requests");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/campaign/${id}/status`, { status });
      toast.success("Updated ✅");
      fetchRequests();
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed ❌"
      );
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-5xl mx-auto">

      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-red-500 text-center sm:text-left">
        Campaign Requests
      </h1>

      {requests.length === 0 ? (
        <p className="text-center text-gray-500">
          No requests found
        </p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white p-4 rounded-xl shadow border flex flex-col gap-3"
            >
              {/* TOP INFO */}
              <div>
                <h2 className="font-semibold text-base sm:text-lg">
                  {req.company}
                </h2>

                <p className="text-xs sm:text-sm text-gray-700 break-words">
                  {req.name} ({req.email})
                </p>

                <p className="text-gray-500 text-xs sm:text-sm mt-1 break-words">
                  {req.details}
                </p>
              </div>

              {/* STATUS + ACTIONS */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">

                {/* STATUS */}
                <span className="text-xs sm:text-sm font-medium">
                  Status:{" "}
                  <span
                    className={`${
                      req.status === "APPROVED"
                        ? "text-green-600"
                        : req.status === "REJECTED"
                        ? "text-red-500"
                        : "text-yellow-500"
                    }`}
                  >
                    {req.status}
                  </span>
                </span>

                {/* ACTIONS */}
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">

                  <select
                    value={req.status}
                    onChange={(e) =>
                      updateStatus(req.id, e.target.value)
                    }
                    className="border px-2 py-2 rounded w-full sm:w-auto text-sm"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>

                  {req.status === "APPROVED" && (
                    <button
                      onClick={() =>
                        navigate(`/admin/create/${req.id}`)
                      }
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded w-full sm:w-auto text-sm"
                    >
                      Create Campaign
                    </button>
                  )}

                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}