import { formatSchemeName } from "../lib/formatSchemeName";
import { formatNumber } from "../lib/formatNumber";
import { Pencil } from "lucide-react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { toast } from "sonner";
import { useFundsContext } from "../context/FundContext";
import React, { useState } from "react";
import DeleteModal from "./DeleteModal";
import { AnimatePresence, motion } from "framer-motion";

const FundCard = ({
   filteredFunds,
   editMode,
   onEdit,
   editSwitch,
   setActiveCategory,
}) => {
   const { remove } = useFundsContext();
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [fundToDelete, setFundToDelete] = useState(null);

   const handleDeleteFund = (fund) => {
      if (!editSwitch) {
         toast.warning(
            "Please enable edit mode in account settings to delete funds.",
         );
         return;
      }
      setFundToDelete(fund);
      setShowDeleteModal(true);
   };

   const confirmDelete = async (fund) => {
      try {
         await remove(fund.id);
         setActiveCategory(null);
         toast.success(`Deleted ${formatSchemeName(fund.schemeName)}.`);
      } catch (error) {
         toast.error(`Failed to delete ${formatSchemeName(fund.schemeName)}.`);
      } finally {
         setShowDeleteModal(false);
         setFundToDelete(null);
      }
   };

   return (
      <>
         <motion.div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="visible"
            variants={{
               hidden: {},
               visible: {
                  transition: { staggerChildren: 0.1 },
               },
            }}
         >
            <AnimatePresence>
               {filteredFunds.map((fund) => {
                  const isProfit = Number(fund.pnl) >= 0;
                  return (
                     <motion.div
                        key={fund.id}
                        className={`relative rounded-2xl border border-neutral-700/60 bg-neutral-900/80 p-5 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-yellow-500/60 hover:shadow-xl ${editMode ? "mb-3" : ""}`}
                        variants={{
                           hidden: { opacity: 0 },
                           visible: { opacity: 1 },
                        }}
                        transition={{ duration: 0.3 }}
                     >
                        {/* Scheme Name */}
                        <h3 className="mb-3 line-clamp-2 text-lg leading-snug font-semibold text-yellow-500">
                           {formatSchemeName(fund.schemeName)}
                        </h3>

                        {/* Fund Details */}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                           {Object.entries({
                              Folio: fund.folioNumber,
                              Invested: `₹ ${formatNumber(fund.investedAmount)}`,
                              Units: formatNumber(fund.units),
                              NAV: `₹ ${fund.nav}`,
                              Current: `₹ ${formatNumber(fund.currentAmount)}`,
                              PnL: {
                                 value: `₹ ${formatNumber(fund.pnl)}`,
                                 className: isProfit
                                    ? "text-green-400"
                                    : "text-red-400",
                              },
                              Returns: {
                                 value: `${formatNumber(fund.returns)}%`,
                                 className: isProfit
                                    ? "text-green-400"
                                    : "text-red-400",
                              },
                              Date: fund.navDate,
                           }).map(([label, data]) => (
                              <React.Fragment key={label}>
                                 <p className="text-gray-400">{label}:</p>
                                 {typeof data === "object" ? (
                                    <p
                                       className={`font-medium ${data.className}`}
                                    >
                                       {data.value}
                                    </p>
                                 ) : (
                                    <p className="text-light">{data}</p>
                                 )}
                              </React.Fragment>
                           ))}
                        </div>

                        {/* Floating Edit/Delete Buttons */}
                        {editMode && (
                           <div className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2">
                              <button
                                 onClick={() => {
                                    if (!editSwitch) {
                                       toast.warning(
                                          "Please enable edit mode in account settings to edit funds.",
                                       );
                                       return;
                                    }
                                    return onEdit?.(fund);
                                 }}
                                 className="group flex items-center gap-1 rounded-md bg-blue-600/80 px-3 py-1 text-xs font-medium text-white shadow-md backdrop-blur-sm transition-all duration-300 hover:bg-blue-500 hover:shadow-blue-400/50"
                              >
                                 <Pencil
                                    size={14}
                                    className="transition-transform group-hover:rotate-12"
                                 />
                                 Edit
                              </button>

                              {/* Delete Button (opens modal) */}
                              <button
                                 onClick={() => handleDeleteFund(fund)}
                                 className="group flex items-center gap-1 rounded-md bg-red-600/80 px-3 py-1 text-xs font-medium text-white shadow-md backdrop-blur-sm transition-all duration-300 hover:bg-red-500 hover:shadow-red-400/50"
                              >
                                 <RiDeleteBin6Line
                                    size={14}
                                    className="transition-transform group-hover:scale-110"
                                 />
                                 Delete
                              </button>
                           </div>
                        )}
                     </motion.div>
                  );
               })}
            </AnimatePresence>
         </motion.div>

         {/* Delete Modal */}
         {showDeleteModal && (
            <DeleteModal
               fund={fundToDelete}
               onCancel={() => {
                  setShowDeleteModal(false);
                  setFundToDelete(null);
               }}
               onConfirm={confirmDelete}
            />
         )}
      </>
   );
};

export default FundCard;
