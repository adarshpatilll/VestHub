import { useState, useEffect, useMemo } from "react";
import { getCalculations } from "../lib/getCalculations";
import { toast } from "sonner";
import SearchSelect from "../components/SearchSelect";
import { toTitleCase } from "../lib/toTitleCase";
import BackButtonOrLink from "../components/BackButtonOrLink";
import { useFundsContext } from "../context/FundContext";
import { motion } from "framer-motion";
import CircularLoader from "../components/CircularLoader";
import { formatSchemeName } from "../lib/formatSchemeName";

const AddFund = () => {
   // const [schemes, setSchemes] = useState([]);
   const [loadingNav, setLoadingNav] = useState(false);

   const {
      add,
      loading,
      categories,
      schemesData: schemes,
      setIsFetchSchemesData,
   } = useFundsContext();

   useEffect(() => {
      setIsFetchSchemesData(true);
   }, []);

   const [fundDetails, setFundDetails] = useState({
      folioNumber: "",
      schemeName: "",
      investedAmount: "",
      units: "",
      nav: "",
      navDate: "",
      category: "",
      currentAmount: "",
      pnl: "",
      returns: "",
      amfiCode: "",
   });

   // Find matched scheme whenever schemeName or amfiCode changes
   const matchedFund = useMemo(() => {
      if (!fundDetails.schemeName) return null;

      // Try schemeName + amfiCode
      return (
         schemes.find(
            (data) =>
               data.schemeName === fundDetails.schemeName &&
               data.amfiCode === fundDetails.amfiCode,
         ) ||
         // fallback to amfiCode only
         schemes.find((data) => data.amfiCode === fundDetails.amfiCode) ||
         null
      );
   }, [fundDetails.schemeName]);

   // Set NAV details when matched fund is found
   useEffect(() => {
      if (!matchedFund) return;

      setLoadingNav(true);

      setFundDetails((prev) => ({
         ...prev,
         nav: matchedFund.latestNav || "",
         navDate: matchedFund.navDate || "",
         amfiCode: matchedFund.amfiCode || "",
      }));

      setLoadingNav(false);
   }, [matchedFund]);

   // Calculate derived values
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

   const handleAddFund = async () => {
      const isAllFieldsFilled = Object.values(fundDetails).every(
         (field) => field,
      );

      if (!isAllFieldsFilled) {
         toast.error("All fields are required");
         return;
      }

      toast.promise(
         add({
            folioNumber: fundDetails.folioNumber,
            schemeName: fundDetails.schemeName,
            investedAmount: fundDetails.investedAmount,
            currentAmount: fundDetails.currentAmount,
            units: fundDetails.units,
            pnl: fundDetails.pnl,
            returns: fundDetails.returns,
            nav: fundDetails.nav,
            navDate: fundDetails.navDate,
            category: fundDetails.category,
            amfiCode: fundDetails.amfiCode,
         }),
         {
            loading: "Adding fund...",
            success: () => {
               setFundDetails({
                  folioNumber: "",
                  schemeName: "",
                  investedAmount: "",
                  units: "",
                  nav: "",
                  navDate: "",
                  category: "",
                  currentAmount: "",
                  pnl: "",
                  returns: "",
                  amfiCode: "",
               });
               return "Fund added successfully";
            },
            error: (error) => {
               return `Failed to add fund: ${error.message || error}`;
            },
         },
      );
   };

   const handleChange = (e) => {
      const { name, value } = e.target;
      setFundDetails((prev) => ({
         ...prev,
         [name]: value,
      }));
   };

   if (loading) {
      return <CircularLoader label="Loading Schemes..." />;
   }

   return (
      <div className="bg-dark text-light mx-auto flex min-h-full max-w-5xl flex-col items-center px-2 py-2 md:items-start">
         <motion.div
            className="bg-dark text-light w-full max-w-md space-y-8 rounded-2xl md:max-w-full md:space-y-16"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
         >
            {/* Header */}
            <motion.div
               className="flex items-center justify-between"
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
            >
               <h2 className="text-lg font-semibold">Add Funds</h2>
               <BackButtonOrLink isLink />
            </motion.div>

            {/* Form */}
            <motion.div
               className="flex flex-col gap-4 md:grid md:grid-cols-2"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.3, duration: 0.5 }}
            >
               {/* Folio Number */}
               <div className="flex flex-col">
                  <label className="text-sm">Folio Number</label>
                  <input
                     type="text"
                     value={fundDetails.folioNumber}
                     name="folioNumber"
                     onChange={handleChange}
                     className="mt-1 rounded-lg border border-neutral-700 bg-neutral-800 p-3"
                  />
               </div>

               {/* Scheme Name */}
               <div className="flex flex-col">
                  <SearchSelect
                     label="Scheme Name"
                     value={formatSchemeName(fundDetails.schemeName)}
                     defaultValue="Select scheme"
                     onChange={(val) =>
                        setFundDetails((prev) => ({
                           ...prev,
                           schemeName: formatSchemeName(val.value),
                           amfiCode: val.amfiCode,
                        }))
                     }
                     forOnChangeReturnsObject={true}
                     options={schemes.map((s) => ({
                        label: formatSchemeName(s.schemeName),
                        value: formatSchemeName(s.schemeName),
                        amfiCode: s.amfiCode,
                     }))}
                  />
               </div>

               {/* Category */}
               <div className="flex flex-col">
                  <SearchSelect
                     label="Category"
                     value={toTitleCase(fundDetails.category)}
                     defaultValue="Select category"
                     allowCreate={true}
                     autoFocus={false}
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
                  />
               </div>

               {/* Invested Amount */}
               <div className="flex flex-col">
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
               <div className="flex flex-col">
                  <label className="text-sm">Units</label>
                  <input
                     type="number"
                     value={fundDetails.units}
                     name="units"
                     onChange={handleChange}
                     className="mt-1 rounded-lg border border-neutral-700 bg-neutral-800 p-3"
                  />
               </div>

               {/* NAV */}
               <div className="flex flex-col">
                  <label className="text-sm">NAV</label>
                  <input
                     type="text"
                     value={loadingNav ? "Loading..." : fundDetails.nav}
                     readOnly
                     className="mt-1 cursor-not-allowed rounded-lg border border-neutral-700 bg-neutral-800 p-3"
                  />
               </div>

               {/* NAV Date */}
               <div className="flex flex-col">
                  <label className="text-sm">NAV Date</label>
                  <input
                     type="text"
                     value={fundDetails.navDate}
                     readOnly
                     className="mt-1 cursor-not-allowed rounded-lg border border-neutral-700 bg-neutral-800 p-3"
                  />
               </div>

               {/* Current Amount */}
               <div className="flex flex-col">
                  <label className="text-sm">Current Amount</label>
                  <input
                     type="text"
                     value={fundDetails.currentAmount}
                     readOnly
                     className="mt-1 cursor-not-allowed rounded-lg border border-neutral-700 bg-neutral-800 p-3"
                  />
               </div>

               {/* PnL */}
               <div className="flex flex-col">
                  <label className="text-sm">PnL</label>
                  <input
                     type="text"
                     value={fundDetails.pnl}
                     readOnly
                     className="mt-1 cursor-not-allowed rounded-lg border border-neutral-700 bg-neutral-800 p-3"
                  />
               </div>

               {/* Returns */}
               <div className="flex flex-col">
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
            </motion.div>

            <motion.button
               onClick={handleAddFund}
               disabled={loading}
               className={`w-full rounded-lg bg-yellow-600 p-3 font-medium transition-colors hover:bg-yellow-700 md:max-w-sm ${
                  loading ? "cursor-not-allowed bg-yellow-700" : ""
               }`}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.5, duration: 0.3 }}
            >
               {loading ? "Adding..." : "Add Fund"}
            </motion.button>
         </motion.div>
      </div>
   );
};

export default AddFund;
