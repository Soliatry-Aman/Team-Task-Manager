import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-xl">
      <div className="flex h-20 w-full items-center justify-between px-6">
        
        {/* Left Side: Brand Logo */}
        <div
          onClick={() => navigate("/")}
          className="group flex cursor-pointer flex-col justify-center select-none"
        >
          <h1 className="flex items-center gap-1.5 text-xl font-black tracking-tighter text-gray-900">
            <span className="rounded-md bg-black px-2 py-0.5 text-white transition-transform group-hover:rotate-3">
              T
            </span>
            TeamTask
          </h1>
          <p className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
            Workspace
          </p>
        </div>

        {/* Right Side: User Profile & Actions */}
        <div className="ml-auto flex items-center gap-4">
          
          <div className="hidden flex-col items-end mr-1 sm:flex text-right">
            <p className="text-sm font-bold leading-none text-gray-900">
              {user?.name || "Guest User"}
            </p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-tight text-gray-400">
              {user?.role || "Member"}
            </p>
          </div>

          {/* This specific order usually fixes the image_b28b56.png error */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-200 text-xs font-bold text-gray-700 shadow-inner">
            {user?.name?.charAt(0) || "U"}
          </div>

          <button
            onClick={handleLogout}
            className="ml-2 rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 ease-out hover:bg-blue-600 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-95"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;