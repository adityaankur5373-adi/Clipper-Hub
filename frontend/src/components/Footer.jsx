import { Instagram, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full mt-16 bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-50 text-indigo-900">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">

        {/* 🔥 Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* 🔹 Logo */}
          <div>
            <h1 className="text-xl font-bold mb-4">CLIPPER HUB</h1>

            {/* App buttons */}
            <div className="flex gap-3 mt-4">
            </div>
          </div>

          {/* 🔹 Legal */}
          <div>
            <h3 className="font-semibold mb-3 text-indigo-800">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="/privacy-policy" className="hover:text-indigo-600 transition">
                  Privacy Policy
                </a>
              </li>

              <li>
                <a href="/creator-terms" className="hover:text-indigo-600 transition">
                  Creator Terms
                </a>
              </li>

              <li>
                <a href="/brand-terms" className="hover:text-indigo-600 transition">
                  Brand Terms
                </a>
              </li>

              <li>
                <a href="/website-terms" className="hover:text-indigo-600 transition">
                  Website Terms
                </a>
              </li>
            </ul>
          </div>

          {/* 🔹 Company */}
          <div>
            <h3 className="font-semibold mb-3 text-indigo-800">Company</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="/contact" className="hover:text-indigo-600 transition">
                  Contact Us
                </a>
              </li>

              <li>
                <a href="/support" className="hover:text-indigo-600 transition">
                  Support
                </a>
              </li>

              <li>
                <a href="/jobs" className="hover:text-indigo-600 transition">
                  Jobs
                </a>
              </li>
            </ul>
          </div>

          {/* 🔹 Resources */}
          <div>
            <h3 className="font-semibold mb-3 text-indigo-800">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="/campaign-rules" className="hover:text-indigo-600 transition">
                  Campaign Rules
                </a>
              </li>

              <li>
                <a href="/community" className="hover:text-indigo-600 transition">
                  Community
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* 🔥 Bottom Section */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">

          <p className="text-xs text-gray-500">
            © 2026 Clipper Hub. All rights reserved.
          </p>

          {/* 🔹 Social Icons */}
          <div className="flex gap-4 text-indigo-700">

            <a
              href="https://instagram.com/yourusername"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram
                size={18}
                className="hover:text-pink-500 cursor-pointer transition"
              />
            </a>

            <a
              href="https://twitter.com/yourusername"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Twitter
                size={18}
                className="hover:text-blue-500 cursor-pointer transition"
              />
            </a>

            <a
              href="https://linkedin.com/in/yourusername"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin
                size={18}
                className="hover:text-blue-700 cursor-pointer transition"
              />
            </a>

          </div>

        </div>

      </div>
    </footer>
  );
}