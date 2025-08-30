import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSendersWhoSharedWithMe } from "../firebase/data";
import { User } from "lucide-react";
import BackButton from "../components/BackButtonOrLink";
import { motion, AnimatePresence } from "framer-motion";
import CircularLoader from "./../components/CircularLoader";
import { useFundsContext } from "../context/FundContext";

const SharedSenders = () => {
   const [senders, setSenders] = useState([]);
   const [loading, setLoading] = useState(true);
   const navigate = useNavigate();

   const { setIsFetchSharedFunds } = useFundsContext();

   // This is updating shared funds data when user comes to /shared-senders
   useEffect(() => {
      setIsFetchSharedFunds(true);
   }, []);

   // Fetch senders who shared funds with the user
   useEffect(() => {
      const fetchSenders = async () => {
         setLoading(true);
         try {
            const result = await getSendersWhoSharedWithMe();
            setSenders(result);
         } catch (err) {
            console.error("Error fetching senders:", err);
         }
         setLoading(false);
      };
      fetchSenders();
   }, []);

   return (
      <motion.div
         className="bg-dark text-light mx-auto min-h-full max-w-5xl px-2 py-2"
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         transition={{ duration: 0.4 }}
      >
         {/* Header */}
         <motion.div
            className="mb-4 flex items-center justify-between"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
         >
            <motion.h2
               initial={{ scale: 0.95 }}
               animate={{ scale: 1 }}
               transition={{ duration: 0.3 }}
               className="text-lg font-semibold"
            >
               Senders
            </motion.h2>

            <motion.div
               initial={{ scale: 0.95 }}
               animate={{ scale: 1 }}
               transition={{ duration: 0.3 }}
            >
               <BackButton isLink />
            </motion.div>
         </motion.div>

         {/* Loading */}
         {loading && <CircularLoader label="Loading Senders..." />}

         {/* No senders */}
         {!loading && senders.length === 0 && (
            <motion.p
               className="mt-5 text-center text-sm text-neutral-400"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.3 }}
            >
               No one has shared funds with you yet.
            </motion.p>
         )}

         {/* Sender buttons with stagger animation */}
         <motion.div
            className="flex flex-col gap-3"
            initial="hidden"
            animate="visible"
            variants={{
               hidden: { opacity: 0 },
               visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 },
               },
            }}
         >
            <AnimatePresence>
               {senders.map((sender) => (
                  <motion.button
                     key={sender.senderId}
                     onClick={() => {
                        localStorage.setItem(
                           "senderId",
                           JSON.stringify({
                              senderId: btoa(sender.senderId),
                              senderEmail: btoa(sender.senderEmail),
                           }),
                        );
                        navigate("details", {
                           state: {
                              senderId: sender.senderId,
                              senderEmail: sender.senderEmail,
                           },
                        });
                     }}
                     className="flex items-center gap-3 rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3 text-left"
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                     }}
                     transition={{ duration: 0.3 }}
                  >
                     <User className="h-5 w-5 text-yellow-400" />
                     <div>
                        <p className="font-medium">
                           {sender.senderName || sender.senderEmail}
                        </p>
                        {sender.senderEmail && (
                           <p className="text-xs text-neutral-400">
                              {sender.senderEmail}
                           </p>
                        )}
                     </div>
                  </motion.button>
               ))}
            </AnimatePresence>
         </motion.div>
      </motion.div>
   );
};

export default SharedSenders;
