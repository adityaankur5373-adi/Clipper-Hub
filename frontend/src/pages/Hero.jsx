import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="py-16 sm:py-20">

      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">

        {/* 🔹 Badge */}
        <div className="inline-block px-4 py-1 mb-6 text-xs sm:text-sm rounded-full bg-pink-200 text-pink-700 font-medium">
          Monetize your content with real campaigns 🚀
        </div>

        {/* 🔹 Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
          Turn your content into{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-red-500">
            real earnings
          </span>
        </h1>

        {/* 🔹 Subtitle */}
        <p className="mt-5 text-gray-600 max-w-xl sm:max-w-2xl mx-auto text-sm sm:text-base md:text-lg">
          Clipper Hub connects creators with brands. Pick campaigns, create short videos, and earn based on performance — no followers required.
        </p>

        {/* 🔹 Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">

          <button onClick={() => navigate("/login")} className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full font-medium hover:opacity-90 transition">
            Start earning
          </button>

          <button onClick={() => navigate("/login")} className="w-full sm:w-auto px-6 py-3 border border-pink-300 text-gray-700 rounded-full hover:bg-pink-50 transition">
            Explore campaigns
          </button>

        </div>

      </div>
    </section>
  );
}