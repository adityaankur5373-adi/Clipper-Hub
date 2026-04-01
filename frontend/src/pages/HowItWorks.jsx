export default function HowItWorks() {
  return (
    <section className="w-full py-12 sm:py-16">

      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">

        {/* 🔹 Heading */}
        <h2 className="text-2xl sm:text-4xl font-bold text-gray-900">
          How Clipper Hub works
        </h2>

        <p className="mt-2 text-gray-600 text-sm sm:text-base">
          The easiest way to earn from your content
        </p>

        {/* 🔥 Steps */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">

          {/* 🔹 Step 1 */}
          <div className="flex flex-col items-center">

            {/* FULL SVG */}
            <img
              src="https://www.clipster.gg/onboarding/link-account.svg"
              alt="link account"
              className="w-full max-w-[320px] h-auto object-contain"
            />

            {/* Text */}
            <h3 className="mt-5 text-lg font-semibold text-gray-900">
              Link account
            </h3>

            <p className="text-sm text-gray-600 mt-2 max-w-xs">
              Connect your social accounts to verify ownership.
            </p>

          </div>

          {/* 🔹 Step 2 */}
          <div className="flex flex-col items-center">

            <img
              src="https://www.clipster.gg/onboarding/submit-content.svg"
              alt="submit content"
              className="w-full max-w-[320px] h-auto object-contain"
            />

            <h3 className="mt-5 text-lg font-semibold text-gray-900">
              Submit content
            </h3>

            <p className="text-sm text-gray-600 mt-2 max-w-xs">
              Post videos and submit links to track performance.
            </p>

          </div>

          {/* 🔹 Step 3 */}
          <div className="flex flex-col items-center">

            <img
              src="https://www.clipster.gg/onboarding/get-paid.svg"
              alt="get paid"
              className="w-full max-w-[320px] h-auto object-contain"
            />

            <h3 className="mt-5 text-lg font-semibold text-gray-900">
              Get paid
            </h3>

            <p className="text-sm text-gray-600 mt-2 max-w-xs">
              Earn automatically based on your performance.
            </p>

          </div>

        </div>

        {/* 🔥 CTA */}
        <div className="mt-10">
           <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full font-medium text-sm sm:text-base hover:opacity-90 transition"
          >
            Start Earning 
          </button>
        </div>

      </div>
    </section>
  );
}