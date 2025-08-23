import { useLocation, Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const AppContent = () => {
   const location = useLocation();

   const [path, setPath] = useState(location.pathname);

   useEffect(() => {
      setPath(location.pathname);
   }, [location.pathname]);

   const bgClass =
      path === "/login" ||
      path === "/register" ||
      path === "/reset-password" ||
      path === "/new-password"
         ? "bg-neutral-950"
         : "bg-dark";

   return (
      <div className={`${bgClass}`}>
         <AnimatePresence mode="wait">
            <motion.div key={location.pathname}>
               <Outlet />
            </motion.div>
         </AnimatePresence>
      </div>
   );
};

export default AppContent;
