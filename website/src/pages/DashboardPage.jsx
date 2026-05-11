import { useAuth, useClerk } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { fetchAuthContext } from "../lib/authApi";

function DashboardPage() {
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const { getToken } = useAuth();
  const [authContext, setAuthContext] = useState(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    async function loadContext() {
      try {
        const response = await fetchAuthContext(getToken);
        const data = await response.json();
        setAuthContext(data);
      } catch {
        setAuthContext({
          is_authenticated: false,
          auth_error: "Unable to load auth context",
        });
      }
    }

    loadContext();
  }, [getToken]);

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await signOut();
      navigate("/login");
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <div className="bg-[#faf8ff] text-[#191b22] min-h-screen flex flex-col">
      <Navbar onSignOut={handleSignOut} isSigningOut={isSigningOut} />
      <main className="flex-grow flex flex-col items-center justify-center px-6 pt-8 pb-20">
        <div className="w-full max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-[#c2c6d1]/20">
          <div className="mb-8">
            <h1 className="text-[#003461] font-extrabold text-4xl mb-2">Dashboard</h1>
            <p className="text-[#424750]">
              Welcome back. Here's your account information.
            </p>
          </div>

          {/* Safety Metrics Section */}
          <div className="mb-8">
            <div className="flex gap-6">
              {/* Left Card - Safety Status */}
              <div className="flex-1 bg-gradient-to-br from-[#f8f9fa] to-[#f0f2f5] p-6 rounded-lg border border-[#c2c6d1]/20">
                <h2 className="text-[#003461] font-bold text-2xl mb-6 text-center">Safety Metrics</h2>
                <div className="flex flex-col items-center">
                  {/* Status Bubble */}
                  <div className="w-24 h-24 rounded-full bg-[#4caf50] flex items-center justify-center mb-6 shadow-md">
                    <div className="text-2xl font-bold text-white">Safe</div>
                  </div>
                  
                  {/* Scan Time */}
                  <div className="text-center mb-3">
                    <div className="text-sm text-[#424750] font-semibold">Last Scan Time</div>
                    <div className="text-2xl font-bold text-[#003461] font-mono">2:32 PM</div>
                  </div>
                  
                  {/* Scan Date */}
                  <div className="text-center">
                    <div className="text-sm text-[#424750] font-semibold">Last Scan Date</div>
                    <div className="text-2xl font-bold text-[#003461] font-mono">10.05.2026</div>
                  </div>
                </div>
              </div>

              {/* Right Card - Quick Actions & Stats */}
              <div className="flex-1 bg-gradient-to-br from-[#f8f9fa] to-[#f0f2f5] p-6 rounded-lg border border-[#c2c6d1]/20">
                <h2 className="text-[#003461] font-bold text-2xl mb-6 text-center">Quick Stats</h2>
                <div className="flex flex-col items-center space-y-6">
                  {/* Stats Grid */}
                  <div className="w-full grid grid-cols-2 gap-4">
                    {/* Total Scans */}
                    <div className="bg-white p-4 rounded-lg text-center border border-[#c2c6d1]/20">
                      <div className="text-2xl font-bold text-[#003461]">142</div>
                      <div className="text-xs text-[#424750] font-semibold mt-1">Total Scans</div>
                    </div>

                    {/* Threats Blocked */}
                    <div className="bg-white p-4 rounded-lg text-center border border-[#c2c6d1]/20">
                      <div className="text-2xl font-bold text-[#d32f2f]">12</div>
                      <div className="text-xs text-[#424750] font-semibold mt-1">Threats Blocked</div>
                    </div>

                    {/* Security Score */}
                    <div className="bg-white p-4 rounded-lg text-center border border-[#c2c6d1]/20">
                      <div className="text-2xl font-bold text-[#4caf50]">92%</div>
                      <div className="text-xs text-[#424750] font-semibold mt-1">Security Score</div>
                    </div>

                    {/* Protection Status */}
                    <div className="bg-white p-4 rounded-lg text-center border border-[#c2c6d1]/20">
                      <div className="text-2xl font-bold text-[#2196f3]">Active</div>
                      <div className="text-xs text-[#424750] font-semibold mt-1">Protection</div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button className="w-full bg-[#003461] hover:bg-[#002147] text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                    Scan Email Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div>
            <h3 className="text-[#003461] font-bold text-lg mb-4">Account Information</h3>
            <pre className="bg-[#f2f3fd] p-4 rounded-lg text-sm overflow-auto">
              {JSON.stringify(authContext, null, 2)}
            </pre>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default DashboardPage;
