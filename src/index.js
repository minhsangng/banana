import { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import Login from "./Login";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

function RootComponent() {
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("isLogin")) setIsLogin(true);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("isLogin");
    setIsLogin(false);
  };

  return (
    <BrowserRouter>
      {isLogin ? (
        <App isLogin={isLogin} onLogout={handleLogout} />
      ) : (
        <Login
          onLoginSuccess={() => setIsLogin(true)}
        />
      )}
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<RootComponent />);

reportWebVitals();