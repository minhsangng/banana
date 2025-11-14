import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      handleLogin();
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogin = () => {
    setIsActive(true);
    setIsLogin(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsActive(false);
    setIsLogin(false);
  };

  return (
    <BrowserRouter>
      <div className="app">
        <Header onToggleSidebar={toggleSidebar} isLogin={isLogin} onLogout={handleLogout} />
        <Sidebar isOpen={isSidebarOpen} isActive={isActive} isLogin={isLogin} />

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
          &copy; 2025 | Bản quyền thuộc về <a href="https://github.com/minhsangng" className="italic underline">minhsangng.</a>
        </p>
      </footer>
    </BrowserRouter>
  );
}

export default App;