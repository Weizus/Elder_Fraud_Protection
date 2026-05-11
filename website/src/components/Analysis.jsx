// src/components/AnalysisResults.jsx

const redFlags = [
  {
    icon: "Dangerous",
    title: "Urgent Call to Action",
    body: (
      <>
        The phrase{" "}
        <span className="bg-[#ba1a1a]/10 text-[#ba1a1a] px-1 font-bold rounded">
          "wire transfer immediately"
        </span>{" "}
        and{" "}
        <span className="bg-[#ba1a1a]/10 text-[#ba1a1a] px-1 font-bold rounded">
          "account locked"
        </span>{" "}
        are used to create panic.
      </>
    ),
    tip: "Why this matters: Scammers want you to act before you think.",
  },
  {
    icon: "Suspicious Link",
    title: "Masked Web Address",
    body: (
      <>
        The link labeled "Login Now" actually points to{" "}
        <span className="bg-[#ba1a1a]/10 text-[#ba1a1a] px-1 font-bold rounded">
          bit.ly/secure-verify-993
        </span>{" "}
        instead of your bank's official website.
      </>
    ),
    tip: "Recommendation: Never click links in emails. Go to the website manually.",
  },
];

const riskFactors = [
  { label: "Urgency Level", value: "Critical" },
  { label: "Link Safety", value: "Dangerous" },
];

export default function AnalysisResults() {
  return (
    <div className="mt-20">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8 border-b border-[#e7e7f1] pb-4">
        <h2
          className="font-bold text-[#003461]"
          style={{ fontSize: "2rem" }}
        >
          Analysis Summary
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Verdict Card */}
        <div className="lg:col-span-1 bg-[#f2f3fd] p-8 rounded-xl flex flex-col items-center text-center">
          <div className="w-50 h-50 rounded-full bg-[#ffdad6] flex items-center justify-center mb-6">
            <span
              className="material-symbols-outlined text-[#ba1a1a]"
              style={{ fontSize: "48px" }}
            >
              Warning
            </span>
          </div>
          <h3 className="text-[#ba1a1a] font-extrabold text-2xl mb-2">
            High Risk: Phishing
          </h3>
          <p className="text-[#424750] text-lg mb-8">
            This email shows strong indicators of a scam attempt.
          </p>

          <div className="w-full pt-6 border-t border-[#c2c6d1]/30 text-left">
            <span className="text-xs uppercase tracking-widest text-[#727781] block mb-4">
              Risk Factors
            </span>
            <div className="space-y-3">
              {riskFactors.map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between bg-white p-3 rounded-lg"
                >
                  <span className="text-lg">{label}</span>
                  <span className="text-[#ba1a1a] font-bold">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm">
          <h3 className="text-xl font-bold text-[#003461] mb-6">
            Suspicious Elements Detected
          </h3>

          <div className="space-y-6">
            {redFlags.map(({ icon, title, body, tip }) => (
              <div key={title} className="p-6 rounded-lg bg-[#f2f3fd] flag-card">
                <div className="flex items-center gap-3 mb-2">
                  <span className="material-symbols-outlined text-[#ba1a1a]">
                    {icon}
                  </span>
                  <h4 className="font-bold text-[#191b22]">{title}</h4>
                </div>
                <p className="text-[#424750] text-lg mb-3">{body}</p>
                <p className="text-sm font-medium text-[#003461] bg-[#004b87]/10 px-3 py-1 rounded-full inline-block">
                  {tip}
                </p>
              </div>
            ))}

            {/* Understanding the Verdict */}
            <div className="mt-10 p-8 bg-[#e7e7f1] rounded-xl">
              <h4 className="font-bold text-[#191b22] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#003461]">
                  Info
                </span>
                Understanding the Verdict
              </h4>
              <p className="text-[#424750] text-lg leading-relaxed">
                Our analysis found that while this email claims to be from your
                bank, the technical signatures don't match. It uses "Social
                Engineering" — a fancy term for trying to scare you into giving
                up your password or sending money. Legitimate institutions like
                banks or the IRS will never ask for a wire transfer or personal
                info via an email link.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}