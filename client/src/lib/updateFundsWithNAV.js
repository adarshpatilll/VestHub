// import { fetchAllNAVs, editFund } from "../firebase/data";
// import { formatSchemeName } from "./formatSchemeName";
// import { getCalculations } from "./getCalculations";

// /**
//  * Updates NAV, PnL, returns, etc. for a list of funds.
//  *
//  * @param {Array} fundList - Funds to update
//  * @param {Object} options
//  * @param {boolean} [options.saveToFirestore=false] - Whether to persist changes
//  * @param {number} [options.batchSize=30] - Batch size for Firestore writes
//  * @returns {Promise<Array>} - Updated funds
//  */
// export const updateUserAndSharedFundsWithLatestNav = async (
//    fundList,
//    { saveToFirestore = false, batchSize = 30 } = {},
// ) => {
//    if (!fundList.length) return fundList;

//    const navMap = await fetchAllNAVs();

//    const parseDate = (d) => {
//       if (!d) return null;
//       return isNaN(new Date(d))
//          ? new Date(d.replace(/-/g, " ")) // handle "20-Aug-2025"
//          : new Date(d);
//    };

//    const getNavData = (fund) => {
//       const navByName = navMap[fund.schemeName?.toLowerCase()];
//       const navByAmfi = navMap[fund.amfiCode];

//       if (navByName?.latestNav === navByAmfi?.latestNav) {
//          return { ...navByName, isSchemeNameChange: false };
//       }
//       return { ...navByAmfi, isSchemeNameChange: !!navByAmfi };
//    };

//    const fundsToUpdateIds = fundList
//       .filter((fund) => {
//          const navData = getNavData(fund);
//          if (!navData?.navDate) return false;

//          const latestNavDate = parseDate(navData.navDate);
//          const fundNavDate = parseDate(fund.navDate);

//          if (!fund.updatedAt) return true;
//          if (!fundNavDate || !latestNavDate) return false;

//          return fundNavDate < latestNavDate;
//       })
//       .map((fund) => fund.id);

//    const updatedFunds = fundList.map((fund) => {
//       const navData = getNavData(fund);

//       if (!navData?.latestNav) return fund;

//       if (fundsToUpdateIds.includes(fund.id)) {
//          const { pnl, currentAmount, returns } = getCalculations(
//             fund.units,
//             navData.latestNav,
//             fund.investedAmount,
//          );

//          return {
//             ...fund,
//             pnl,
//             currentAmount,
//             returns,
//             nav: navData.latestNav,
//             navDate: navData.navDate,
//             schemeName: navData.isSchemeNameChange
//                ? formatSchemeName(navData.schemeName)
//                : formatSchemeName(fund.schemeName),
//             updatedAt: new Date(),
//          };
//       }
//       return fund;
//    });

//    // Save to Firestore (batching)
//    if (saveToFirestore && fundsToUpdateIds.length) {
//       for (let i = 0; i < fundsToUpdateIds.length; i += batchSize) {
//          const batch = fundsToUpdateIds.slice(i, i + batchSize);

//          await Promise.all(
//             batch.map((fundId) => {
//                const fund = updatedFunds.find((f) => f.id === fundId);
//                return editFund(fundId, fund);
//             }),
//          );
//       }
//    }

//    return updatedFunds;
// };

/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */

import {
   fetchAllNAVs,
   editFund,
   getSendersWhoSharedWithMe,
   getSharedFundsBySenderId,
   editSharedFund,
} from "../firebase/data";
import { formatSchemeName } from "./formatSchemeName";
import { getCalculations } from "./getCalculations";

/**
 * Updates NAV, PnL, returns, etc. for user and shared funds.
 *
 * @param {Array} fundList - User funds
 * @param {Object} options
 * @param {boolean} [options.includeShared=false] - Whether to update shared funds too
 * @param {boolean} [options.saveToFirestore=false] - Whether to persist changes
 * @param {number} [options.batchSize=30] - Batch size for Firestore writes
 * @returns {Promise<{userFunds: Array, sharedFunds: Object}>} - Updated funds
 */
