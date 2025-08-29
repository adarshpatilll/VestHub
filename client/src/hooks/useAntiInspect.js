import { useEffect } from "react";
import { toast } from "sonner";

export default function useAntiInspect() {
   useEffect(() => {
      const blockContextMenu = (e) => e.preventDefault();

      const blockKeys = (e) => {
         if (
            e.key === "F12" ||
            (e.ctrlKey &&
               e.shiftKey &&
               ["I", "J", "C"].includes(e.key.toUpperCase())) ||
            (e.ctrlKey && e.key.toUpperCase() === "U")
         ) {
            e.preventDefault();
            toast.error("DevTools are disabled");
         }
      };

      document.addEventListener("contextmenu", blockContextMenu);
      document.addEventListener("keydown", blockKeys);

      return () => {
         document.removeEventListener("contextmenu", blockContextMenu);
         document.removeEventListener("keydown", blockKeys);
      };
   }, []);
}
