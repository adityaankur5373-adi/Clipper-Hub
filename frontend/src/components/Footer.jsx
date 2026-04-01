import { Instagram, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full mt-16 bg-gradient-to-br from-pink-100 via-pink-50 to-white text-gray-800">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">

        {/* 🔥 Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* 🔹 Logo */}
          <div>
            <h1 className="text-xl font-bold mb-4">CLIPPER HUB</h1>

            {/* App buttons */}
           <div className="flex gap-3 mt-4">

  {/* Google Play */}
  <a
    href="#"
    className="flex items-center gap-2 px-3 py-2"
  >
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
      alt="Google Play"
      className="h-8"
    />
  </a>

  {/* App Store */}
  <a
    href="#"
    className="flex items-center gap-2 px-3 py-2"
  >
    <img
      src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
      alt="App Store"
      className="h-8"
    />
  </a>

</div>
          </div>

          {/* 🔹 Legal */}
          <div>
            <h3 className="font-semibold mb-3">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Privacy Policy</li>
              <li>Creator Terms</li>
              <li>Brand Terms</li>
              <li>Website Terms</li>
            </ul>
          </div>

          {/* 🔹 Company */}
          <div>
            <h3 className="font-semibold mb-3">Company</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Contact Us</li>
              <li>Support</li>
              <li>Jobs</li>
            </ul>
          </div>

          {/* 🔹 Resources */}
          <div>
            <h3 className="font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Campaign Rules</li>
              <li>Community</li>
            </ul>
          </div>

        </div>

        {/* 🔥 Bottom Section */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">

          <p className="text-xs text-gray-500">
            © 2026 Clipper Hub. All rights reserved.
          </p>

          {/* 🔹 Social Icons */}
          <div className="flex gap-4 text-gray-600">
            <Instagram size={18} />
            <Twitter size={18} />
            <Linkedin size={18} />
          </div>

        </div>

      </div>
    </footer>
  );
}