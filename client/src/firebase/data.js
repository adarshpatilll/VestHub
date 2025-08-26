import {
   doc,
   setDoc,
   collection,
   addDoc,
   getDocs,
   getDoc,
   updateDoc,
   deleteDoc,
   query,
   where,
   increment,
   writeBatch,
   serverTimestamp,
   arrayUnion,
   limit,
   arrayRemove,
} from "firebase/firestore";
import { auth, db } from "./firebase.config";
import {
   createUserWithEmailAndPassword,
   GoogleAuthProvider,
   sendPasswordResetEmail,
   signInWithEmailAndPassword,
   signInWithPopup,
   signOut,
} from "firebase/auth";

// Authentication

const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
   try {
      // Sign in with Google
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user exists in Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
         // Save user data if new
         await setDoc(userRef, {
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            provider: "google",
            createdAt: new Date(),
         });
      }
      return user;
   } catch (error) {
      throw error;
   }
};

export const registerUser = async (email, password, name) => {
   if (!email) throw new Error("No email provided");
   if (!password) throw new Error("No password provided");
   if (!name) throw new Error("No name provided");

   try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
         auth,
         email,
         password,
      );
      const user = userCredential.user;

      // Store additional details in Firestore
      await setDoc(doc(db, "users", user.uid), {
         uid: user.uid,
         name: name,
         email: user.email,
         createdAt: new Date(),
         photoURL: null,
         provider: "emailAndPassword",
         canShare: false,
      });
      return user;
   } catch (error) {
      throw error;
   }
};

export const loginUser = async (email, password) => {
   if (!email) throw new Error("No email provided");
   if (!password) throw new Error("No password provided");

   try {
      const userCredential = await signInWithEmailAndPassword(
         auth,
         email,
         password,
      );
      return userCredential.user;
   } catch (error) {
      throw error;
   }
};

export const logoutUser = async () => {
   try {
      await signOut(auth);
   } catch (error) {
      throw error;
   }
};

export const resetPassword = async (email) => {
   try {
      await sendPasswordResetEmail(auth, email);
      console.log("Password reset email sent to:", email);
      return true;
   } catch (error) {
      console.error("Error sending password reset email:", error);
      throw error;
   }
};

// Firestore

// ----------User----------

export const getUserDetails = async (uid) => {
   if (!uid) {
      const user = auth.currentUser;
      if (!user) return null;
      uid = user.uid;
   }

   try {
      const docRef = await getDoc(doc(db, "users", uid));

      if (!docRef.exists()) {
         return null;
      }

      return docRef.data();
   } catch (error) {
      throw error;
   }
};

// --- Update user share permission ---
export const updateUserSharePermission = async (canShare) => {
   const user = auth.currentUser;
   if (!user) return new Error("No user is logged in");
   const uid = user.uid;

   try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, { canShare: canShare });
   } catch (error) {
      throw error;
   }
};

// ------------------- Shared Funds -------------------

// Fetch all users (for SearchSelect options)
export const getAllUsers = async () => {
   try {
      const usersRef = collection(db, "users");
      const snap = await getDocs(usersRef);

      return snap.docs.map((d) => ({
         uid: d.id,
         ...d.data(),
      }));
   } catch (err) {
      throw err;
   }
};

