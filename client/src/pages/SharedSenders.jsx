import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSendersWhoSharedWithMe } from "../firebase/data";
import { Loader2, User } from "lucide-react";
import BackButton from "../components/BackButtonOrLink";
import { motion, AnimatePresence } from "framer-motion";
import CircularLoader from './../components/CircularLoader';

const SharedSenders = () => {
   const [senders, setSenders] = useState([]);
   const [loading, setLoading] = useState(true);
   const navigate = useNavigate();

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
         className="bg-dark text-light min-h-full px-4 py-4"
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         transition={{ duration: 0.4 }}
      >
         <div className="mx-auto max-w-3xl">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
               <h2 className="text-lg font-semibold">Senders</h2>
               <BackButton isLink />
            </div>

            {/* Loading */}
            {loading && (
               <CircularLoader label="Loading Senders..." />
            )}

            {/* No senders */}
            {!loading && senders.length === 0 && (
               <motion.p
                  className="text-center text-sm text-neutral-400 mt-5"
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
                        onClick={() => navigate(`${sender.senderId}`)}
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
         </div>
      </motion.div>
   );
};

export default SharedSenders;
