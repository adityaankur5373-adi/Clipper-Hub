import { useEffect, useState } from "react";
import CampaignCard from "../components/CampaignCard";
import { useNavigate } from "react-router-dom";
import api from "../api/axios"; // 👈 your axios instance

export default function Campaigns() {
  const navigate = useNavigate();

  const [musicCampaigns, setMusicCampaigns] = useState([]);
  const [gamingCampaigns, setGamingCampaigns] = useState([]);
  const [brandCampaigns, setBrandCampaigns] = useState([]);

  /* ============================= */
  /* FETCH CAMPAIGNS */
  /* ============================= */

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const [music, gaming, brand] = await Promise.all([
          api.get("/campaigns?type=MUSIC"),
          api.get("/campaigns?type=GAMING"),
          api.get("/campaigns?type=BRAND")
        ]);

        setMusicCampaigns(music.data.campaigns || []);
        setGamingCampaigns(gaming.data.campaigns || []);
        setBrandCampaigns(brand.data.campaigns || []);
      } catch (err) {
        console.error("Failed to load campaigns", err);
      }
    };

    fetchCampaigns();
  }, []);

  return (
    <section className="px-4 sm:px-6 pb-24">
      <div className="max-w-7xl mx-auto">

        {/* 🎵 Music Campaigns */}
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
          Music Campaigns
        </h2>

        <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide">
          {musicCampaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>

        {/* 🎮 Gaming Campaigns */}
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
          Gaming Campaigns
        </h2>

        <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide">
          {gamingCampaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>

        {/* 🏢 Brand Campaigns */}
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
          Brand Campaigns
        </h2>

        <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide">
          {brandCampaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>

        {/* 🔥 CTA */}
        <div className="flex justify-center mt-10">
          <button
            onClick={() => navigate("/login")}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-medium hover:opacity-90 transition"
          >
            Start Earning
          </button>
        </div>

      </div>
    </section>
  );
}