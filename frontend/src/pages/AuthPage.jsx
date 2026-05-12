import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../api/authApi";
import { useAuthStore } from "../store/authStore";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
export default function AuthPage() {
  const [tab, setTab] = useState("login");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  /* ============================= */
  /* HANDLE INPUT CHANGE */
  /* ============================= */

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  /* ============================= */
  /* VALIDATION */
  /* ============================= */

  const validateForm = () => {
    const newErrors = {};

    if (tab === "signup" && !form.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ============================= */
  /* HANDLE SUBMIT */
  /* ============================= */

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (loading) return;
  if (!validateForm()) return;

  setLoading(true);

  try {
    let result;

    if (tab === "signup") {
      result = await authApi.signup({
        name: form.name,
        email: form.email,
        password: form.password,
      });
    } else {
      result = await authApi.login({
        email: form.email,
        password: form.password,
      });
    }

    // ✅ FIXED STORE CALL
    useAuthStore.getState().setAuth(result);

    toast.success(
      tab === "signup"
        ? "Account created successfully!"
        : "Logged in successfully!"
    );

    // 🔥 ADMIN REDIRECT LOGIC
   setTimeout(() => {
  if (result.user.role === "admin") {
    navigate("/admin");
  } else {
    navigate("/dashboard");
  }
}, 50);

  } catch (err) {
    console.error("Auth error:", err);
    toast.error(err.response?.data?.error || "Something went wrong");
  }

  setLoading(false);
};



  const switchTab = (type) => {
    setTab(type);
    setErrors({});
  };

  /* ============================= */
  /* UI */
  /* ============================= */

return (
  
    <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-xl p-6 sm:p-8">

      {/* Logo */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/">
          <h1 className="text-2xl sm:text-[35px] font-serif text-violet-700">
            Clipper Hub
          </h1>
        </Link>
      </div>

      <h1 className="text-xl sm:text-2xl font-bold mb-1 text-violet-700">
        {tab === "login" ? "Welcome Back" : "Create Account"}
      </h1>

      <p className="text-violet-500 mb-6 text-sm">
        {tab === "login" ? (
          <>
            Or{" "}
            <span
              onClick={() => switchTab("signup")}
              className="underline cursor-pointer hover:text-violet-700 transition"
            >
              create an account
            </span>{" "}
            to get started
          </>
        ) : (
          <>
            Already have an account?{" "}
            <span
              onClick={() => switchTab("login")}
              className="underline cursor-pointer hover:text-violet-700 transition"
            >
              Log in
            </span>
          </>
        )}
      </p>

      {/* Tabs */}
      <div className="bg-violet-100 rounded-full flex p-1 mb-6">
        <button
          onClick={() => switchTab("login")}
          className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
            tab === "login"
              ? "bg-violet-600 text-white shadow-md"
              : "text-violet-500"
          }`}
        >
          Log in
        </button>

        <button
          onClick={() => switchTab("signup")}
          className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
            tab === "signup"
              ? "bg-violet-600 text-white shadow-md"
              : "text-violet-500"
          }`}
        >
          Sign up
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {tab === "signup" && (
          <div className="mb-4">
            <label className="text-sm font-medium text-violet-700">
              Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              type="text"
              placeholder="Your name"
              className="w-full mt-1 border border-violet-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>
        )}

        <div className="mb-4">
          <label className="text-sm font-medium text-violet-700">
            Email
          </label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            type="email"
            placeholder="user@gmail.com"
            className="w-full mt-1 border border-violet-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium text-violet-700">
            Password
          </label>
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            type="password"
            placeholder="••••••••"
            className="w-full mt-1 border border-violet-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        <button
          disabled={loading}
          className="w-full bg-violet-600 text-white py-3 rounded-xl font-medium hover:bg-violet-700 transition text-sm sm:text-base disabled:opacity-50"
        >
          {loading
            ? "Please wait..."
            : tab === "login"
            ? "Sign in to Dashboard"
            : "Create Account"}
        </button>
      </form>

      {/* Google Login */}
      <div className="mt-4 flex justify-center">
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            try {
              const result = await authApi.google({
                token: credentialResponse.credential,
              });

              // ✅ FIXED: new store format
              useAuthStore.getState().setAuth(result);

              // ✅ Toast based on role
              toast.success(
                result.user.role === "admin"
                  ? "Welcome Admin 👑"
                  : "Logged in with Google successfully!"
              );

              // 🔥 Admin redirect
              setTimeout(() => {
                if (result.user.role === "admin") {
                  navigate("/admin");
                } else {
                  navigate("/dashboard");
                }
              }, 50);
            } catch (err) {
              console.error("Google login failed", err);
              toast.error("Google login failed");
            }
          }}
          onError={() => {
            toast.error("Google login failed");
          }}
        />
      </div>

    </div>

);
}