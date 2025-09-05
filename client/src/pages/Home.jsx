import React from "react";
import {
   PiggyBank,
   TrendingUp,
   Wallet,
   Percent,
   Briefcase,
} from "lucide-react";
import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";
import { formatNumber } from "./../lib/formatNumber";
import CircularLoader from "./../components/CircularLoader";
import { useFundsContext } from "../context/FundContext";
import { useAuthContext } from "../context/AuthContext";
import Skeleton from "../components/Skeleton";

const Home = () => {
   const { funds = [], loading } = useFundsContext();
   const { user } = useAuthContext();

   // --- Aggregate calculations ---

   let totals;

   if (user?.email === import.meta.env.VITE_USER_EMAIL_FOR_DATA_MANIPULATION) {
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
         ? (
              ((totals.current - totals.invested) / totals.invested) *
              100
           ).toFixed(2)
         : 0;

   const data = [
      {
         label: "Total Invested",
         value: totals.invested,
         format: (v) => `₹ ${formatNumber(v, 2)}`,
         accent: "border-sky-500",
         icon: PiggyBank,
         pulseColor: "bg-sky-500/10",
      },
      {
         label: "Current Value",
         value: totals.current,
         format: (v) => `₹ ${formatNumber(v, 2)}`,
         accent: "border-indigo-500",
         icon: Wallet,
         pulseColor: "bg-indigo-500/10",
      },
      {
         label: "PnL",
         value: totals.pnl,
         format: (v) => `₹ ${formatNumber(v, 2)}`,
         accent:
            totals.pnl >= 0
               ? "border-emerald-500 text-emerald-400"
               : "border-red-500 text-red-400",
         icon: TrendingUp,
         pulseColor: totals.pnl >= 0 ? "bg-emerald-500/10" : "bg-red-500/10",
         textColor: totals.pnl >= 0 ? "text-emerald-400" : "text-red-400",
      },
      {
         label: "Overall Returns",
         value: Number(overallReturns),
         format: (v) => `${v.toFixed(2)}%`,
         accent: "border-amber-500",
         icon: Percent,
         pulseColor: "bg-amber-500/10",
      },
      {
         label: "Schemes",
         value: totals.count,
         format: (v) => v,
         accent: "border-slate-500",
         icon: Briefcase,
         pulseColor: "bg-slate-500/10",
      },
   ];

   // ✅ Variants for staggering
   const container = {
      hidden: { opacity: 0 },
      show: {
         opacity: 1,
         transition: {
            staggerChildren: 0.25, // delay between each card
         },
      },
   };

   const item = {
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
   };

   return (
      <div className="space-y-10">
         {/* Title */}
         <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xl font-semibold text-neutral-100 sm:text-2xl"
         >
            Portfolio Overview
         </motion.h2>

         {/* Portfolio Summary */}
         <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
         >
            {data.map((itemData, index) => (
               <SummaryCard
                  loading={loading}
                  key={index}
                  variants={item}
                  {...itemData}
               />
            ))}
         </motion.div>
      </div>
   );
};

// ✅ Animated number hook
const AnimatedNumber = ({ value, format }) => {
   const motionValue = useMotionValue(0);
   const springValue = useSpring(motionValue, { duration: 1.5 });
   const rounded = useTransform(springValue, (latest) => format(latest));

   React.useEffect(() => {
      motionValue.set(value);
   }, [value]);

   return <motion.span className="tracking-wide">{rounded}</motion.span>;
};

// ✅ Updated SummaryCard with animation support
const SummaryCard = ({
   label,
   value,
   format,
   accent,
   icon: Icon,
   pulseColor,
   textColor,
   variants,
   loading,
}) => {
   return (
      <motion.div
         variants={variants}
         whileHover={{ scale: 1.04 }}
         whileTap={{ scale: 0.98 }}
         className={`relative rounded-xl border bg-neutral-900 ${accent} flex flex-col justify-between overflow-hidden p-5 shadow-md hover:shadow-lg`}
      >
         <motion.div
            initial={{ opacity: 0.2, scale: 1 }}
            animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className={`pointer-events-none absolute inset-0 rounded-xl ${pulseColor}`}
         />

         <div className="relative z-10 flex items-center justify-between">
            <p className="text-sm text-neutral-400">{label}</p>
            <Icon className="h-5 w-5 text-neutral-400" />
         </div>
         <div
            className={`relative z-10 mt-3 truncate text-xl font-bold ${textColor}`}
         >
            {loading ? (
               <Skeleton className="h-7 w-full rounded" />
            ) : (
               <AnimatedNumber value={value} format={format} />
            )}
         </div>
      </motion.div>
   );
};

export default Home;
