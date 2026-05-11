import { useEffect, useState } from "react";
import { MdVisibility } from "react-icons/md";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, useSignIn } from "@clerk/clerk-react";
import { fetchAuthContext, syncUserProfile } from "../lib/authApi";


function LoginPage(){
const [showPassword, setShowPassword] = useState(false);
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [errorMessage, setErrorMessage] = useState("");
const [isSubmitting, setIsSubmitting] = useState(false);
const { signIn, isLoaded, setActive } = useSignIn();
const { getToken, isLoaded: isAuthLoaded, isSignedIn } = useAuth();
const navigate = useNavigate();

useEffect(() => {
  if (isAuthLoaded && isSignedIn) {
    navigate("/dashboard");
  }
}, [isAuthLoaded, isSignedIn, navigate]);

const handleLogin = async (event) => {
  event.preventDefault();

  if (!isLoaded) {
    setErrorMessage("Authentication is still loading. Please try again.");
    return;
  }

  setErrorMessage("");
  setIsSubmitting(true);

  try {
    const result = await signIn.create({
      identifier: email,
      password,
    });

    if (result.status === "complete") {
      await setActive({ session: result.createdSessionId });
      const syncResponse = await syncUserProfile(getToken, {
        email,
      });

      if (!syncResponse.ok) {
        const syncError = await syncResponse.json().catch(() => ({}));
        throw new Error(syncError.error || "Unable to sync your profile.");
      }

      await fetchAuthContext(getToken);
      navigate("/dashboard");
      return;
    }

    setErrorMessage("Additional authentication steps are required to sign in.");
  } catch (error) {
    const clerkError = error?.errors?.[0]?.longMessage || error?.errors?.[0]?.message;
    setErrorMessage(clerkError || "Unable to sign in. Please verify your credentials.");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="bg-[#faf8ff] text-[#191b22] min-h-screen flex flex-col">
      {/* TopNavBar */}
      <Navbar/>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 pt-32 pb-20 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-40 -left-20 w-96 h-96 bg-[#d3e4ff]/30 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-20 -right-20 w-[30rem] h-[30rem] bg-[#acf4a4]/20 rounded-full blur-[120px] -z-10" />

        {/* Editorial Header */}
        <div className="max-w-md w-full mb-10 md:-ml-16">
          <h1 className="text-[#003461] font-extrabold text-5xl md:text-6xl tracking-tight leading-tight mb-4">
            Welcome back <br />to Protection.
          </h1>
          <p className="text-[#424750] text-lg leading-relaxed max-w-sm">
            Access your protection dashboard and manage your security preferences with peace of mind.
          </p>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md bg-white p-10 rounded-xl shadow-sm border border-[#c2c6d1]/20">
          <form className="space-y-8" onSubmit={handleLogin}>
            <div className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-[#191b22] font-bold text-lg block" htmlFor="email">
                  Email Address
                </label>
                <input
                  className="w-full h-14 px-5 bg-[#e1e2ec] rounded-lg border-0 focus:ring-2 focus:ring-[#27609d]/40 focus:bg-white transition-all text-[#191b22] text-lg"
                  id="email"
                  name="email"
                  placeholder="e.g. name@email.com"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[#191b22] font-bold text-lg block" htmlFor="password">
                    Password
                  </label>
                  <a className="text-[#003461] text-sm font-semibold hover:underline" href="#">
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    className="w-full h-14 px-5 bg-[#e1e2ec] rounded-lg border-0 focus:ring-2 focus:ring-[#27609d]/40 focus:bg-white transition-all text-[#191b22] text-lg"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#424750]"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <MdVisibility className="text-2xl" />
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <button
                className="w-full h-14 bg-gradient-to-br from-[#003461] to-[#004b87] text-white font-bold text-xl rounded-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                type="submit"
                disabled={isSubmitting || !email || !password}
              >
                {isSubmitting ? "Signing In..." : "Sign In"}
              </button>
              {errorMessage ? (
                <p className="text-red-600 text-sm">{errorMessage}</p>
              ) : null}
            </div>

            <div className="pt-4 text-center">
              <p className="text-[#424750] mb-4">Don't have an account yet?</p>
              <Link
                className="inline-flex items-center justify-center w-full h-14 bg-[#e7e7f1] text-[#191b22] font-bold text-lg rounded-lg hover:bg-[#e1e2ec] transition-colors"
                to="/sign-up"
              >
                Create an Account
              </Link>
            </div>
          </form>
        </div>

      </main>

      {/* Footer */}
      <Footer/>
    </div>
  );
}
export default LoginPage
