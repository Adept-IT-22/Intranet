import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const LoginSignup = () => {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="auth-loading-container">
        <div className="auth-loading-text">Loading session...</div>
      </div>
    );
  }

  return (
    <div className="login-page-container">
      {/* Left side - Auth0 Trigger */}
      <div className="login-left-panel">
        <div className="auth-form-container">
          <h1 className="login-title">Intranet</h1>
          <h2 className="login-subtitle">
            Sign in to access your dashboard.
          </h2>

          <button
            onClick={() => loginWithRedirect()}
            className="login-button"
          >
            Log In To Access Your Account
          </button>
        </div>
      </div>

      {/* Right side - Background Image */}
      <div className="login-right-panel">
        <div className="login-overlay"></div>
        <div className="login-welcome-content">
          <div className="login-welcome-box">
            <div className="login-avatar-circle">
              <svg className="login-avatar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-5.19 4.593-9.362 9.754-10.035" />
              </svg>
            </div>
            <h3 className="login-welcome-title">Welcome Back</h3>
            <p className="login-welcome-subtitle">Adept-IT Intranet Hub</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
