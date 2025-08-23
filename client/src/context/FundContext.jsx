// context/FundContext.jsx
import {
   createContext,
   useContext,
   useState,
   useEffect,
   useCallback,
} from "react";
import {
   getFunds,
   getCategory,
   addFund,
   editFund,
   deleteFund,
   fetchAllNAVs,
} from "../firebase/data";
import { serverTimestamp } from "firebase/firestore";
import { useAuthContext } from "./AuthContext";

const FundsContext = createContext();

export const FundsProvider = ({ children }) => {
   const [funds, setFunds] = useState([]);
   const [categories, setCategories] = useState([]);

   const [fundsLoading, setFundsLoading] = useState(true);
   const [sharedFundsLoading, setSharedFundsLoading] = useState(true);
   const [categoriesLoading, setCategoriesLoading] = useState(true);
   const [loading, setLoading] = useState(true);

   const [error, setError] = useState(null);

   const { user } = useAuthContext();

   // --- Update NAVs for all funds ---
   const updateUserFundsWithNAV = useCallback(
      async (fundList, saveToFirestore = false, batchSize = 30) => {
         if (!fundList.length) return fundList;

         try {
            const navMap = await fetchAllNAVs();

            const fundsToUpdate = fundList.filter((fund) => {
               if (!fund.updatedAt) return true;

               const latestNavDate =
                  navMap[fund.schemeName.toLowerCase()]?.navDate;
               if (latestNavDate && fund.navDate) {
                  return fund.navDate < latestNavDate;
               }
               return false;
            });

            const updatedFunds = fundList.map((fund) => {
               const navData = navMap[fund.schemeName.toLowerCase()];
               if (!navData) return fund;

               if (fundsToUpdate.includes(fund)) {
                  return {
                     ...fund,
                     nav: navData.latestNav,
                     navDate: navData.navDate,
                     updatedAt: new Date(),
                  };
               }
               return fund;
            });

            if (saveToFirestore && fundsToUpdate.length) {
               for (let i = 0; i < fundsToUpdate.length; i += batchSize) {
                  const batch = fundsToUpdate.slice(i, i + batchSize);
                  await Promise.all(
                     batch.map((fund) => {
                        const navData = navMap[fund.schemeName.toLowerCase()];
                        if (!navData) return fund;
                        return editFund(fund.id, {
                           ...fund,
                           nav: navData.latestNav,
                           navDate: navData.navDate,
                           updatedAt: new Date(),
                        });
                     }),
                  );
               }
            }

            return updatedFunds;
         } catch (err) {
            setError(err.message);
            return fundList;
         }
      },
      [],
   );

   const fetchFunds = async () => {
      setFundsLoading(true);
      try {
         const data = await getFunds();
         const enrichedFunds = await updateUserFundsWithNAV(data, true);
         setFunds(enrichedFunds);
      } catch (err) {
         setError(err.message);
      } finally {
         setFundsLoading(false);
      }
   };
   const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
         const data = await getCategory();
         setCategories(data);
      } catch (err) {
         setError(err.message);
      } finally {
         setCategoriesLoading(false);
      }
   };

   // --- Add fund ---
   const add = useCallback(
      async (fundData) => {
         setFundsLoading(true);
         try {
            // Normalize category: lowercase + trim to avoid duplicates like "Equity" vs "equity "
            const normalizeCategory = fundData.category
               ? fundData.category.trim().toLowerCase()
               : "";

            // Save new fund in Firestore
            const newFund = await addFund({
               ...fundData,
               category: normalizeCategory,
               createdAt: serverTimestamp(),
            });

            // Enrich fund with latest NAV details
            const enrichedFund = (await updateUserFundsWithNAV([newFund]))[0];

            // Add the new fund to state
            setFunds((prev) => [...prev, enrichedFund]);

            // --- Update categories state ---
            if (normalizeCategory) {
               setCategories((prev) => {
                  // Check if category already exists
                  const existing = prev.find(
                     (c) => c.name.toLowerCase() === normalizeCategory,
                  );

                  if (existing) {
                     // If category exists → increment its count
                     return prev.map((c) =>
                        c.name.toLowerCase() === normalizeCategory
                           ? { ...c, count: (c.count ?? 0) + 1 }
                           : c,
                     );
                  } else {
                     // If category does not exist → create new with count = 1
                     return [...prev, { name: normalizeCategory, count: 1 }];
                  }
               });
            }
         } catch (err) {
            // Store error in context state
            setError(err.message);
            throw err;
         } finally {
            // Stop loading regardless of success or failure
            setFundsLoading(false);
         }
      },
      [updateUserFundsWithNAV],
   );

   // --- Edit fund ---
   const edit = useCallback(
      async (fundId, updatedData) => {
         setFundsLoading(true);
         try {
            const oldFund = funds.find((f) => f.id === fundId);

            await editFund(fundId, {
               ...updatedData,
               updatedAt: serverTimestamp(),
            });

            // set funds
            setFunds((prev) =>
               prev.map((f) =>
                  f.id === fundId
                     ? { ...f, ...updatedData, updatedAt: new Date() }
                     : f,
               ),
            );

            // set categories if category changed
            if (oldFund?.category !== updatedData?.category) {
               setCategories((prev) => {
                  const oldCat = oldFund?.category?.toLowerCase();
                  const newCat = updatedData.category?.toLowerCase();

                  let updated = prev.map((c) => {
                     if (c.name.toLowerCase() === oldCat)
                        return { ...c, count: c.count - 1 };
                     if (c.name.toLowerCase() === newCat)
                        return { ...c, count: c.count + 1 };
                     return c;
                  });

                  // If new category did not exist before, add it
                  if (!updated.find((c) => c.name.toLowerCase() === newCat)) {
                     updated.push({ name: updatedData.category, count: 1 });
                  }

                  // Remove category if its count drops to 0
                  updated = updated.filter((c) => c.count > 0);

                  return updated;
               });
            }
         } catch (err) {
            setError(err.message);
            throw err;
         } finally {
            setFundsLoading(false);
         }
      },
      [funds],
   );

   // --- Delete fund ---
   const remove = useCallback(
      async (fundId) => {
         setFundsLoading(true);
         try {
            const fundIdCategory = funds.find((f) => f.id === fundId)?.category;

            await deleteFund(fundId);
            setFunds((prev) => prev.filter((f) => f.id !== fundId));

            setCategories((prev) =>
               prev
                  .map((c) => {
                     if (
                        c.name.toLowerCase() === fundIdCategory.toLowerCase()
                     ) {
                        return { ...c, count: c.count - 1 };
                     }
                     return c;
                  })
                  .filter((c) => c.count > 0),
            );
         } catch (err) {
            setError(err.message);
            throw err;
         } finally {
            setFundsLoading(false);
         }
      },
      [funds],
   );

   // --- Refresh NAV for all funds anytime ---
   const refreshNav = useCallback(async () => {
      if (!funds.length) return;
      // Update only funds that need refreshing (older than 1 day) and save to Firestore
      const enriched = await updateUserFundsWithNAV(funds, true); // true = saveToFirestore

      setFunds(enriched);
   }, [funds, updateUserFundsWithNAV]);

   // Fetch Self and Shared Funds and categories on user login
   useEffect(() => {
      if (user) {
         fetchFunds();
         fetchCategories();
      }
   }, [user]);

   // --- Set global loading ---
   useEffect(() => {
      setLoading(fundsLoading || categoriesLoading);
   }, [fundsLoading, categoriesLoading]);

   return (
      <FundsContext.Provider
         value={{
            funds,
            categories,
            loading,
            error,
            add,
            edit,
            remove,
            refreshNav,
         }}
      >
         {children}
      </FundsContext.Provider>
   );
};

export const useFundsContext = () => useContext(FundsContext);
