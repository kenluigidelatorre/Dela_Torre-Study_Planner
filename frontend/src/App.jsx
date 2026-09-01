import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import "./App.css";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import CreatePlan from "./pages/CreatePlan";
import About from "./pages/About";

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
      return savedTheme === "dark";
    }

    return true;
  });

  useEffect(() => {
    document.body.classList.toggle("light-mode", !darkMode);

    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode((previous) => !previous);
  };

  return (
    <>
      <Navbar darkMode={darkMode} toggleTheme={toggleTheme} />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/create-plan" element={<CreatePlan />} />

          <Route path="/calendar" element={<Calendar />} />

          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
