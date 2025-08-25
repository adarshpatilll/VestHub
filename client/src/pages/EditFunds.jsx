import { useState } from "react";
import FundCard from "../components/FundCard";
import { toTitleCase } from "../lib/toTitleCase";
import BackButton from "../components/BackButtonOrLink";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { searchFilter } from "../lib/searchFilter";
import EditModal from "../components/EditModal";
import { useFundsContext } from "../context/FundContext";
import { useEditMode } from "../context/EditModeContext";
import CircularLoader from "../components/CircularLoader";

const EditFunds = () => {
   const [activeCategory, setActiveCategory] = useState(null);
   const [query, setQuery] = useState("");
   const [showSearch, setShowSearch] = useState(false);
   const [isEditMode, setIsEditMode] = useState(false);
   const [selectedFund, setSelectedFund] = useState(null);

   const { funds, categories, loading, edit, error } = useFundsContext();

   const { isEditMode: isEditSwitch } = useEditMode();

   // Filter funds by activeCategory and then search query
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
                     <h2 className="text-lg font-semibold">Edit Funds</h2>
                     <BackButton isLink />
                  </motion.div>

                  {/* Search / Category Toggle */}
                  <div className="flex items-center justify-between gap-3">
                     <AnimatePresence mode="wait" initial={false}>
                        {!showSearch ? (
                           // --- Default State: Show Categories + Search Icon ---
                           <motion.div
                              key="categories"
                              initial={{ opacity: 0, y: -6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
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
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 6 }}
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
                  editMode={true}
                  onEdit={(f) => {
                     setSelectedFund(f);
                     setIsEditMode(true);
                  }}
                  editSwitch={isEditSwitch}
                  setActiveCategory={setActiveCategory}
               />

               {/* Edit Modal */}
               {isEditSwitch && isEditMode && (
                  <EditModal
                     fund={selectedFund}
                     onClose={() => setIsEditMode(false)}
                     setActiveCategory={setActiveCategory}
                     edit={edit}
                     categories={categories}
                     error={error}
                     loading={loading}
                  />
               )}

               {/* Loading Spinner */}
               {loading && <CircularLoader label="Loading Funds..." />}

               {!loading && filteredFunds.length === 0 && (
                  <p className="mt-4 text-center text-sm text-neutral-400">
                     {query
                        ? `No funds found for "${query}".`
                        : "No funds available in this category."}
                  </p>
               )}
            </div>
         </div>
      </motion.div>
   );
};

export default EditFunds;
