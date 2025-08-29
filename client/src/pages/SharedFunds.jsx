import { useEffect, useState } from "react";
import FundCard from "../components/FundCard";
import { toTitleCase } from "../lib/toTitleCase";
import BackButton from "../components/BackButtonOrLink";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { IoWallet } from "react-icons/io5";
import { searchFilter } from "../lib/searchFilter";
import { getSharedFundsBySenderId } from "../firebase/data";
import { useLocation } from "react-router-dom";
import CircularLoader from "./../components/CircularLoader";
import SmartViewWindow from "../components/SmartView";

const SharedFunds = () => {
   const location = useLocation();
   const { senderId, senderEmail } = location.state || {};

   const [funds, setFunds] = useState([]);
   const [categories, setCategories] = useState([]);
   const [loading, setLoading] = useState(true);

   const [isSmartViewWindowOpen, setIsSmartViewWindowOpen] = useState(false);
   const [isSmartViewBallVisible, setIsSmartViewBallVisible] = useState(true);

   const [activeCategory, setActiveCategory] = useState(null);
   const [query, setQuery] = useState("");
   const [showSearch, setShowSearch] = useState(false);

   // --- Fetch Funds from Firestore ---
   const backupData = localStorage.getItem("senderId");
   const backupSenderId = atob(JSON.parse(backupData).senderId);
   const backupSenderEmail = atob(JSON.parse(backupData).senderEmail);

   useEffect(() => {
      const fetchFunds = async () => {
         setLoading(true);

         if (!senderId) {
            console.error("No senderId provided in location state.");
            setLoading(false);
            return;
         }

         try {
            const fetched = await getSharedFundsBySenderId(
               senderId || backupSenderId,
            );

            setFunds(fetched);

            // Build categories dynamically
            const categoryMap = {};
            fetched.forEach((f) => {
               categoryMap[f.category] = (categoryMap[f.category] || 0) + 1;
            });

            setCategories(
               Object.entries(categoryMap).map(([name, count]) => ({
                  name,
                  count,
               })),
            );
         } catch (err) {
            console.error("Error loading shared funds:", err);
         }
         setLoading(false);
      };

      fetchFunds();
   }, [senderId]);

   // --- Filter funds ---
   let filteredFunds = activeCategory
      ? funds.filter((fund) => fund.category === activeCategory)
      : funds;

   if (query) {
      filteredFunds = searchFilter(filteredFunds, query);
   }

   return (
      <motion.div
         className="bg-dark text-light min-h-full px-2 py-2"
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         transition={{ duration: 0.4 }}
      >
         <div className="mx-auto max-w-5xl">
            <div className="pt-18">
               {/* fixed Header + Search */}
               <div className="bg-dark fixed top-14 right-0 left-0 z-30 flex flex-col gap-3 px-6 py-2 md:px-6">
                  {/* Header */}
                  <motion.div
                     className="flex items-center justify-between"
                     initial={{ opacity: 0, y: -10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.3 }}
                  >
                     <h2 className="text-lg font-semibold">Shared Funds</h2>
                     <BackButton isLink />
                  </motion.div>

                  {/* Search / Category Toggle */}
                  <div className="flex items-center justify-between gap-3">
                     <AnimatePresence mode="wait" initial={false}>
                        {!showSearch ? (
                           // --- Default State: Show Categories + Search Icon ---
                           <motion.div
                              key="categories"
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 6 }}
                              transition={{ duration: 0.2 }}
                              className="flex w-full items-center justify-between"
                           >
                              {/* Categories */}
                              <motion.div
                                 className="hide-scrollbar flex flex-1 gap-3 overflow-x-auto"
                                 initial="hidden"
                                 animate="visible"
                                 variants={{
                                    hidden: {},
                                    visible: {
                                       transition: { staggerChildren: 0.08 },
                                    },
                                 }}
                              >
                                 {/* All Category Button */}
                                 {!loading && (
                                    <motion.button
                                       onClick={() => setActiveCategory(null)}
                                       className={`flex items-center justify-center gap-2 rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                                          !activeCategory
                                             ? "bg-light/25 text-light"
                                             : "text-light bg-neutral-800 hover:bg-neutral-700"
                                       }`}
                                       variants={{
                                          hidden: { opacity: 0 },
                                          visible: { opacity: 1 },
                                       }}
                                       transition={{ duration: 0.25 }}
                                    >
                                       All{" "}
                                       <span className="text-dark flex h-5 w-5 items-center justify-center rounded-full bg-yellow-300/85 text-xs font-bold">
                                          {funds.length}
                                       </span>
                                    </motion.button>
                                 )}

                                 {/* Specific Category Buttons */}
                                 {!loading &&
                                    categories.map((cat) => (
                                       <motion.button
                                          key={cat.name}
                                          onClick={() =>
                                             setActiveCategory(cat.name)
                                          }
                                          className={`flex items-center justify-center gap-2 rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                                             activeCategory === cat.name
                                                ? "bg-light/25 text-light"
                                                : "text-light bg-neutral-800 hover:bg-neutral-700"
                                          }`}
                                          variants={{
                                             hidden: { opacity: 0 },
                                             visible: { opacity: 1 },
                                          }}
                                          transition={{ duration: 0.25 }}
                                       >
                                          {toTitleCase(cat.name)}
                                          <span className="text-dark flex h-5 w-5 items-center justify-center rounded-full bg-yellow-300/85 text-xs font-bold">
                                             {cat.count}
                                          </span>
                                       </motion.button>
                                    ))}
                              </motion.div>

                              {/* Search Icon */}
                              <motion.button
                                 onClick={() => setShowSearch(true)}
                                 className="text-light ml-3 rounded-md bg-neutral-800 p-2 hover:bg-neutral-700"
                                 whileHover={{ scale: 1.08 }}
                                 whileTap={{ scale: 0.95 }}
                              >
                                 <Search size={18} />
                              </motion.button>
                           </motion.div>
                        ) : (
                           // --- Expanded Search ---
                           <motion.div
                              key="search"
                              initial={{ opacity: 0, y: -6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              transition={{ duration: 0.2 }}
                              className="flex w-full items-center gap-2"
                           >
                              <motion.input
                                 type="text"
                                 value={query}
                                 onChange={(e) => {
                                    setQuery(e.target.value);
                                 }}
                                 placeholder="Search fund..."
                                 className="text-light h-8 flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-3 text-sm placeholder-neutral-400 outline-none"
                                 autoFocus
                                 initial={{ opacity: 0 }}
                                 animate={{ opacity: 1 }}
                                 transition={{ duration: 0.3 }}
                              />
                              <motion.button
                                 onClick={() => {
                                    setShowSearch(false);
                                    setQuery("");
                                 }}
                                 className="text-light rounded-md bg-neutral-800 p-2 hover:bg-neutral-700"
                                 whileHover={{ scale: 1.08 }}
                                 whileTap={{ scale: 0.95 }}
                              >
                                 <X size={18} />
                              </motion.button>
                           </motion.div>
                        )}
                     </AnimatePresence>
                  </div>
               </div>

               {/* Fund Cards */}
               <FundCard
                  filteredFunds={filteredFunds}
                  viewMode={true}
                  onEdit={null}
               />

               {/* Loading Spinner */}
               {loading && <CircularLoader label="Loading Funds..." />}

               {/* No Funds Message */}
               {!loading && filteredFunds.length === 0 && (
                  <p className="mt-4 text-center text-sm text-neutral-400">
                     {query
                        ? `No funds found for "${query}".`
                        : "No shared funds available in this category."}
                  </p>
               )}

               {isSmartViewBallVisible && (
                  <motion.div
                     onClick={() => {
                        setIsSmartViewWindowOpen(true);
                        setIsSmartViewBallVisible(false);
                     }}
                     className="text-dark fixed right-4 bottom-20 cursor-pointer rounded-full bg-yellow-500 p-2.5 md:bottom-4"
                     animate={{
                        boxShadow: [
                           "0 0 3px rgba(250,204,21,0.8), 0 0 6px rgba(250,204,21,0.5)",
                           "0 0 6px rgba(250,204,21,0.9), 0 0 10px rgba(250,204,21,0.6)",
                           "0 0 3px rgba(250,204,21,0.8), 0 0 6px rgba(250,204,21,0.5)",
                        ],
                        scale: [1.0, 0.9, 1.0],
                     }}
                     transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                     }}
                  >
                     <motion.div
                        animate={{
                           filter: [
                              "drop-shadow(0 0 2px rgba(250,204,21,0.7))",
                              "drop-shadow(0 0 4px rgba(250,204,21,0.9))",
                              "drop-shadow(0 0 2px rgba(250,204,21,0.7))",
                           ],
                        }}
                        transition={{
                           duration: 1.8,
                           repeat: Infinity,
                           ease: "easeInOut",
                        }}
                     >
                        <IoWallet size={18} className="text-dark" />
                     </motion.div>
                  </motion.div>
               )}

               {isSmartViewWindowOpen && (
                  <SmartViewWindow
                     funds={funds}
                     senderEmail={senderEmail || backupSenderEmail}
                     onClose={() => {
                        setIsSmartViewWindowOpen(false);
                        setIsSmartViewBallVisible(true);
                     }}
                  />
               )}
            </div>
         </div>
      </motion.div>
   );
};

export default SharedFunds;
