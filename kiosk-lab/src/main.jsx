// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import ThemeProvider from "./ThemeProvider.jsx";

//테마 CSS 추가
import "./themes/tokens.css";
import "./themes/mode-normal.css";
import "./themes/mode-hc.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