// Share all funds with another user
export const shareAllFunds = async (recipientId) => {
   const user = auth.currentUser;
   if (!user) throw new Error("No user is logged in");

   if (!recipientId) throw new Error("No recipient id provided");

   try {
      // Get current user details
      const userDetails = await getUserDetails(user.uid);

      // Get all funds of the current user
      const fundsRef = collection(db, "users", user.uid, "funds");
      const fundsSnap = await getDocs(fundsRef);

      if (fundsSnap.empty) throw new Error("No funds to share");

      // Check if recipient allows sharing
      const recipientRef = doc(db, "users", recipientId);
      const recipientSnap = await getDoc(recipientRef);

      if (!recipientSnap.exists() || !recipientSnap.data().canShare) {
         throw new Error("Recipient does not allow sharing");
      }

      const funds = fundsSnap.docs.map((d) => ({
         id: d.id,
         ...d.data(),
      }));

      // Check already shared funds
      const alreadySharedRef = collection(
         db,
         "users",
         recipientId,
         "sharedFunds",
         user.uid,
         "funds",
      );
      const alreadySharedSnap = await getDocs(alreadySharedRef);
      const alreadyShared = alreadySharedSnap.docs.map((d) => ({
         id: d.id,
         ...d.data(),
      }));

      const fundsToShare = funds.filter((fund) => {
         return !alreadyShared.some((shared) => shared.id === fund.id);
      });

      if (fundsToShare.length === 0) {
         return 0;
      }

      // 🔥 Ensure parent doc exists: /sharedFunds/{senderUid}
      const senderDocRef = doc(
         db,
         "users",
         recipientId,
         "sharedFunds",
         user.uid,
      );
      await setDoc(
         senderDocRef,
         {
            createdAt: serverTimestamp(),
            senderUid: userDetails.uid,
            senderName: userDetails.name,
            senderEmail: userDetails.email,
         },
         { merge: true },
      );

      // Process in chunks of 30
      for (let i = 0; i < fundsToShare.length; i += 30) {
         const chunk = fundsToShare.slice(i, i + 30);
         const batch = writeBatch(db);

         chunk.forEach((fundData) => {
            const fundDocRef = doc(
               db,
               "users",
               recipientId,
               "sharedFunds",
               user.uid,
               "funds",
               fundData.id,
            );

            batch.set(fundDocRef, {
               ...fundData,
               sharedBy: { uid: user.uid, email: user.email },
               sharedAt: serverTimestamp(),
            });
         });

         await batch.commit();
      }

      // Add recipient id to sender profile
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
         sharedWith: arrayUnion(recipientId),
      });

      return fundsToShare.length;
   } catch (error) {
      throw error;
   }
};

// Get all senders who shared with the current user
export const getSendersWhoSharedWithMe = async () => {
   const user = auth.currentUser;
   if (!user) throw new Error("No user is logged in");

   try {
      // Path: /users/{currentUser}/sharedFunds
      const sharedFundsRef = collection(db, "users", user.uid, "sharedFunds");
      const snap = await getDocs(sharedFundsRef);

      if (snap.empty) return [];

      // Each docId = senderId who shared with me
      const recipients = snap.docs.map((doc) => ({
         senderId: doc.id,
         ...doc.data(), // optional metadata (e.g. name/email if you stored it)
      }));

      return recipients;
   } catch (err) {
      throw err;
   }
};

// Get recipients with whom the logged-in user has shared funds
export const getRecipientsSharedByMe = async () => {
   const user = auth.currentUser;
   if (!user) throw new Error("No user is logged in");

   try {
      const userSnap = await getDoc(doc(db, "users", user.uid));
      const sharedWith = userSnap.data()?.sharedWith || [];

      const recipients = await Promise.all(
         sharedWith.map(async (recipientId) => {
            const recipientRef = doc(db, "users", recipientId);
            const recipientSnap = await getDoc(recipientRef);
            return { id: recipientId, ...recipientSnap.data() };
         }),
      );
      return recipients;
   } catch (err) {
      throw err;
   }
};

// Get all funds by sender Id
export const getSharedFundsBySenderId = async (senderId) => {
   const user = auth.currentUser;
   if (!user) throw new Error("No user is logged in");

   if (!senderId) throw new Error("No senderId provided");

   try {
      const fundsRef = collection(
         db,
         "users",
         user.uid,
         "sharedFunds",
         senderId,
         "funds",
      );
      const snap = await getDocs(fundsRef);

      if (snap.empty) return [];

      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
   } catch (err) {
      throw err;
   }
};

