import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import Loading from "../components/Loading";
import { Youtube, Instagram } from "lucide-react";
import toast from "react-hot-toast";

export default function CampaignDetails() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchCampaign = async () => {
    try {
      const res = await api.get(`/campaign/${id}`);
      setData(res.data);
    } catch (err) {
      console.error("Failed to load campaign");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  if (loading) return <Loading />;
  if (!data) return <p className="p-6">Not found</p>;

  const { campaign, progress, leaderboard, myStats, joined } = data;

  const isFull = campaign.remainingBudget <= 0;

  return (
<div className="flex bg-gray-100 min-h-screen overflow-x-hidden">
      <Sidebar />

     <div className="flex-1 p-3 md:p-6 ml-0 md:ml-16 pt-14 md:pt-0">

        {/* Banner */}
        <div className="relative mb-6">
          <img
            src={campaign.bannerImage || campaign.thumbnail}
            alt={campaign.name}
            className="w-full h-44 md:h-56 object-cover rounded-xl"
          />

          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="bg-black/70 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl text-base md:text-2xl font-bold text-center">
              {campaign.name}
            </h1>
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

          {/* LEFT */}
          <div>
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm text-center h-full flex flex-col justify-center">

              <h2 className="text-red-500 font-semibold text-base md:text-lg mb-2">
                Rate per Million Views
              </h2>

              <p className="text-3xl md:text-4xl font-bold text-red-500">
                ₹{campaign.ratePerMillion}
              </p>

              <p className="text-gray-500 text-xs md:text-sm mt-2">
                Per million views
              </p>

              <button
                disabled={isFull}
                onClick={() => setShowModal(true)}
                className={`mt-6 px-5 md:px-6 py-3 rounded-xl text-base md:text-lg ${
                  isFull
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                {isFull ? "Campaign Full" : "Submit Content"}
              </button>

            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-4 md:space-y-6">

            {/* PROGRESS */}
            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm">
              <h2 className="text-red-500 font-semibold mb-4 text-sm md:text-base">
                Campaign Progress
              </h2>

              <div className="flex justify-between text-xs md:text-sm mb-2">
                <span>Total Budget</span>
                <span>₹{campaign.totalBudget}</span>
              </div>

              <div className="w-full bg-gray-200 h-2 rounded-full mb-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex justify-between text-xs md:text-sm">
                <span>{Math.round(progress)}%</span>
              </div>
            </div>

            {/* USER STATS */}
            {joined && (
              <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm">
                <h2 className="text-blue-500 font-semibold mb-4 text-sm md:text-base">
                  Your Performance
                </h2>

                <div className="flex justify-between text-xs md:text-sm">
                  <span>Total Views</span>
                  <span>{myStats.totalViews}</span>
                </div>

                <div className="flex justify-between text-xs md:text-sm mt-2">
                  <span>Total Earnings</span>
                  <span className="text-green-500 font-bold">
                    ₹{myStats.totalEarnings}
                  </span>
                </div>
              </div>
            )}

            {/* DETAILS */}
            <div className="bg-white rounded-2xl shadow-sm p-5 md:p-6">
              <h2 className="text-base md:text-lg font-semibold mb-4 text-center">
                Campaign Details
              </h2>

              <div className="grid grid-cols-2 gap-4 md:gap-6 text-center text-xs md:text-sm">

                <div>
                  <p className="text-gray-500">Platforms</p>
                  <div className="flex justify-center gap-3 mt-2">
                    {campaign.allowedPlatforms?.includes("YOUTUBE") && (
                      <Youtube className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
                    )}
                    {campaign.allowedPlatforms?.includes("INSTAGRAM") && (
                      <Instagram className="w-5 h-5 md:w-6 md:h-6 text-pink-500" />
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-gray-500">Max Per Account</p>
                  <p className="text-lg md:text-xl font-bold text-purple-500">
                    {campaign.maxSubmissionsPerAccount}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Max Earnings</p>
                  <p className="text-lg md:text-xl font-bold text-green-500">
                    ₹{campaign.maxEarnings}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Per Post Limit</p>
                  <p className="text-lg md:text-xl font-bold text-blue-500">
                    ₹{campaign.maxEarningsPerPost}
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm p-5 md:p-6 text-center">
          <h2 className="text-lg md:text-xl font-semibold mb-4">
            Campaign Description
          </h2>

          <p className="text-gray-700 mb-2 text-sm md:text-base">
            {campaign.description}
          </p>

       
        </div>

        {/* LEADERBOARD */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm overflow-hidden">
          <h2 className="text-center text-red-500 font-bold text-base md:text-lg py-4">
            Creator Leaderboard
          </h2>

          <div className="overflow-x-auto">
  <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th>#</th>
                  <th>Creator</th>
                  <th>Views</th>
                  <th>Earned</th>
                </tr>
              </thead>

              <tbody>
                {leaderboard.map((item, i) => (
                  <tr key={i} className="text-center border-t">
                    <td>{i + 1}</td>
                    <td>{item.user?.name}</td>
                    <td>{item.totalViews}</td>
                    <td>₹{item.totalEarnings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-2">

          <div className="bg-white p-4 md:p-6 rounded-2xl w-full max-w-md relative">

            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 text-lg"
            >
              ✖
            </button>

            <h2 className="text-base md:text-lg font-semibold mb-4 text-center">
              Submit Content
            </h2>

            <input
              type="text"
              placeholder="Paste video URL..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full border p-3 md:p-2 rounded mb-4 text-sm md:text-base"
            />

            <button
              onClick={async () => {
                if (!videoUrl) {
                  toast.error("Enter video URL");
                  return;
                }

                try {
                  setSubmitting(true);

                  await api.post("/submit", {
                    campaignId: campaign.id,
                    videoUrl
                  });

                  toast.success("Submitted successfully 🎉");

                  setVideoUrl("");
                  setShowModal(false);

                } catch (err) {
                  toast.error(
                    err.response?.data?.message || "Submission failed"
                  );
                } finally {
                  setSubmitting(false);
                }
              }}
              className="w-full bg-red-500 text-white py-3 md:py-2 rounded"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>

          </div>
        </div>
      )}

    </div>
  );
}