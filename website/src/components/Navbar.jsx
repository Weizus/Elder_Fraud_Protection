import {Link} from 'react-router-dom';




function Navbar({ onSignOut, isSigningOut = false }){


    return (
        <header className="bg-white sticky top-0 z-50 w-full border-b border-[#c2c6d1]/20">
      <div className="flex justify-between items-center w-full px-8 py-4 max-w-7xl mx-auto">
        <Link to ="/" className="text-2xl font-bold text-[#003461] tracking-tighter">
          Elder Fraud Protection
        </Link>
 
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to ="/"
            className="text-[#004B87] font-bold border-b-2 border-[#004B87] pb-1 text-lg tracking-tight"
          >
            Protection
          </Link>
          <a
            href="#"
            className="text-slate-600 hover:text-[#004B87] transition-colors text-lg tracking-tight"
          >
            Resources
          </a>
          <a
            href="#"
            className="  text-slate-600 hover:text-[#004B87] transition-colors text-lg tracking-tight"
          >
            Support
          </a>
        </nav>
 
        {onSignOut ? (
          <button
            onClick={onSignOut}
            disabled={isSigningOut}
            className="primary-gradient text-black px-6 py-2 rounded-lg font-semibold transition-transform active:scale-95 disabled:opacity-60"
          >
            {isSigningOut ? "Signing out..." : "Sign Out"}
          </button>
        ) : (
          <Link to="/login" className="primary-gradient text-black px-6 py-2 rounded-lg font-semibold transition-transform active:scale-95">
            Sign In
          </Link>
        )}
      </div>
    </header>
    )
}

export default Navbar;