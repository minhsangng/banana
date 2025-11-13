import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Stores from "./pages/Stores";
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import "./App.css";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isActive, setIsActive] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogin = () => {
    setIsActive(true);
  };

  return (
    <BrowserRouter>
      <div className="app">
        <Header onToggleSidebar={toggleSidebar} />
        <Sidebar isOpen={isSidebarOpen} isActive={isActive} />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/stores" element={<Stores />} />
            <Route path="/login" element={<Login isLogin={handleLogin} />} />
          </Routes>
        </div>
      </div>
      <footer>
        <p style={{ textAlign: "center", color: "var(--paragraph)" }}>
          &copy; 2025 | Bản quyền thuộc về <a href="https://github.com/minhsangng">minhsangng.</a>
        </p>
      </footer>
    </BrowserRouter>
  );
}

export default App;
