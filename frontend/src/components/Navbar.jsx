import { Link, NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* LOGO */}

        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-icon">▱</span>

          <span>Study Planner</span>
        </Link>

        {/* NAVIGATION */}

        <div className="navbar-links">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Home
          </NavLink>

          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            About
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
