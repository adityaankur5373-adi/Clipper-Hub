import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Loading from "../components/Loading";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);

  const [activeType, setActiveType] = useState("All");
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);

  const types = ["All", "MUSIC", "GAMING", "BRAND", "CLIP"];
  const platforms = ["YOUTUBE", "INSTAGRAM"];

  /* ========================= */
  /* FETCH (ONLY TYPE FILTER) */
  /* ========================= */

  const fetchCampaigns = async () => {
    try {
      setLoading(true);

      let url = "/campaigns";

      if (activeType !== "All") {
        url += `?type=${activeType}`;
      }

      const res = await api.get(url);

      const data = res.data.campaigns || [];

      setCampaigns(data);
      setFiltered(data);
    } catch (err) {
      console.error(err);
      setCampaigns([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [activeType]);

  /* ========================= */
  /* PLATFORM FILTER (FRONTEND) */
  /* ========================= */

  useEffect(() => {
    if (selectedPlatforms.length === 0) {
      setFiltered(campaigns);
      return;
    }

    const data = campaigns.filter((c) =>
      c.allowedPlatforms?.some((p) =>
        selectedPlatforms.includes(p)
      )
    );

    setFiltered(data);
  }, [selectedPlatforms, campaigns]);

  const togglePlatform = (platform) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(
        selectedPlatforms.filter((p) => p !== platform)
      );
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  /* ========================= */
  /* UI */
  /* ========================= */

  return (
    <div className="flex bg-gray-50 min-h-screen">
      
      <Sidebar />

      {/* ✅ FIXED MOBILE SPACING */}
      <div className="flex-1 md:ml-16 p-4 pt-16 md:pt-6 pb-20 md:pb-6">

        {/* ================= FILTER BAR ================= */}
        <div className="bg-white p-4 rounded-xl shadow mb-4">

          {/* TYPES */}
          <div className="flex flex-wrap gap-3 mb-3">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setActiveType(t)}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeType === t
                    ? "bg-red-500 text-white"
                    : "bg-gray-100"
                }`}
              >
                {t === "CLIP" ? "Clipping" : t}
              </button>
            ))}
          </div>

          {/* ✅ PLATFORM CHECKBOX */}
          <div className="flex gap-4 flex-wrap text-sm">
            {platforms.map((p) => (
              <label key={p} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedPlatforms.includes(p)}
                  onChange={() => togglePlatform(p)}
                />
                {p}
              </label>
            ))}
          </div>
        </div>

        {/* COUNT */}
        <p className="text-sm text-gray-500 mb-4">
          {filtered.length} campaigns
        </p>

        {/* LOADING */}
        {loading && <Loading/>}

        {/* ================= GRID ================= */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden"
            >
              {/* TOP */}
              <div className="flex gap-3 p-4">
                
                <div className="relative">
                  <img
                    src={c.thumbnail}
                    alt={c.name}
                    className="w-24 h-24 rounded-xl object-cover"
                  />

                  <div className="absolute bottom-1 left-1 flex gap-1">
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {c.type}
                    </span>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-sm">
                    {c.name}
                  </h3>

                  <p className="text-xs text-gray-500">
                    [{c.type}]
                  </p>

                  <p className="text-xs text-gray-400 mt-2">
                    Creators
                  </p>

                  <p className="text-sm">
                    Budget{" "}
                    <span className="text-green-600">
                      ₹{c.totalBudget}
                    </span>
                  </p>

                  <p className="text-sm">
                    Budget Used {c.progress}%
                  </p>

                  <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${c.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex justify-between items-center p-4 border-t">
                <div>
                  <p className="text-xs text-gray-500">
                    Rate per 1M Views
                  </p>
                  <p className="font-semibold">
                    ₹{c.ratePerMillion}
                  </p>
                </div>

                <button
                  onClick={() => navigate(`/campaign/${c.id}`)}
                  className="bg-red-500 text-white px-4 py-1 rounded-full text-sm"
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* EMPTY */}
        {!loading && filtered.length === 0 && (
          <p className="text-center text-gray-400 mt-10">
            No campaigns found
          </p>
        )}
      </div>
    </div>
  );
}