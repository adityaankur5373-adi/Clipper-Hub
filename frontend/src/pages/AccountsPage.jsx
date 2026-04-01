import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);

  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    platform: "YOUTUBE",
    profileUrl: "",
  });

  const [code, setCode] = useState(null);
  const [accountId, setAccountId] = useState(null);

  /* ============================= */
  /* FETCH */
  /* ============================= */
  const fetchAccounts = async () => {
    try {
      const res = await api.get("/social/me"); // keep your route
      setAccounts(res.data);
    } catch {
      toast.error("Failed to load accounts");
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  /* ============================= */
  /* ADD ACCOUNT */
  /* ============================= */
  const handleAdd = async () => {
    try {
      if (!form.profileUrl) {
  toast.error("Enter profile URL");
  return;
}
    console.log("🚀 SENDING:", form);
      const res = await api.post("/social/add", form);
      
      setCode(res.data.code);
      setAccountId(res.data.accountId);

      toast.success("Code generated!");
    } 

  catch (err) {
  console.log("ERROR:", err.response?.data);

  toast.error(
    err.response?.data?.error || "Failed to add account"
  );
}

  };

  /* ============================= */
  /* VERIFY */
  /* ============================= */
  const handleVerify = async () => {
    try {
      
      const res = await api.post("/social/verify", { accountId });

      if (res.data.verified) {
        toast.success("Verified 🎉");
      } else {
        toast("Pending review ⏳");
      }

      // reset
      setShowModal(false);
      setCode(null);
      setAccountId(null);
      setForm({ platform: "YOUTUBE", profileUrl: "" });

      fetchAccounts();
    } catch {
      toast.error("Verification failed");
    }
  };

  /* ============================= */
  /* DELETE */
  /* ============================= */
  const handleDelete = async (id) => {
    try {
      await api.delete(`/social/${id}`);
      toast.success("Deleted");
      fetchAccounts();
    } catch (err) {
    console.error("Delete error:", err);

    toast.error(
      err?.response?.data?.message || "Delete failed ❌"
    );
  }
  };

  return (
    
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
     <Sidebar/>
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-red-500">
          Connected Accounts
        </h1>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-red-500 text-white px-5 py-2 rounded-full shadow hover:bg-red-600 w-full sm:w-auto"
        >
          <Plus size={16} />
          Connect Account
        </button>
      </div>

      {/* EMPTY STATE */}
      {accounts.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl h-[250px] flex flex-col items-center justify-center text-center">
          <Plus size={36} className="text-red-300 mb-4" />
          <h2 className="font-semibold">No Connected Accounts</h2>
          <p className="text-gray-500 text-sm">
            Connect your social accounts to get started
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="p-4 border rounded-xl flex flex-col sm:flex-row justify-between"
            >
              <div>
                <p className="font-semibold capitalize">{acc.platform}</p>

                <a
                  href={acc.profileUrl}
                  target="_blank"
                  className="text-blue-500 text-sm underline break-all"
                >
                  {acc.profileUrl}
                </a>

                <div className="mt-1">
                  {acc.status === "verified" && (
                    <span className="text-green-600">✔ Verified</span>
                  )}
                  {acc.status === "pending" && (
                    <span className="text-yellow-500">⏳ Pending</span>
                  )}
                  {acc.status === "rejected" && (
                    <span className="text-red-500">❌ Rejected</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleDelete(acc.id)}
                className="text-red-500 mt-2 sm:mt-0"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ============================= */}
      {/* 🧩 MODAL */}
      {/* ============================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white p-6 rounded-xl w-full max-w-md">

            {/* CLOSE */}
            <div className="flex justify-between mb-4">
              <h2 className="font-bold text-lg">Connect Account</h2>
              <X onClick={() => setShowModal(false)} className="cursor-pointer" />
            </div>

            {/* FORM */}
            <select
              className="w-full border p-2 rounded mb-3"
              value={form.platform}
              onChange={(e) =>
                setForm({ ...form, platform: e.target.value })
              }
            >
              <option value="YOUTUBE">YouTube</option>
              <option value="INSTAGRAM">Instagram</option>
            </select>

            <input
              type="text"
              placeholder="Profile URL"
              className="w-full border p-2 rounded mb-3"
              value={form.profileUrl}
              onChange={(e) =>
                setForm({ ...form, profileUrl: e.target.value })
              }
            />

            {!code ? (
              <button
                onClick={handleAdd}
                className="w-full bg-red-500 text-white py-2 rounded"
              >
                Generate Code
              </button>
            ) : (
              <div className="bg-gray-100 p-3 rounded">
                <p className="text-sm">Paste this in bio/about :</p>
                <p className="font-bold text-red-500">{code}</p>

                <button
                  onClick={handleVerify}
                  className="w-full mt-3 bg-green-500 text-white py-2 rounded"
                >
                  Verify
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}