import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001/api";

const LoginSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? "/token/" : "/signup/";
      const payload = isLogin
        ? {
            username: formData.username,
            password: formData.password,
          }
        : formData;

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        if (isLogin) {
          // Store JWT tokens correctly for Django SimpleJWT
          localStorage.setItem("access_token", data.access);
          localStorage.setItem("refresh_token", data.refresh);

          // Check if we have a redirect path saved
          const redirectTo =
            sessionStorage.getItem("redirect_after_login") || "/dashboard";

          // Clear it so it doesn’t persist for next login
          sessionStorage.removeItem("redirect_after_login");

          // Navigate to the intended page
          navigate(redirectTo);
        } else {
          // After signup, tell user to login
          alert("✅ Account created successfully! Please log in.");
          setIsLogin(true);
        }
      } else {
        alert(data.detail || data.error || "❌ Something went wrong");
      }
    } catch (err) {
      console.error("❌ Network error:", err);
      alert("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="w-full md:w-1/2 bg-gray-800 flex items-center justify-center p-8">
        <div className="auth-form w-full max-w-md">
          <h2 className="text-white text-3xl font-light mb-12 text-left">
            {isLogin ? "Login" : "Create an Account"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-white text-lg"
            />

            {!isLogin && (
              <input
                type="email"
                name="email"
                placeholder="Email (for signup)"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-white text-lg"
              />
            )}

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-white text-lg"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-48 bg-white text-gray-800 py-3 px-6 text-lg font-medium hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mt-8"
            >
              {loading ? "Please wait..." : isLogin ? "LOGIN" : "SIGN UP"}
            </button>
          </form>

          <div className="mt-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Lost password?
            </a>
          </div>

          <div className="mt-8">
            <select className="bg-transparent text-gray-300 border-0 focus:outline-none text-lg">
              <option className="bg-gray-800">English (en)</option>
              <option className="bg-gray-800">Español (es)</option>
              <option className="bg-gray-800">Français (fr)</option>
            </select>
          </div>

          <p
            className="mt-8 text-gray-400 hover:text-white cursor-pointer transition-colors"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Create an account" : "Already have an account? Login"}
          </p>
        </div>
      </div>

      {/* Right side - Background Image */}
      <div
        className="hidden md:block w-1/2 bg-cover bg-center relative"
        style={{
          backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23667eea"/><stop offset="100%" style="stop-color:%23764ba2"/></linearGradient></defs><rect width="800" height="600" fill="url(%23bg)"/><circle cx="200" cy="200" r="60" fill="white" opacity="0.1"/><circle cx="600" cy="400" r="80" fill="white" opacity="0.1"/><circle cx="400" cy="100" r="40" fill="white" opacity="0.1"/></svg>')`,
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7V9C15 11.8 12.8 14 10 14S5 11.8 5 9V7H3V9C3 12.9 6.1 16 10 16S17 12.9 17 9H21Z" />
              </svg>
            </div>
            <h3 className="text-2xl font-light mb-2">Welcome</h3>
            <p className="text-lg opacity-80">Sign in to continue</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
