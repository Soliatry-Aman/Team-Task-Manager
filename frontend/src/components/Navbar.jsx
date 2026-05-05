import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";

const Navbar = ({ onMenuToggle }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // ── Search state ──────────────────────────────────────────────
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ projects: [], tasks: [] });
  const [searching, setSearching] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);

  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Cache fetched data so we don't refetch on every keystroke
  const dataCache = useRef({ projects: [], tasks: [] });
  const dataLoaded = useRef(false);

  // ── Logout ────────────────────────────────────────────────────
  const handleLogout = () => {
    try {
      logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // ── User initials ─────────────────────────────────────────────
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  // ── Fetch all searchable data once ───────────────────────────
  const loadData = useCallback(async () => {
    if (dataLoaded.current) return;
    try {
      setSearching(true);
      const projectsRes = await axiosInstance.get("/projects");
      const projects = projectsRes.data || [];

      let allTasks = [];
      for (const project of projects) {
        const tasksRes = await axiosInstance.get(`/tasks/${project._id}`);
        const tasks = (tasksRes.data || []).map((t) => ({
          ...t,
          projectTitle: project.title,
          projectId: project._id,
        }));
        allTasks = [...allTasks, ...tasks];
      }

      dataCache.current = { projects, tasks: allTasks };
      dataLoaded.current = true;
    } catch (err) {
      console.error("Search data fetch failed:", err);
    } finally {
      setSearching(false);
    }
  }, []);

  // ── Global ⌘K / Ctrl+K shortcut ──────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (searchOpen) {
          closeSearch();
        } else {
          openSearch();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchOpen]);

  // ── Open search ───────────────────────────────────────────────
  const openSearch = () => {
    setSearchOpen(true);
    setQuery("");
    setResults({ projects: [], tasks: [] });
    setHighlightIdx(-1);
    loadData();
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // ── Close search ──────────────────────────────────────────────
  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
    setResults({ projects: [], tasks: [] });
    setHighlightIdx(-1);
  };

  // ── Filter on query change ────────────────────────────────────
  useEffect(() => {
    if (!query.trim()) {
      setResults({ projects: [], tasks: [] });
      setHighlightIdx(-1);
      return;
    }
    const q = query.toLowerCase();
    const matchedProjects = dataCache.current.projects.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
    const matchedTasks = dataCache.current.tasks.filter(
      (t) =>
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
    );
    setResults({ projects: matchedProjects.slice(0, 5), tasks: matchedTasks.slice(0, 6) });
    setHighlightIdx(-1);
  }, [query]);

  // ── Click outside closes dropdown ────────────────────────────
  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        closeSearch();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [searchOpen]);

  // ── Keyboard navigation ───────────────────────────────────────
  const allResults = [
    ...results.projects.map((p) => ({ type: "project", item: p })),
    ...results.tasks.map((t) => ({ type: "task", item: t })),
  ];

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      closeSearch();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((prev) => Math.min(prev + 1, allResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && highlightIdx >= 0) {
      handleResultClick(allResults[highlightIdx]);
    }
  };

  // ── Navigate on result click ──────────────────────────────────
  const handleResultClick = ({ type, item }) => {
    closeSearch();
    if (type === "project") {
      navigate(`/projects/${item._id}`);
    } else {
      navigate(`/projects/${item.projectId}`);
    }
  };

  const hasResults = results.projects.length > 0 || results.tasks.length > 0;
  const showDropdown = searchOpen && query.trim().length > 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

        .nav-logo:hover .nav-logo-box {
          transform: rotate(6deg) scale(1.05);
        }

        .nav-logout:hover {
          background-color: #2563eb !important;
          box-shadow: 0 4px 16px rgba(37,99,235,0.35) !important;
        }

        .nav-logout:active {
          transform: scale(0.97);
        }

        .nav-menu-btn:hover {
          background-color: rgba(15,23,42,0.08) !important;
        }

        .nav-search-btn:hover {
          background-color: rgba(15,23,42,0.06) !important;
        }

        .search-result-item:hover,
        .search-result-item.highlighted {
          background-color: #f1f5f9 !important;
        }

        @media (min-width: 768px) {
          .nav-menu-btn {
            display: none !important;
          }
        }

        @media (max-width: 767px) {
          .nav-user-meta {
            display: none !important;
          }

          .nav-divider {
            display: none !important;
          }

          .nav-logout-text {
            display: none !important;
          }

          .nav-logout {
            padding: 8px !important;
          }

          .nav {
            padding: 0 14px !important;
          }

          .nav-brand-name {
            font-size: 14px !important;
          }

          .nav-brand-sub {
            font-size: 9px !important;
          }

          .search-expanded {
            max-width: 180px !important;
          }
        }
      `}</style>

      <nav style={styles.nav} className="nav">
        {/* Left Side */}
        <div style={styles.brandWrapper}>
          {/* Mobile Menu */}
          <button
            onClick={onMenuToggle}
            style={styles.menuBtn}
            className="nav-menu-btn"
            aria-label="Toggle menu"
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="3" y1="6" x2="21" y2="6" strokeWidth="2" strokeLinecap="round" />
              <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" strokeLinecap="round" />
              <line x1="3" y1="18" x2="21" y2="18" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {/* Brand */}
          <div
            className="nav-logo"
            onClick={() => navigate("/")}
            style={styles.brand}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") navigate("/"); }}
          >
            <div style={styles.logoBox} className="nav-logo-box">
              <span style={styles.logoLetter}>T</span>
            </div>

            <div style={styles.brandText}>
              <span style={styles.brandName} className="nav-brand-name">TeamTask</span>
              <span style={styles.brandSub} className="nav-brand-sub">Workspace</span>
            </div>
          </div>
        </div>

        {/* Center / Search */}
        <div style={styles.searchZone} ref={searchRef}>
          {/* Collapsed: icon button */}
          {!searchOpen && (
            <button
              id="global-search-btn"
              onClick={openSearch}
              style={styles.searchBtn}
              className="nav-search-btn"
              aria-label="Open search"
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span style={styles.searchBtnText}>Search…</span>
              <span style={styles.searchKbd}>⌘K</span>
            </button>
          )}

          {/* Expanded: input + dropdown */}
          {searchOpen && (
            <div style={styles.searchExpanded} className="search-expanded">
              <div style={styles.searchInputWrap}>
                {/* Search Icon */}
                <svg
                  style={styles.searchInputIcon}
                  width="15" height="15" viewBox="0 0 24 24"
                  fill="none" stroke="#94a3b8" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>

                <input
                  ref={inputRef}
                  id="global-search-input"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search projects & tasks…"
                  style={styles.searchInput}
                  autoComplete="off"
                />

                {/* Spinner or close */}
                {searching ? (
                  <div style={styles.searchSpinner} />
                ) : (
                  <button
                    onClick={closeSearch}
                    style={styles.searchCloseBtn}
                    type="button"
                    aria-label="Close search"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Dropdown Results */}
              {showDropdown && (
                <div style={styles.dropdown} id="search-results-dropdown">
                  {!hasResults ? (
                    <div style={styles.noResults}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <span>No results for "<strong>{query}</strong>"</span>
                    </div>
                  ) : (
                    <>
                      {/* Projects Section */}
                      {results.projects.length > 0 && (
                        <div style={styles.resultSection}>
                          <p style={styles.resultSectionLabel}>Projects</p>
                          {results.projects.map((project, i) => {
                            const idx = i;
                            return (
                              <button
                                key={project._id}
                                className={`search-result-item${highlightIdx === idx ? " highlighted" : ""}`}
                                style={styles.resultItem}
                                onClick={() => handleResultClick({ type: "project", item: project })}
                                type="button"
                              >
                                <div style={{ ...styles.resultIcon, backgroundColor: "#eff6ff" }}>
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round">
                                    <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                                  </svg>
                                </div>
                                <div style={styles.resultText}>
                                  <span style={styles.resultTitle}>{project.title}</span>
                                  {project.description && (
                                    <span style={styles.resultSub}>{project.description.slice(0, 60)}{project.description.length > 60 ? "…" : ""}</span>
                                  )}
                                </div>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round">
                                  <path d="M9 18l6-6-6-6" />
                                </svg>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Tasks Section */}
                      {results.tasks.length > 0 && (
                        <div style={styles.resultSection}>
                          {results.projects.length > 0 && <div style={styles.resultDivider} />}
                          <p style={styles.resultSectionLabel}>Tasks</p>
                          {results.tasks.map((task, i) => {
                            const idx = results.projects.length + i;
                            const statusColor = {
                              "Done": "#22c55e",
                              "In Progress": "#f59e0b",
                              "To Do": "#94a3b8",
                            }[task.status] || "#94a3b8";

                            return (
                              <button
                                key={task._id}
                                className={`search-result-item${highlightIdx === idx ? " highlighted" : ""}`}
                                style={styles.resultItem}
                                onClick={() => handleResultClick({ type: "task", item: task })}
                                type="button"
                              >
                                <div style={{ ...styles.resultIcon, backgroundColor: "#f0fdf4" }}>
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <path d="M9 12l2 2 4-4" />
                                  </svg>
                                </div>
                                <div style={styles.resultText}>
                                  <span style={styles.resultTitle}>{task.title}</span>
                                  <span style={styles.resultSub}>
                                    {task.projectTitle}
                                    {task.status && (
                                      <>
                                        {" · "}
                                        <span style={{ color: statusColor, fontWeight: 600 }}>{task.status}</span>
                                      </>
                                    )}
                                  </span>
                                </div>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round">
                                  <path d="M9 18l6-6-6-6" />
                                </svg>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Footer hint */}
                      <div style={styles.dropdownFooter}>
                        <span>↑↓ Navigate</span>
                        <span>↵ Open</span>
                        <span>Esc Close</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side */}
        <div style={styles.right}>
          {/* User Info */}
          <div style={styles.userInfo}>
            <div style={styles.userMeta} className="nav-user-meta">
              <p style={styles.userName}>{user?.name || "Guest"}</p>
            </div>

            <div style={styles.avatar}>{initials}</div>
          </div>

          {/* Divider */}
          <div style={styles.divider} className="nav-divider" />

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={styles.logoutBtn}
            className="nav-logout"
            type="button"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path
                d="M6 2H3a1 1 0 00-1 1v9a1 1 0 001 1h3M10 10l3-3-3-3M13 7H6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="nav-logout-text">Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
};

const styles = {
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    width: "100%",
    height: "64px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    backgroundColor: "rgba(255,255,255,0.88)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderBottom: "1px solid rgba(15,23,42,0.07)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    boxSizing: "border-box",
    gap: "12px",
  },

  menuBtn: {
    display: "none",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "8px",
    color: "#0f172a",
    transition: "background-color 200ms ease",
    borderRadius: "8px",
    marginRight: "8px",
  },

  brandWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexShrink: 0,
    minWidth: 0,
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    userSelect: "none",
    minWidth: 0,
    outline: "none",
  },

  logoBox: {
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    backgroundColor: "#0f172a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 200ms ease",
    flexShrink: 0,
  },

  logoLetter: {
    color: "#fff",
    fontSize: "16px",
    fontWeight: 800,
    letterSpacing: "-0.04em",
  },

  brandText: {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1,
    gap: "2px",
    minWidth: 0,
  },

  brandName: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#0f172a",
    letterSpacing: "-0.02em",
    whiteSpace: "nowrap",
  },

  brandSub: {
    fontSize: "10px",
    fontWeight: 600,
    color: "#2563eb",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },

  // ── Search ──────────────────────────────────────────
  searchZone: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    maxWidth: "480px",
    margin: "0 auto",
  },

  searchBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 14px",
    backgroundColor: "#f1f5f9",
    border: "1px solid rgba(15,23,42,0.08)",
    borderRadius: "10px",
    fontSize: "13px",
    color: "#94a3b8",
    cursor: "pointer",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    transition: "background-color 150ms ease",
    width: "100%",
    maxWidth: "340px",
    fontWeight: 500,
  },

  searchBtnText: {
    flex: 1,
    textAlign: "left",
  },

  searchKbd: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#cbd5e1",
    backgroundColor: "rgba(15,23,42,0.05)",
    border: "1px solid rgba(15,23,42,0.08)",
    borderRadius: "5px",
    padding: "1px 6px",
    fontFamily: "monospace",
  },

  searchExpanded: {
    position: "relative",
    width: "100%",
    maxWidth: "480px",
  },

  searchInputWrap: {
    display: "flex",
    alignItems: "center",
    gap: "0",
    backgroundColor: "#fff",
    border: "1.5px solid #2563eb",
    borderRadius: "10px",
    boxShadow: "0 0 0 3px rgba(37,99,235,0.1)",
    overflow: "hidden",
    padding: "0 10px",
  },

  searchInputIcon: {
    flexShrink: 0,
    marginRight: "6px",
  },

  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    padding: "10px 0",
    fontSize: "13px",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    color: "#0f172a",
    backgroundColor: "transparent",
    fontWeight: 500,
  },

  searchCloseBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#94a3b8",
    padding: "4px",
    borderRadius: "5px",
    flexShrink: 0,
    marginLeft: "4px",
  },

  searchSpinner: {
    width: "14px",
    height: "14px",
    border: "2px solid #e2e8f0",
    borderTop: "2px solid #2563eb",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    flexShrink: 0,
    marginLeft: "6px",
  },

  dropdown: {
    position: "absolute",
    top: "calc(100% + 6px)",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    border: "1px solid rgba(15,23,42,0.09)",
    borderRadius: "14px",
    boxShadow: "0 12px 40px rgba(15,23,42,0.14), 0 2px 8px rgba(15,23,42,0.06)",
    overflow: "hidden",
    zIndex: 999,
    padding: "8px",
  },

  noResults: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "18px 12px",
    color: "#94a3b8",
    fontSize: "13px",
    fontWeight: 500,
  },

  resultSection: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },

  resultSectionLabel: {
    fontSize: "10px",
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    padding: "6px 10px 4px",
  },

  resultDivider: {
    height: "1px",
    backgroundColor: "rgba(15,23,42,0.06)",
    margin: "6px 0",
  },

  resultItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 10px",
    borderRadius: "9px",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
    transition: "background-color 100ms ease",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },

  resultIcon: {
    width: "30px",
    height: "30px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  resultText: {
    display: "flex",
    flexDirection: "column",
    gap: "1px",
    flex: 1,
    minWidth: 0,
  },

  resultTitle: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#0f172a",
    letterSpacing: "-0.01em",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  resultSub: {
    fontSize: "11px",
    color: "#94a3b8",
    fontWeight: 500,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  dropdownFooter: {
    display: "flex",
    gap: "12px",
    padding: "8px 12px 4px",
    borderTop: "1px solid rgba(15,23,42,0.06)",
    marginTop: "4px",
    fontSize: "10px",
    color: "#cbd5e1",
    fontWeight: 600,
    letterSpacing: "0.02em",
  },

  // ── Right side ─────────────────────────────────────
  right: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flexShrink: 0,
  },

  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  userMeta: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "1px",
  },

  userName: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#0f172a",
  },

  avatar: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    backgroundColor: "#e0e7ff",
    color: "#3730a3",
    fontSize: "12px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid #fff",
    boxShadow: "0 0 0 1px rgba(15,23,42,0.08)",
    flexShrink: 0,
  },

  divider: {
    width: "1px",
    height: "20px",
    backgroundColor: "rgba(15,23,42,0.1)",
  },

  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    backgroundColor: "#0f172a",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background-color 150ms ease, box-shadow 150ms ease, transform 100ms ease",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    whiteSpace: "nowrap",
  },
};

export default Navbar;
