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
 * Updates NAV, PnL, returns, etc. for user funds.
 *
 * @param {Array} fundList - User funds
 * @param {Object} options
 * @param {boolean} [options.saveToFirestore=true] - Whether to persist changes
 * @param {number} [options.batchSize=30] - Batch size for Firestore writes
 * @returns {Promise<{userFunds: Array}>} - Updated funds
 */
export const updateUserFundsWithLatestNav = async (
   fundList,
   { saveToFirestore = true, batchSize = 30 } = {},
) => {
   if (!fundList.length) {
      return fundList;
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

   // Update user funds
   const { updatedFunds, fundsToUpdateIds } = updateFunds(fundList);

   // Save user funds to Firestore if required
   if (saveToFirestore && fundsToUpdateIds.length) {
      for (let i = 0; i < fundsToUpdateIds.length; i += batchSize) {
         const batch = fundsToUpdateIds.slice(i, i + batchSize);
         await Promise.all(
            batch.map((fundId) => {
               const fund = updatedFunds.find((f) => f.id === fundId);
               return editFund(fundId, fund);
            }),
         );
      }
   }

   return updatedFunds;
};

/**
 * Updates NAV, PnL, returns, etc. for shared funds.
 *
 * @param {Object} options
 * @param {boolean} [options.saveToFirestore=true] - Whether to persist changes
 * @param {number} [options.batchSize=30] - Batch size for Firestore writes
 * @returns {Promise<{sharedFunds: Object}>} - Updated funds
 */
export const updateSharedFundsWithLatestNav = async ({
   saveToFirestore = true,
   batchSize = 30,
}) => {
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

   let updatedSharedFunds = {};

   const senders = await getSendersWhoSharedWithMe();

   if (senders.length === 0) {
      return updatedSharedFunds;
   }

   for (const sender of senders) {
      const sharedFunds = await getSharedFundsBySenderId(sender.senderId);

      if (!sharedFunds || sharedFunds.length === 0) {
         continue;
      }

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

   return updatedSharedFunds;
};
