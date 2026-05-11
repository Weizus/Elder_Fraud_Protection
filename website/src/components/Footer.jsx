// src/components/Footer.jsx

const links = [];

export default function Footer() {
  return (
    <footer className="w-full py-12 px-8 mt-24 border-t border-slate-200 bg-[#f2f3fd]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-xl font-bold text-[#003461]">
          Elder Fraud Protection
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {links.map((link) => (
            <a
              key={link}
              href="#"
              className="text-slate-500 hover:text-[#003461] transition-all text-base"
            >
              {link}
            </a>
          ))}
        </div>
        <p className="text-slate-500 text-base">
          ©2026 Elder Fraud Protection
        </p>
      </div>
    </footer>
  );
}