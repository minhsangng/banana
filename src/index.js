// index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Login from "./Login";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Login />
    <App />
  </React.StrictMode>
);

reportWebVitals();
