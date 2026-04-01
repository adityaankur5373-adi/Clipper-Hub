import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import Loading from "../components/Loading";
import { useNavigate } from "react-router-dom";

import {
  CheckCircle,
  XCircle,
  ShieldCheck,
  ShieldX,
} from "lucide-react";

export default function AdminSubmissions() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /* ============================= */
  /* FETCH ALL SUBMISSIONS */
  /* ============================= */

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/submissions");
      setData(res.data || []);
    } catch (err) {
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  /* ============================= */
  /* UPDATE STATUS */
  /* ============================= */

  const handleUpdate = async (item, updates) => {
    try {
      await api.patch(
        `/admin/campaign/${item.campaign.id}/submission/${item.id}`,
        updates
      );

      toast.success("Updated successfully");
      fetchSubmissions();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">

        <h1 className="text-xl sm:text-2xl font-semibold mb-6">
          Admin - Submissions
        </h1>

        {data.length === 0 ? (
          <p className="text-gray-500">No submissions found</p>
        ) : (
          <div className="grid gap-4">

            {data.map((item) => (
              <div
                key={item.id}
                className="bg-white border rounded-lg p-4 sm:p-5 shadow-sm"
              >

                {/* TOP */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                  <div>
                    <h2 className="font-semibold text-base sm:text-lg">
                      {item.campaign.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500">
                      by {item.user.name} ({item.user.email})
                    </p>
                  </div>

                  <span
                    className={`text-xs px-2 py-1 rounded w-fit ${
                      item.status === "APPROVED"
                        ? "bg-green-100 text-green-600"
                        : item.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                {/* INFO */}
                <div className="text-sm text-gray-600 space-y-1">
               <p>
  Platform: {item.campaign.allowedPlatforms?.join(", ")}
</p>
                  <p>
                    Eligible:{" "}
                    <span
                      className={
                        item.isEligible
                          ? "text-green-600"
                          : "text-red-500"
                      }
                    >
                      {item.isEligible ? "Yes" : "No"}
                    </span>
                  </p>

                  <p>
                    Verified:{" "}
                    <span
                      className={
                        item.isVerified
                          ? "text-green-600"
                          : "text-gray-400"
                      }
                    >
                      {item.isVerified ? "Yes" : "No"}
                    </span>
                  </p>
                </div>

                {/* ACTIONS */}
                <div className="mt-4 flex flex-wrap gap-2">

                  {/* APPROVE */}
                  <button
                    onClick={() =>
                      handleUpdate(item, {
                        status: "APPROVED",
                      })
                    }
                    className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                  >
                    <CheckCircle size={16} />
                    Approve
                  </button>

                  {/* VERIFY */}
                  <button
                    disabled={item.isVerified}
                    onClick={() =>
                      handleUpdate(item, {
                        isVerified: true,
                      })
                    }
                    className={`flex items-center gap-1 px-3 py-1 rounded text-sm text-white ${
                      item.isVerified
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-purple-500 hover:bg-purple-600"
                    }`}
                  >
                    ✔ Verify
                  </button>

                  {/* ELIGIBILITY */}
                  <button
                    onClick={() =>
                      handleUpdate(item, {
                        isEligible: !item.isEligible,
                      })
                    }
                    className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    {item.isEligible ? (
                      <>
                        <ShieldX size={16} /> Ineligible
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={16} /> Eligible
                      </>
                    )}
                  </button>

                  {/* VIEW VIDEO */}
                  <a
                    href={item.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-500 underline text-sm ml-auto"
                  >
                    View Video
                  </a>

                  {/* 📊 INSTAGRAM BUTTON (CONDITIONAL) */}
                  {item.status === "APPROVED" &&
                    item.isEligible &&
                    item.isVerified &&
                    item.campaign?.allowedPlatforms?.includes("INSTAGRAM") && (
                      <button
                        onClick={() =>
                          navigate(`/admin/instagram/${item.id}`, {
                            state: { submission: item },
                          })
                        }
                        className="flex items-center gap-1 bg-pink-500 hover:bg-pink-600 text-white px-3 py-1 rounded text-sm"
                      >
                        📊 Insta Stats
                      </button>
                  )}

                  {/* ❌ REJECT */}
                  <button
                    onClick={() =>
                      handleUpdate(item, {
                        status: "REJECTED",
                        isVerified: false,
                        isEligible: false,
                      })
                    }
                    className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>

                </div>
              </div>
            ))}

          </div>
        )}
      </div>
    </div>
  );
}