import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import AppProvider from "./provider/AppProvider.jsx";

// Register service worker
if (import.meta.env.DEV && "serviceWorker" in navigator) {
   window.addEventListener("load", () => {
      navigator.serviceWorker
         .register("/service-worker.js")
         .then((reg) => console.log("Dev SW registered:", reg))
         .catch((err) => console.error("Dev SW registration failed:", err));
   });
}

createRoot(document.getElementById("root")).render(
   <StrictMode>
      <AppProvider>
         <App />
      </AppProvider>
   </StrictMode>,
);
