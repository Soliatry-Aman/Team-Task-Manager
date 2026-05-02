import { NavLink } from "react-router-dom";

const Sidebar = () => {
  // Navigation link styles
  const navLinkStyle = ({ isActive }) =>
    `flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
      isActive
        ? "bg-gray-900 !text-white shadow-lg scale-[1.02]"
        : "bg-transparent text-gray-600 hover:bg-gray-900 hover:!text-white hover:shadow-lg"
    }`;

  return (
    <aside className="hidden min-h-screen w-72 border-r border-gray-100 bg-white md:block">
      <div className="p-8">
        {/* Heading Section */}
        <div className="mb-10 select-none">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />

            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-600">
              Menu
            </h2>
          </div>

          <p className="mt-2 text-sm font-medium text-gray-600">
            Internal Workspace
          </p>
        </div>

        {/* Navigation Section */}
        <nav className="space-y-3">
          <NavLink
            to="/"
            className={navLinkStyle}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/projects"
            className={navLinkStyle}
          >
            Projects
          </NavLink>

          <NavLink
            to="/tasks"
            className={navLinkStyle}
          >
            Tasks
          </NavLink>
        </nav>

        {/* Need Help Button */}
        <button
          onClick={() =>
            window.open(
              "https://github.com/",
              "_blank"
            )
          }
          className="mt-20 w-full rounded-2xl border border-gray-100 bg-gray-50 p-6 text-left transition-all duration-200 hover:bg-gray-900 hover:text-white"
        >
          <p className="text-xs font-bold uppercase tracking-tight">
            Need Help?
          </p>

          <p className="mt-2 text-[11px] leading-relaxed opacity-80">
            Open documentation for project guidance and support.
          </p>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;