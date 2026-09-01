import { Routes, Route } from "react-router-dom";

import "./App.css";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import CreatePlan from "./pages/CreatePlan";
import About from "./pages/About";

function App() {
  return (
    <>
      <Navbar />

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
