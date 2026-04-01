import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function AdminInstagram() {
  const { submissionId } = useParams();
  const { state } = useLocation();

  const submission = state?.submission;

  /* ✅ NEW STATES */
  const [views, setViews] = useState(submission?.views || "");
  const [likes, setLikes] = useState(submission?.likes || "");
  const [comments, setComments] = useState(submission?.comments || "");
  const [shares, setShares] = useState(submission?.shares || "");
  const [saving, setSaving] = useState(false);

  const handleUpdate = async () => {
    setSaving(true);

    try {
      await api.patch(
        `/admin/instagram/${submissionId}`, // ✅ no trailing slash needed
        {
          views: Number(views),
          likes: Number(likes),
          comments: Number(comments),
          shares: Number(shares),
        }
      );

      toast.success("Updated ✅");
    } catch (err) {
  console.error(err);

  const message =
    err?.response?.data?.message ||
    err?.message ||
    "Update failed ❌";

  toast.error(message);
}

    setSaving(false);
  };

  if (!submission) {
    return (
      <div className="text-center mt-10 text-gray-500">
        No submission data (refresh issue)
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto bg-white p-5 rounded-2xl shadow">

        <h1 className="text-xl sm:text-2xl font-bold mb-6 text-center">
          📊 Update Instagram Stats
        </h1>

        {/* USER INFO */}
        <div className="mb-4">
          <h2 className="font-semibold text-lg">
            {submission.user?.name}
          </h2>
          <p className="text-sm text-gray-500">
            {submission.user?.email}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Campaign: {submission.campaign?.name}
          </p>
        </div>

        {/* VIDEO */}
        <a
          href={submission.videoUrl}
          target="_blank"
          rel="noreferrer"
          className="text-blue-500 text-sm underline mb-4 block"
        >
          View Content
        </a>

        {/* INPUTS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">

          <InputField label="Views" value={views} setValue={setViews} />
          <InputField label="Likes" value={likes} setValue={setLikes} />
          <InputField label="Comments" value={comments} setValue={setComments} />
          <InputField label="Shares" value={shares} setValue={setShares} />

        </div>

        {/* BUTTON */}
        <button
          onClick={handleUpdate}
          disabled={saving}
          className={`w-full py-2 rounded-lg text-white ${
            saving ? "bg-gray-400" : "bg-pink-500 hover:bg-pink-600"
          }`}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

      </div>
    </div>
  );
}

/* INPUT */
function InputField({ label, value, setValue }) {
  return (
    <div className="flex flex-col">
      <label className="text-xs text-gray-500 mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="border rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
        placeholder={label}
      />
    </div>
  );
}
