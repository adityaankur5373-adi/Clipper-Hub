import { useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
export default function LaunchCampaign() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    details: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.name || !form.email || !form.company) {
    return toast.error("Please fill all required fields");
  }

  try {
    await api.post("/campaign/launch", form);

    toast.success("Admin will contact you soon 💖");

    setForm({
      name: "",
      email: "",
      company: "",
      details: "",
    });

  } catch (err) {
    toast.error("Something went wrong ❌");
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-white px-6 py-16">

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center min-h-[85vh]">

        {/* LEFT SIDE */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl md:text-5xl font-bold text-pink-900 mb-6 leading-tight">
            Start your first campaign within hours.
          </h1>

          <div className="space-y-6">

            {[1, 2, 3].map((step) => (
              <div key={step} className="flex gap-4">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-pink-500 text-white font-bold">
                  {step}
                </div>
                <div>
                  <h3 className="font-semibold text-pink-800">
                    {step === 1 && "Fill out the form"}
                    {step === 2 && "Get onboarded"}
                    {step === 3 && "Go live"}
                  </h3>
                  <p className="text-pink-700 text-sm">
                    {step === 1 && "Takes 1 minute and gives us everything we need."}
                    {step === 2 && "Our team reviews and reaches out with next steps."}
                    {step === 3 && "Launch instantly and pay only for results."}
                  </p>
                </div>
              </div>
            ))}

          </div>
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md bg-white/70 backdrop-blur-lg p-6 md:p-8 rounded-2xl shadow-lg border border-pink-200">

            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label className="text-sm text-pink-800">Full name*</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-3 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <div>
                <label className="text-sm text-pink-800">Business email*</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-3 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <div>
                <label className="text-sm text-pink-800">Company name*</label>
                <input
                  type="text"
                  name="company"
                  placeholder="Company or artist name"
                  value={form.company}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-3 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <div>
                <label className="text-sm text-pink-800">
                  Campaign goals & details
                </label>
                <textarea
                  name="details"
                  placeholder="Tell us about your campaign goals..."
                  value={form.details}
                  onChange={handleChange}
                  rows={4}
                  className="w-full mt-1 px-4 py-3 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-semibold transition"
              >
                Submit
              </button>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}