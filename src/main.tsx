import React from "react";
import ReactDOM from "react-dom/client";
import { setConsoleFunction } from "three";
import App from "./App";

if (import.meta.env.DEV) {
  const originalWarn = console.warn.bind(console);
  const originalError = console.error.bind(console);
  const originalLog = console.log.bind(console);

  setConsoleFunction((level, ...args) => {
    if (
      level === "warn" &&
      typeof args[0] === "string" &&
      args[0].includes("THREE.Clock: This module has been deprecated")
    ) {
      return;
    }

    if (level === "warn") {
      originalWarn(...args);
      return;
    }

    if (level === "error") {
      originalError(...args);
      return;
    }

    originalLog(...args);
  });
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
