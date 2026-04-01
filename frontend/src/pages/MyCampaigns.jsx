import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import toast from "react-hot-toast";
import Loading from "../components/Loading";

export default function MyCampaigns() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ============================= */
  /* FETCH */
  /* ============================= */

  const fetchCampaigns = async () => {
    try {
      setLoading(true);

      const res = await api.get("/mycampaign");
      setData(res.data.campaigns || []);

    } catch (err) {
      toast.error("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  /* ============================= */
  /* DELETE */
  /* ============================= */

  const handleDelete = async (submissionId) => {
    try {
      await api.delete(`/submission/${submissionId}`);

      toast.success("Deleted successfully");

      // ✅ instant UI update
      setData((prev) =>
        prev.filter((item) => item.submissionId !== submissionId)
      );

    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* ✅ Sidebar always visible */}
      <Sidebar />

      <div className="flex-1 md:ml-16 p-4 sm:p-6">

        <h1 className="text-xl font-semibold mb-6">
          My Campaigns
        </h1>

        {/* ✅ ONLY content loads */}
        {loading ? (
          <Loading />
        ) : data.length === 0 ? (
          <p className="text-gray-500">No campaigns found</p>
        ) : (
          <div className="grid gap-4">

            {data.map((item) => (
              <div
                key={item.submissionId}
                className="bg-white border rounded-lg p-5"
              >

                {/* TOP */}
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-semibold">
                    {item.campaignName}
                  </h2>

                  <span
                    className={`text-xs px-2 py-1 rounded ${
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
                  <p>Platform: {item.platform}</p>
                  <p>Views: {item.views}</p>

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
                <div className="mt-4 flex justify-between items-center">
                  <a
                    href={item.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-500 underline"
                  >
                    View Video
                  </a>

                  {!item.isVerified && (
                    <button
                      onClick={() => handleDelete(item.submissionId)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  )}
                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}