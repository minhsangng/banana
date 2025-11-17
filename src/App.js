import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Stores from "./pages/Stores";
import Login from "./Login";
import "./App.css";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  // Kiểm tra trạng thái login từ localStorage khi app load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      handleLogin(false); // false để không ghi lại lại localStorage
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // handleLogin: ghi nhớ login vào state và localStorage
  const handleLogin = (save = true) => {
    setIsActive(true);
    setIsLogin(true);
    if (save) {
      localStorage.setItem("user", "loggedIn");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsActive(false);
    setIsLogin(false);
  };

  return (
    <BrowserRouter>
      {isLogin && (
        <>
          <Header onToggleSidebar={toggleSidebar} isLogin={isLogin} onLogout={handleLogout} />
          <Sidebar isOpen={isSidebarOpen} isActive={isActive} isLogin={isLogin} />
        </>
      )}

      <div className="main-content">
        <Routes>
          {/* Bắt buộc login trước khi vào các trang */}
          <Route
            path="/"
            element={isLogin ? <Dashboard isLogin={isLogin} /> : <Navigate to="/login" />}
          />
          <Route
            path="/users"
            element={isLogin ? <Users isLogin={isLogin} /> : <Navigate to="/login" />}
          />
          <Route
            path="/stores"
            element={isLogin ? <Stores isLogin={isLogin} /> : <Navigate to="/login" />}
          />
          {/* Trang login */}
          <Route
            path="/login"
            element={isLogin ? <Navigate to="/" /> : <Login onLogin={handleLogin} />}
          />
          {/* Nếu Lão đại muốn, có thể thêm route 404 */}
          <Route path="*" element={<Navigate to={isLogin ? "/" : "/login"} />} />
        </Routes>
      </div>

      <footer>
        <p className="text-center text-[var(--paragraph)] italic">
          &copy; 2025 | Bản quyền thuộc về{" "}
          <a href="https://github.com/minhsangng" className="underline text-[var(--heading)]">
            minhsangng
          </a>
          .
        </p>
      </footer>
    </BrowserRouter>
  );
}

export default App;