// Update shared funds
export const updateSharedFunds = async (recipientId) => {
   const user = auth.currentUser;
   if (!user) throw new Error("No user is logged in");

   if (!recipientId) throw new Error("No recipient id provided");

   try {
      // Calculate the total number of funds to update base on current user's funds updatedAt and sharedAt timestamps
      const fundsToUpdate = [];

      const currentUserFundsRef = collection(db, "users", user.uid, "funds");
      const currentUserSnap = await getDocs(currentUserFundsRef);

      const sharedFundsRef = collection(
         db,
         "users",
         recipientId,
         "sharedFunds",
         user.uid,
         "funds",
      );
      const sharedFundsSnap = await getDocs(sharedFundsRef);

      const currentUserFundsMap = {};
      const sharedFundsMap = {};

      currentUserSnap.docs.forEach((doc) => {
         currentUserFundsMap[doc.id] = doc.data();
      });

      sharedFundsSnap.docs.forEach((doc) => {
         sharedFundsMap[doc.id] = doc.data();
      });

      for (const [id, data] of Object.entries(currentUserFundsMap)) {
         const sharedData = sharedFundsMap[id];

         if (sharedData) {
            // Compare timestamps and decide if update is needed
            if (data.updatedAt > sharedData.sharedAt) {
               fundsToUpdate.push({ id, ...data });
            }
         }
      }

      // Update the shared funds for the recipient and update sharedAt timestamp
      const batch = writeBatch(db);

      fundsToUpdate.forEach((fund) => {
         const fundRef = doc(
            db,
            "users",
            recipientId,
            "sharedFunds",
            user.uid,
            "funds",
            fund.id,
         );
         batch.set(fundRef, { ...fund, sharedAt: serverTimestamp() });
      });
      await batch.commit();

      return fundsToUpdate.length;
   } catch (err) {
      throw err;
   }
};

// Unshare shared funds
export const unshareFunds = async (recipientId) => {
   const user = auth.currentUser;
   if (!user) throw new Error("No user is logged in");

   if (!recipientId) throw new Error("No recipient id provided");

   try {
      const sharedCollectionRef = collection(
         db,
         "users",
         recipientId,
         "sharedFunds",
         user.uid,
         "funds",
      );

      let deleteCount = 0;
      let hasMore = true;

      // Delete all docs under /funds in chunks of 30
      while (hasMore) {
         const q = query(sharedCollectionRef, limit(30));
         const snap = await getDocs(q);

         if (snap.empty) {
            hasMore = false;
            break;
         }

         const batch = writeBatch(db);

         snap.docs.forEach((doc) => {
            batch.delete(doc.ref);
            deleteCount++;
         });

         await batch.commit();

         if (snap.size < 30) {
            hasMore = false;
         }
      }

      // ✅ Remove parent sender doc if empty
      const senderDocRef = doc(
         db,
         "users",
         recipientId,
         "sharedFunds",
         user.uid,
      );
      const fundsLeftSnap = await getDocs(collection(senderDocRef, "funds"));

      if (fundsLeftSnap.empty) {
         await deleteDoc(senderDocRef);
      }

      // ✅ Also remove recipientId from sender's sharedWith array
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
         sharedWith: arrayRemove(recipientId),
      });

      return deleteCount;
   } catch (err) {
      throw err;
   }
};

// ------------------- Funds -------------------

// Get all funds for logged in user
export const getFunds = async () => {
   const user = auth.currentUser;
   if (!user) throw new Error("No user is logged in");

   try {
      const fundsRef = collection(db, "users", user.uid, "funds");
      const fundsSnap = await getDocs(fundsRef);

      return fundsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
   } catch (error) {
      console.error("Error fetching funds:", error);
      throw error;
   }
};

// Get all categories for logged in user
export const getCategory = async () => {
   const user = auth.currentUser;
   if (!user) throw new Error("No user is logged in");

   try {
      const categoryRef = collection(db, "users", user.uid, "categories");
      const categorySnap = await getDocs(categoryRef);

      return categorySnap.docs.map((d) => ({ id: d.id, ...d.data() }));
   } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
   }
};

// Fetch All NAV list from your API
export const fetchAllNAVs = async () => {
   try {
      const res = await fetch("https://my-nav-rose.vercel.app/api/getList");
      const json = await res.json();

      if (!json?.data || !Array.isArray(json.data)) {
         throw new Error("Invalid NAV data format");
      }

      // Normalize data to a map for quick lookup
      const navMap = {};

      json.data.forEach((item) => {
         // Add by scheme name (lowercase)
         navMap[item.schemeName.toLowerCase()] = {
            latestNav: item.latestNav,
            navDate: item.navDate,
         };

         // Add by AMFI code if available
         if (item.amfiCode) {
            navMap[item.amfiCode] = {
               latestNav: item.latestNav,
               navDate: item.navDate,
               schemeName: item.schemeName,
            };
         }
      });

      return navMap; // { "xyz fund": { latestNav: 123, navDate: "12 12 1234" }, "12345": { latestNav: 123, navDate: "12 12 1234" }, ... }
   } catch (err) {
      console.error("Error fetching NAVs:", err);
      return {};
   }
};