export const updateUserAndSharedFundsWithLatestNav = async (
   fundList,
   { includeShared = false, saveToFirestore = true, batchSize = 30 } = {},
) => {
   if (!fundList.length && !includeShared) {
      return { userFunds: fundList, sharedFunds: {} };
   }

   const navMap = await fetchAllNAVs();

   const parseDate = (d) => {
      if (!d) return null;
      return isNaN(new Date(d))
         ? new Date(d.replace(/-/g, " ")) // handle "20-Aug-2025"
         : new Date(d);
   };

   const getNavData = (fund) => {
      const navByName = navMap[fund.schemeName?.toLowerCase()];
      const navByAmfi = navMap[fund.amfiCode];

      if (navByName?.latestNav === navByAmfi?.latestNav) {
         return { ...navByName, isSchemeNameChange: false };
      }
      return { ...navByAmfi, isSchemeNameChange: !!navByAmfi };
   };

   const updateFunds = (fundList) => {
      const fundsToUpdateIds = fundList
         .filter((fund) => {
            const navData = getNavData(fund);
            if (!navData?.navDate) return false;

            const latestNavDate = parseDate(navData.navDate);
            const fundNavDate = parseDate(fund.navDate);

            if (!fund.updatedAt) return true;
            if (!fundNavDate || !latestNavDate) return false;

            return fundNavDate < latestNavDate;
         })
         .map((fund) => fund.id);

      const updatedFunds = fundList.map((fund) => {
         const navData = getNavData(fund);
         if (!navData?.latestNav) return fund;

         if (fundsToUpdateIds.includes(fund.id)) {
            const { pnl, currentAmount, returns } = getCalculations(
               fund.units,
               navData.latestNav,
               fund.investedAmount,
            );

            return {
               ...fund,
               pnl,
               currentAmount,
               returns,
               nav: navData.latestNav,
               navDate: navData.navDate,
               schemeName: navData.isSchemeNameChange
                  ? formatSchemeName(navData.schemeName)
                  : formatSchemeName(fund.schemeName),
               updatedAt: new Date(),
            };
         }
         return fund;
      });

      return { updatedFunds, fundsToUpdateIds };
   };

   // 1️⃣ Update user funds
   const { updatedFunds: updatedUserFunds, fundsToUpdateIds: userFundIds } =
      updateFunds(fundList);

   // 2️⃣ Update shared funds (grouped by senderId)
   let updatedSharedFunds = {};

   if (includeShared) {
      const senders = await getSendersWhoSharedWithMe();

      for (const sender of senders) {
         const sharedFunds = await getSharedFundsBySenderId(sender.senderId);

         const { updatedFunds, fundsToUpdateIds } = updateFunds(sharedFunds);

         updatedSharedFunds[sender.senderId] = updatedFunds;

         // Save shared funds to Firestore if required
         if (saveToFirestore && fundsToUpdateIds.length) {
            for (let i = 0; i < fundsToUpdateIds.length; i += batchSize) {
               const batch = fundsToUpdateIds.slice(i, i + batchSize);

               await Promise.all(
                  batch.map((fundId) => {
                     const fund = updatedFunds.find((f) => f.id === fundId);
                     return editSharedFund(sender.senderId, fundId, fund);
                  }),
               );
            }
         }
      }
   }

   // 3️⃣ Save user funds to Firestore if required
   if (saveToFirestore && userFundIds.length) {
      for (let i = 0; i < userFundIds.length; i += batchSize) {
         const batch = userFundIds.slice(i, i + batchSize);
         await Promise.all(
            batch.map((fundId) => {
               const fund = updatedUserFunds.find((f) => f.id === fundId);
               return editFund(fundId, fund);
            }),
         );
      }
   }

   return { userFunds: updatedUserFunds, sharedFunds: updatedSharedFunds };
};
