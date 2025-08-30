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
} from "../firebase/data";
import { serverTimestamp } from "firebase/firestore";
import { useAuthContext } from "./AuthContext";
import {
   updateUserFundsWithLatestNav,
   updateSharedFundsWithLatestNav,
} from "../lib/updateFundsWithNAV";
import { fetchAllDataFromApi } from "./../firebase/data";

const FundsContext = createContext();

export const FundsProvider = ({ children }) => {
   const [funds, setFunds] = useState([]);
   const [sharedFunds, setSharedFunds] = useState({});

   const [schemesData, setSchemesData] = useState([]);
   const [categories, setCategories] = useState([]);

   const [fundsLoading, setFundsLoading] = useState(true);
   const [schemesDataLoading, setSchemesDataLoading] = useState(true);
   const [categoriesLoading, setCategoriesLoading] = useState(true);
   const [loading, setLoading] = useState(true);

   const [error, setError] = useState(null);

   const { user } = useAuthContext();

   const [isFetchSharedFunds, setIsFetchSharedFunds] = useState(false);

   const fetchFunds = async () => {
      setFundsLoading(true);
      try {
         const data = await getFunds();

         const userFunds = await updateUserFundsWithLatestNav(data, {
            saveToFirestore: true,
         });

         setFunds(userFunds);
      } catch (err) {
         setError(err.message);
      } finally {
         setFundsLoading(false);
      }
   };

   const fetchSchemeData = async () => {
      setSchemesDataLoading(true);
      try {
         const data = await fetchAllDataFromApi();
         setSchemesData(data);
      } catch (err) {
         setError(err.message);
      } finally {
         setSchemesDataLoading(false);
      }
   };

   const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
         // Fetch categories from Firestore
         const data = await getCategory();
         setCategories(data);
      } catch (err) {
         setError(err.message);
      } finally {
         setCategoriesLoading(false);
      }
   };

   const fetchSharedFunds = async () => {
      setLoading(true);
      try {
         const data = await updateSharedFundsWithLatestNav({
            saveToFirestore: true,
         });
         setSharedFunds(data);
      } catch (err) {
         setError(err.message);
      } finally {
         setLoading(false);
      }
   };

   // --- Add fund ---
   const add = useCallback(async (fundData) => {
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
         const enrichedFund = (
            await updateUserFundsWithLatestNav([newFund])
         )[0];

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
   }, []);

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

      const enriched = await updateUserFundsWithLatestNav(funds, {
         saveToFirestore: true,
      });

      setFunds(enriched);
   }, [funds]);

   // Fetch Self funds and categories and schemes also on user login
   useEffect(() => {
      if (user) {
         fetchFunds();
         fetchCategories();
         fetchSchemeData();
      }
   }, [user]);

   // Fetch shared funds when isFetchSharedFunds is true
   useEffect(() => {
      if (isFetchSharedFunds) {
         fetchSharedFunds();
      }
   }, [isFetchSharedFunds]);

   // --- Set global loading ---
   useEffect(() => {
      setLoading(fundsLoading || categoriesLoading || schemesDataLoading);
   }, [fundsLoading, categoriesLoading, schemesDataLoading]);

   return (
      <FundsContext.Provider
         value={{
            funds,
            sharedFunds,
            schemesData,
            categories,
            loading,
            schemesDataLoading,
            error,
            add,
            edit,
            remove,
            refreshNav,
            setIsFetchSharedFunds,
         }}
      >
         {children}
      </FundsContext.Provider>
   );
};

export const useFundsContext = () => useContext(FundsContext);
