import React from "react";
import ReactDOM from "react-dom/client";
import { AppRouter } from "./app/router";

// Global styles
const globalStyles = document.createElement("style");
globalStyles.textContent = `
  * {
    box-sizing: border-box;
  }
  
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  button:hover:not(:disabled) {
    filter: brightness(0.95);
  }
  
  button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;
document.head.appendChild(globalStyles);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
