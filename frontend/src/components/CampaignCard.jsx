import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function CampaignCard({ campaign }) {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user); // ✅ get user

  const handleClick = () => {
    if (!user) {
      navigate("/login"); // 🔥 not logged in
    } else {
      navigate(`/campaign/${campaign.id}`); // ✅ logged in
    }
  };

  const progress = campaign.progress || 0;
  const used = Math.round(progress);

  return (
    <div
      onClick={handleClick}
      className="relative w-[148px] shrink-0 bg-white border border-pink-100 rounded-2xl p-1 pb-2 text-gray-900 font-medium hover:scale-[1.02] transition cursor-pointer"
    >
      {/* 🔹 Image */}
      <img
        src={campaign.thumbnail || "/placeholder.png"}
        alt={campaign.name}
        className="w-[140px] h-[140px] object-cover rounded-xl mx-auto"
      />

      {/* 🔹 Content */}
      <div className="mt-2 px-2 flex flex-col">
        
        {/* Title */}
        <h3 className="text-sm leading-[1.4] line-clamp-2 h-10">
          {campaign.name}
        </h3>

        {/* Stats */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">

          {/* Budget */}
          <div className="flex items-center gap-1 text-pink-600">
            <span>💵</span>
            <span>₹{campaign.totalBudget}</span>
          </div>

          {/* Rate */}
          <div className="flex items-center gap-1 text-gray-500">
            <Eye size={14} />
            <span className="truncate">
              ₹{campaign.ratePerMillion}/1M
            </span>
          </div>

        </div>

        {/* Budget used */}
        <span className="text-[10px] text-gray-400 mt-1">
          {used}% budget used
        </span>
      </div>

      {/* 🔹 Progress Bar */}
      <div className="absolute bottom-0 left-[5px] right-0 h-[3px]">
        <div
          className="h-full bg-pink-500 rounded-tr-full min-w-[4px]"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}