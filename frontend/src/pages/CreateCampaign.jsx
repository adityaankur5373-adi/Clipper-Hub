import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function CreateCampaign() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    totalBudget: "",
    ratePerMillion: "",
    type: "BRAND",
    allowedPlatforms: [],
    thumbnail: "",
    bannerImage: "",
    description: "",
    audioUrl: "",
    audioName: "",
    maxSubmissions: "",
    maxSubmissionsPerAccount: "",
    maxEarnings: "",
    maxEarningsPerPost: "",
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const togglePlatform = (platform) => {
    setForm((prev) => ({
      ...prev,
      allowedPlatforms: prev.allowedPlatforms.includes(platform)
        ? prev.allowedPlatforms.filter((p) => p !== platform)
        : [...prev.allowedPlatforms, platform],
    }));
  };

  const handleSubmit = async () => {
    try {
      if (form.allowedPlatforms.length === 0) {
        return toast.error("Select at least one platform ❌");
      }

      await api.post(`/campaign/create/${id}`, form);

      toast.success("Campaign Created 🎉");
      navigate("/admin");

    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed ❌"
      );
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow">

      <h1 className="text-2xl font-bold mb-6 text-red-500">
        Create Campaign
      </h1>

      {/* Budget */}
      <input
        placeholder="Total Budget"
        className="w-full border p-2 mb-3"
        onChange={(e) =>
          handleChange("totalBudget", Number(e.target.value))
        }
      />

      <input
        placeholder="Rate per Million"
        className="w-full border p-2 mb-3"
        onChange={(e) =>
          handleChange("ratePerMillion", Number(e.target.value))
        }
      />

      {/* Type */}
      <select
        className="w-full border p-2 mb-3"
        onChange={(e) => handleChange("type", e.target.value)}
      >
        <option value="BRAND">Brand</option>
        <option value="CLIP">Clip</option>
         <option value="GAMING">Gaming</option>
         <option value="MUSIC">Music</option>
      </select>

      {/* Platforms */}
      <div className="mb-3">
        <p className="text-sm mb-2 font-medium">Platforms</p>

        <button
          type="button"
          onClick={() => togglePlatform("YOUTUBE")}
          className={`mr-2 px-3 py-1 border rounded ${
            form.allowedPlatforms.includes("YOUTUBE")
              ? "bg-red-500 text-white"
              : ""
          }`}
        >
          YouTube
        </button>

        <button
          type="button"
          onClick={() => togglePlatform("INSTAGRAM")}
          className={`px-3 py-1 border rounded ${
            form.allowedPlatforms.includes("INSTAGRAM")
              ? "bg-pink-500 text-white"
              : ""
          }`}
        >
          Instagram
        </button>
      </div>

      {/* Media */}
      <input
        placeholder="Thumbnail URL"
        className="w-full border p-2 mb-3"
        onChange={(e) => handleChange("thumbnail", e.target.value)}
      />

      <input
        placeholder="Banner Image URL"
        className="w-full border p-2 mb-3"
        onChange={(e) => handleChange("bannerImage", e.target.value)}
      />

      {/* Description */}
      <textarea
        placeholder="Campaign Description"
        className="w-full border p-2 mb-3"
        onChange={(e) => handleChange("description", e.target.value)}
      />

      {/* Audio */}
      <input
        placeholder="Audio URL"
        className="w-full border p-2 mb-3"
        onChange={(e) => handleChange("audioUrl", e.target.value)}
      />

      <input
        placeholder="Audio Name"
        className="w-full border p-2 mb-3"
        onChange={(e) => handleChange("audioName", e.target.value)}
      />

      {/* Limits */}
      <input
        placeholder="Max Submissions"
        className="w-full border p-2 mb-3"
        onChange={(e) =>
          handleChange("maxSubmissions", Number(e.target.value))
        }
      />

      <input
        placeholder="Max Submissions Per Account"
        className="w-full border p-2 mb-3"
        onChange={(e) =>
          handleChange("maxSubmissionsPerAccount", Number(e.target.value))
        }
      />

      <input
        placeholder="Max Earnings"
        className="w-full border p-2 mb-3"
        onChange={(e) =>
          handleChange("maxEarnings", Number(e.target.value))
        }
      />

      <input
        placeholder="Max Earnings Per Post"
        className="w-full border p-2 mb-4"
        onChange={(e) =>
          handleChange("maxEarningsPerPost", Number(e.target.value))
        }
      />

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600"
      >
        Create Campaign
      </button>
    </div>
  );
}