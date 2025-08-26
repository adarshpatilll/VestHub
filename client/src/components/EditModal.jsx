import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { getCalculations } from "../lib/getCalculations";
import { toast } from "sonner";
import SearchSelect from "../components/SearchSelect";
import { toTitleCase } from "../lib/toTitleCase";
import { motion, AnimatePresence } from "framer-motion";

const EditModal = ({
   fund,
   onClose,
   edit,
   categories,
   error,
   loading,
   setActiveCategory,
}) => {
   const [schemes, setSchemes] = useState([]);
   const [loadingSchemes, setLoadingSchemes] = useState(true);
   const [loadingNav, setLoadingNav] = useState(false);

   // Local state to edit fund
   const [fundDetails, setFundDetails] = useState(fund);

   // Fetch schemes
   useEffect(() => {
      (async () => {
         try {
            const res = await fetch(
               "https://my-nav-rose.vercel.app/api/getList",
            );
            const json = await res.json();
            setSchemes(json.data || []);
         } catch (err) {
            console.error("Failed to fetch schemes", err);
         } finally {
            setLoadingSchemes(false);
         }
      })();
   }, []);

   // Update NAV when scheme changes
   useEffect(() => {
      if (fundDetails.schemeName) {
         setLoadingNav(true);

         const fetchedNav = schemes.find(
            (s) => s.schemeName === fundDetails.schemeName,
         );

         setFundDetails((prev) => ({
            ...prev,
            nav: fetchedNav?.latestNav || prev.nav,
            navDate: fetchedNav?.navDate || prev.navDate,
         }));

         setLoadingNav(false);
      }
   }, [fundDetails.schemeName, schemes]);

   // Auto update calculations
   useEffect(() => {
      if (fundDetails.units && fundDetails.nav && fundDetails.investedAmount) {
         const { currentAmount, pnl, returns } = getCalculations(
            fundDetails.units,
            fundDetails.nav,
            fundDetails.investedAmount,
         );

         setFundDetails((prev) => ({
            ...prev,
            currentAmount: currentAmount,
            pnl,
            returns,
         }));
      }
   }, [fundDetails.units, fundDetails.nav, fundDetails.investedAmount]);

   // Input handler
   const handleChange = (e) => {
      const { name, value } = e.target;
      setFundDetails((prev) => ({
         ...prev,
         [name]: value,
      }));
   };

   // Handle Update
   const handleUpdateFund = async () => {
      const isAllFieldsFilled = Object.values(fundDetails).every((f) => f);

      if (!isAllFieldsFilled) {
         toast.error("All fields are required");
         return;
      }

      await edit(fundDetails.id, fundDetails);

      if (error) {
         toast.error(`Failed to update fund: ${error}`);
      } else {
         setActiveCategory(null);
         toast.success("Fund updated successfully");
         onClose();
      }
   };

   if (loadingSchemes) {
      return (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2 rounded bg-neutral-900 p-2">
               <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />{" "}
               Loading...
            </div>
         </div>
      );
   }

   return (
      <AnimatePresence>
         <div className="absolute inset-0 top-0 right-0 bottom-0 left-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            {/* Animated Modal */}
            <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.5 }}
               className="bg-dark text-light hide-scrollbar flex max-h-[80vh] w-[90%] flex-col gap-7 overflow-y-auto rounded-xl p-4 sm:w-[90%] sm:max-w-3xl sm:rounded-2xl sm:p-6"
            >
               <div className="flex w-full items-center justify-between">
                  {/* Header */}
                  <h2 className="text-lg font-semibold sm:text-xl">
                     Edit Fund
                  </h2>

                  {/* Close button */}
                  <button
                     onClick={onClose}
                     className="hover:text-light text-neutral-400"
                  >
                     <X size={22} />
                  </button>
               </div>

               {/* Form */}
               <div className="grid grid-cols-1 gap-4 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
                  {/* Folio Number */}
                  <div className="col-span-2 flex flex-col md:col-span-1">
                     <label className="text-sm">Folio Number</label>
                     <input
                        type="text"
                        value={fundDetails.folioNumber}
                        name="folioNumber"
                        onChange={handleChange}
                        className="mt-1 rounded-lg border border-neutral-700 bg-neutral-800 p-3"
                     />
                  </div>

                  {/* Scheme Selector */}
                  <div className="col-span-2 flex flex-col md:col-span-1">
                     <SearchSelect
                        label="Scheme Name"
                        defaultValue="Select scheme"
                        value={fundDetails.schemeName}
                        onChange={(val) =>
                           setFundDetails((prev) => ({
                              ...prev,
                              schemeName: val,
                           }))
                        }
                        options={schemes.map((s) => ({
                           label: s.schemeName,
                           value: s.schemeName,
                        }))}
                     />
                  </div>

                  {/* Category Selector */}
                  <div className="col-span-2 flex flex-col md:col-span-1">
                     <SearchSelect
                        label="Category"
                        defaultValue="Select category"
                        value={toTitleCase(fundDetails.category)}
                        allowCreate={true}
                        onChange={(val) =>
                           setFundDetails((prev) => ({
                              ...prev,
                              category: val.toLowerCase(),
                           }))
                        }
                        options={categories.map((c) => ({
                           label: toTitleCase(c.name),
                           value: c.name.toLowerCase(),
                        }))}
                        autoFocus={false}
                     />
                  </div>

                  {/* Invested Amount */}
                  <div className="col-span-2 flex flex-col md:col-span-1">
                     <label className="text-sm">Invested Amount</label>
                     <input
                        type="number"
                        value={fundDetails.investedAmount}
                        name="investedAmount"
                        onChange={handleChange}
                        className="mt-1 rounded-lg border border-neutral-700 bg-neutral-800 p-3"
                     />
                  </div>

                  {/* Units */}
                  <div className="col-span-2 flex flex-col md:col-span-1">
                     <label className="text-sm">Units</label>
                     <input
                        type="number"
                        value={fundDetails.units}
                        name="units"
                        onChange={handleChange}
                        className="mt-1 rounded-lg border border-neutral-700 bg-neutral-800 p-3"
                     />
                  </div>

                  {/* NAV + Date */}
                  <div className="col-span-2 flex flex-col md:col-span-1">
                     <label className="text-sm">NAV</label>
                     <input
                        type="text"
                        value={loadingNav ? "Loading..." : fundDetails.nav}
                        readOnly
                        className="mt-1 cursor-not-allowed rounded-lg border border-neutral-700 bg-neutral-800 p-3"
                     />
                  </div>

                  <div className="col-span-2 flex flex-col md:col-span-1">
                     <label className="text-sm">NAV Date</label>
                     <input
                        type="text"
                        value={fundDetails.navDate}
                        readOnly
                        className="mt-1 cursor-not-allowed rounded-lg border border-neutral-700 bg-neutral-800 p-3"
                     />
                  </div>

                  {/* Current Amount + PnL */}
                  <div className="col-span-2 flex flex-col md:col-span-1">
                     <label className="text-sm">Current Amount</label>
                     <input
                        type="text"
                        value={fundDetails.currentAmount}
                        readOnly
                        className="mt-1 cursor-not-allowed rounded-lg border border-neutral-700 bg-neutral-800 p-3"
                     />
                  </div>

                  <div className="col-span-2 flex flex-col md:col-span-1">
                     <label className="text-sm">PnL</label>
                     <input
                        type="text"
                        value={fundDetails.pnl}
                        readOnly
                        className="mt-1 cursor-not-allowed rounded-lg border border-neutral-700 bg-neutral-800 p-3"
                     />
                  </div>

                  {/* Returns */}
                  <div className="col-span-2 flex flex-col md:col-span-1">
                     <label className="text-sm">Returns %</label>
                     <input
                        type="text"
                        value={
                           fundDetails.returns ? `${fundDetails.returns}%` : ""
                        }
                        readOnly
                        className="mt-1 cursor-not-allowed rounded-lg border border-neutral-700 bg-neutral-800 p-3"
                     />
                  </div>
               </div>

               {/* Update button */}
               <button
                  onClick={handleUpdateFund}
                  disabled={loading}
                  className={`w-full rounded-lg bg-yellow-600 p-3 font-medium hover:bg-yellow-700 ${
                     loading ? "cursor-not-allowed bg-yellow-700" : ""
                  }`}
               >
                  {loading ? "Updating..." : "Update Fund"}
               </button>
            </motion.div>
         </div>
      </AnimatePresence>
   );
};

export default EditModal;
