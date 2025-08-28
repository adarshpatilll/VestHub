import { motion } from "framer-motion";
import {
   PiggyBank,
   TrendingUp,
   Wallet,
   Percent,
   Briefcase,
   X,
} from "lucide-react";
import { formatNumber } from "../lib/formatNumber";

const SmartViewWindow = ({ funds, onClose, senderEmail }) => {
   let totals;

   if (senderEmail === import.meta.env.VITE_USER_EMAIL_FOR_DATA_MANIPULATION) {
      totals = funds.reduce(
         (acc, fund) => {
            acc.invested += Number(fund.investedAmount) || 0;
            acc.count += 1;

            // Exclude pnl & current only if category is "el & insurance (2022)"
            if (fund.category !== "el & insurance (2022)") {
               acc.current += Number(fund.currentAmount) || 0;
            }

            return acc;
         },
         { invested: 0, current: 0, count: 0 },
      );
   } else {
      totals = funds.reduce(
         (acc, fund) => {
            acc.invested += Number(fund.investedAmount) || 0;
            acc.current += Number(fund.currentAmount) || 0;
            acc.count += 1;
            return acc;
         },
         { invested: 0, current: 0, count: 0 },
      );
   }

   totals.pnl = totals.current - totals.invested;

   const overallReturns =
      totals.invested > 0
         ? ((totals.pnl / totals.invested) * 100).toFixed(2)
         : 0;

   const data = [
      {
         label: "Total Invested",
         value: totals.invested,
         format: (v) => `₹ ${formatNumber(v, 2)}`,
         accent: "border-sky-500/50",
         icon: PiggyBank,
         pulseColor: "bg-sky-500/10",
      },
      {
         label: "Current Value",
         value: totals.current,
         format: (v) => `₹ ${formatNumber(v, 2)}`,
         accent: "border-indigo-500/50",
         icon: Wallet,
         pulseColor: "bg-indigo-500/10",
      },
      {
         label: "PnL",
         value: totals.pnl,
         format: (v) => `₹ ${formatNumber(v, 2)}`,
         accent:
            totals.pnl >= 0
               ? "border-emerald-500/50 text-emerald-400"
               : "border-red-500/50 text-red-400",
         icon: TrendingUp,
         pulseColor: totals.pnl >= 0 ? "bg-emerald-500/10" : "bg-red-500/10",
         textColor: totals.pnl >= 0 ? "text-emerald-400" : "text-red-400",
      },
      {
         label: "Overall Returns",
         value: Number(overallReturns),
         format: (v) => `${v.toFixed(2)}%`,
         accent: "border-amber-500/50",
         icon: Percent,
         pulseColor: "bg-amber-500/10",
      },
      {
         label: "Schemes",
         value: totals.count,
         format: (v) => v,
         accent: "border-slate-500/50",
         icon: Briefcase,
         pulseColor: "bg-slate-500/10",
      },
   ];

   return (
      <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      >
         <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="mx-4 w-full max-w-sm rounded-2xl bg-neutral-900 p-5 shadow-xl md:max-w-xl"
         >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
               <h2 className="text-lg font-semibold text-neutral-100">
                  Smart View
               </h2>
               <button
                  onClick={onClose}
                  className="hover:text-light rounded-full p-1 text-neutral-400 transition-colors"
               >
                  <X size={18} />
               </button>
            </div>

            {/* Data Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
               {data.map((item, i) => (
                  <motion.div
                     key={i}
                     whileHover={{ scale: 1.03 }}
                     className={`relative flex flex-col truncate overflow-hidden rounded-lg border bg-neutral-800/50 p-3 text-sm ${item.accent}`}
                  >
                     {/* Pulsing Background */}
                     <motion.div
                        className={`absolute inset-0 rounded-lg ${item.pulseColor || "bg-neutral-700/10"}`}
                        initial={{ opacity: 0.2 }}
                        animate={{ opacity: [0.2, 0.5, 0.2] }}
                        transition={{
                           repeat: Infinity,
                           duration: 3,
                           ease: "easeInOut",
                        }}
                     />

                     {/* Content stays on top */}
                     <div className="relative z-10 flex flex-col">
                        <div className="flex items-center gap-2 text-neutral-400">
                           <item.icon size={14} />
                           <span>{item.label}</span>
                        </div>
                        <p
                           className={`mt-2 text-base font-semibold tracking-wide ${
                              item.textColor || "text-neutral-200"
                           }`}
                        >
                           {item.format(item.value)}
                        </p>
                     </div>
                  </motion.div>
               ))}
            </div>
         </motion.div>
      </motion.div>
   );
};

export default SmartViewWindow;
