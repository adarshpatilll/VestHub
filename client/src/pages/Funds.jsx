import { useEffect, useState } from "react";
import { Eye, Pencil, PlusCircle, Share2 } from "lucide-react";
import { getSendersWhoSharedWithMe } from "../firebase/data";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import ButtonCard from "./../components/ButtonCard";

const Funds = () => {
   const location = useLocation();
   const isBasePath = location.pathname === "/funds";
   const [senders, setSenders] = useState([]);

   useEffect(() => {
      const fetchSenders = async () => {
         const result = await getSendersWhoSharedWithMe();
         setSenders(result);
      };
      fetchSenders();
   }, []);

   const buttons = [
      { icon: Eye, label: "View Funds", to: "view-funds" },
      { icon: Pencil, label: "Edit Funds", to: "edit-funds" },
      { icon: PlusCircle, label: "Add Fund", to: "add-fund" },
   ];

   if (senders.length > 0) {
      buttons.push({ icon: Share2, label: "Shared Funds", to: "shared-funds" });
   }

   return (
      <section className="max-w-5xl mx-auto">
         {isBasePath ? (
            <motion.div
               initial="hidden"
               animate="visible"
               variants={{
                  hidden: { opacity: 0 },
                  visible: {
                     opacity: 1,
                     transition: { staggerChildren: 0.2 },
                  },
               }}
               className="grid gap-4 md:grid-cols-3 p-4"
            >
               {buttons.map((btn, i) => (
                  <motion.div
                     key={i}
                     variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                     }}
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.97 }}
                     transition={{ duration: 0.4 }}
                  >
                     <ButtonCard
                        icon={btn.icon}
                        label={btn.label}
                        to={btn.to}
                     />
                  </motion.div>
               ))}
            </motion.div>
         ) : (
            <Outlet />
         )}
      </section>
   );
};

export default Funds;
