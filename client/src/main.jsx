import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import AppProvider from "./provider/AppProvider.jsx";

createRoot(document.getElementById("root")).render(
   <StrictMode>
      <AppProvider>
         <App />
      </AppProvider>
   </StrictMode>,
);

// --- Service Worker Registration ---
if ("serviceWorker" in navigator) {
   window.addEventListener("load", () => {
      navigator.serviceWorker
         .register("/service-worker.js")
         .then((reg) => console.log("Service Worker registered:", reg.scope))
         .catch((err) =>
            console.error("Service Worker registration failed:", err),
         );
   });
}