// Add new fund
export const addFund = async (fundData) => {
   const user = auth.currentUser;
   if (!user) throw new Error("No user is logged in");

   if (!fundData) throw new Error("No fund data provided");

   try {
      const userRef = doc(db, "users", user.uid);

      // for add fund
      const fundsRef = collection(userRef, "funds");
      const fundDocRef = await addDoc(fundsRef, {
         ...fundData,
         createdAt: new Date(),
      });

      // for add category
      const categoryRef = collection(userRef, "categories");
      const q = query(categoryRef, where("name", "==", fundData.category));
      const snap = await getDocs(q);

      if (snap.empty) {
         // if category doesn't exist, create it
         await addDoc(categoryRef, {
            name: fundData.category,
            count: 1,
            createdAt: new Date(),
         });
      } else {
         // if category exists, increment the count
         const categoryDocRef = snap.docs[0].ref;
         await updateDoc(categoryDocRef, {
            count: increment(1),
         });
      }

      return {
         id: fundDocRef.id,
         ...fundData,
      };
   } catch (error) {
      throw error;
   }
};

// Edit fund
export const editFund = async (fundId, updatedData) => {
   const user = auth.currentUser;
   if (!user) throw new Error("No user is logged in");

   if (!fundId) throw new Error("No fund id provided");
   if (!updatedData) throw new Error("No updated data provided");

   try {
      const fundRef = doc(db, "users", user.uid, "funds", fundId);

      // Get current fund before update (to know old category)
      const oldSnap = await getDoc(fundRef);

      if (!oldSnap.exists()) throw new Error("Fund not found");

      const oldData = oldSnap.data();

      // --- Update fund itself ---
      await updateDoc(fundRef, {
         ...updatedData,
         updatedAt: serverTimestamp(),
      });

      // --- If category changed, adjust category counts ---
      if (updatedData.category && updatedData.category !== oldData.category) {
         const oldCatQuery = query(
            collection(db, "users", user.uid, "categories"),
            where("name", "==", oldData.category),
         );
         const oldCatSnap = await getDocs(oldCatQuery);

         if (!oldCatSnap.empty) {
            const oldCatDocRef = oldCatSnap.docs[0].ref;
            const currentCount = oldCatSnap.docs[0].data().count || 1;

            if (currentCount > 1) {
               // Decrement count for old category
               await updateDoc(oldCatDocRef, {
                  count: increment(-1),
                  updatedAt: serverTimestamp(),
               });
            } else {
               // If no more funds in old category, delete it
               await deleteDoc(oldCatDocRef);
            }
         }

         const catRef = collection(db, "users", user.uid, "categories");
         const q = query(catRef, where("name", "==", updatedData.category));
         const newCatSnap = await getDocs(q);

         if (newCatSnap.empty) {
            // If new category doesn't exist, create it
            await addDoc(catRef, {
               name: updatedData.category,
               count: 1,
               createdAt: new Date(),
            });
         } else {
            // If category exists, increment the count
            await updateDoc(newCatSnap.docs[0].ref, {
               count: increment(1),
               updatedAt: serverTimestamp(),
            });
         }
      }

      // Return updated data
      return { id: fundId, ...updatedData };
   } catch (error) {
      throw error;
   }
};

// Delete fund
export const deleteFund = async (fundId) => {
   const user = auth.currentUser;
   if (!user) throw new Error("No user is logged in");

   if (!fundId) throw new Error("No fund id provided");

   try {
      const userRef = doc(db, "users", user.uid);
      const fundRef = doc(userRef, "funds", fundId);

      // Get the fund to find its category
      const fundSnap = await getDoc(fundRef);
      if (!fundSnap.exists()) throw new Error("Fund not found");

      const fundData = fundSnap.data();
      const categoryName = fundData.category;

      // Delete the fund
      await deleteDoc(fundRef);

      // Update the category count
      const categoryRef = collection(userRef, "categories");
      const q = query(categoryRef, where("name", "==", categoryName));
      const catSnap = await getDocs(q);

      if (!catSnap.empty) {
         const catDocRef = catSnap.docs[0].ref;
         const currentCount = catSnap.docs[0].data().count || 1;

         if (currentCount > 1) {
            // Decrement count
            await updateDoc(catDocRef, { count: increment(-1) });
         } else {
            // Optional: delete category if no funds left
            await deleteDoc(catDocRef);
         }
      }
   } catch (error) {
      throw error;
   }
};
