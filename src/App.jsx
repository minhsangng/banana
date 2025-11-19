import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Stores from "./pages/Stores";
import Orders from "./pages/Orders";
import Requests from "./pages/Requests";
import "./App.css";

function App({ isLogin, onLogout }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleOnLogout = () => {
    isLogin(false);
    onLogout();
  }

  return (
    <div className="app">
      <Header onToggleSidebar={toggleSidebar} isLogin={isLogin} onLogout={handleOnLogout} />
      <Sidebar isOpen={isSidebarOpen} onLogout={onLogout} />

      <div className="main-content w-full relative">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/stores" element={<Stores />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/requests" element={<Requests />} />
        </Routes>

        <Footer />
      </div>
    </div>
  );
}

export default App;
