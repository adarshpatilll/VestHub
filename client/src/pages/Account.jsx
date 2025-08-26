import { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import {
   getAllUsers,
   getRecipientsSharedByMe,
   getUserDetails,
   shareAllFunds,
   unshareFunds,
   updateSharedFunds,
   updateUserSharePermission,
} from "../firebase/data"; // fetch all users
import { Loader2, User, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import Divider from "../components/Divider";
import Switch from "../components/Switch";
import { AnimatePresence, motion } from "framer-motion";
import SearchSelect from "../components/SearchSelect";
import ShareModal from "./../components/ShareModal";
import { toast } from "sonner";
import { useEditMode } from "../context/EditModeContext";
import UnshareModal from "../components/UnshareModal";
import CircularLoader from "../components/CircularLoader";

const Account = () => {
   const { user, loading: authLoading } = useAuthContext();
   const [profile, setProfile] = useState(null);
   const [loading, setLoading] = useState(true);
   const [users, setUsers] = useState([]);
   const [selectedUser, setSelectedUser] = useState(null);
   const [imageError, setImageError] = useState(false);

   const [shareModalOpen, setShareModalOpen] = useState(false);
   const [unshareModalOpen, setUnshareModalOpen] = useState(false);

   const { isEditMode, toggleEditMode } = useEditMode();
   const [canShare, setCanShare] = useState(null);

   const [sharedRecipients, setSharedRecipients] = useState([]);
   const [unshareRecipient, setUnshareRecipient] = useState(null);
   const [loadingRecipients, setLoadingRecipients] = useState(true);
   const [showAllRecipients, setShowAllRecipients] = useState(false);

   // Fetch user profile and all users on mount for sharing
   useEffect(() => {
      const fetchProfile = async () => {
         if (user) {
            try {
               // Fetch current user details
               const details = await getUserDetails(user.uid);
               setProfile(details);
               setCanShare(details?.canShare || false);

               // Fetch all users except current user for sharing options
               const allUsers = await getAllUsers();

               const options = allUsers
                  .filter((u) => u.uid !== user.uid && u.canShare) // Exclude self and users who can't share
                  .map((u) => ({
                     value: u.uid,
                     label: u.name || u.email,
                  }));
               setUsers(options);
            } catch (err) {
               console.error("Error fetching user details:", err);
            } finally {
               setLoading(false);
            }
         } else {
            setLoading(false);
         }
      };

      fetchProfile();
   }, [user]);

   useEffect(() => {
      const fetchSharedRecipients = async () => {
         if (!user) return;
         try {
            setLoadingRecipients(true);
            const recipients = await getRecipientsSharedByMe();
            setSharedRecipients(recipients);
         } catch (err) {
            console.error("Error fetching shared recipients:", err);
         } finally {
            setLoadingRecipients(false);
         }
      };

      fetchSharedRecipients();
   }, [user]);

   // --- Update handler ---
   const handleUpdateSharedFunds = async (recipientId) => {
      try {
         toast.promise(updateSharedFunds(recipientId), {
            loading: "Updating shared funds...",
            success: (updatedCount) => {
               if (updatedCount > 0) {
                  return `Updated ${updatedCount} shared funds successfully!`;
               } else {
                  return "No funds needed updating.";
               }
            },
            error: "Failed to update shared funds.",
         });
      } catch (err) {
         console.error(err);
         toast.error("Failed to update shared funds.");
      }
   };

   // --- Unshare handler ---
   const handleUnshareFunds = async (recipientId) => {
      try {
         toast.promise(unshareFunds(recipientId), {
            loading: "Unsharing funds...",
            success: (deleteCount) => {
               return `Unshared ${deleteCount} funds successfully!`;
            },
            error: "Failed to unshare funds.",
         });
         // remove from local state
         setSharedRecipients((prev) =>
            prev.filter((r) => r.uid !== recipientId),
         );
      } catch (err) {
         console.error(err);
         toast.error("Failed to unshare funds.");
      } finally {
         setUnshareModalOpen(false);
      }
   };

   if (authLoading || loading) {
      return <CircularLoader label="Loading Account..." />;
   }

   if (!user) {
      return (
         <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-dark fixed top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1"
         >
            <p className="mb-4">You are not logged in.</p>
            <Link
               to="/login"
               className="text-light rounded-lg bg-yellow-600 px-4 py-2 transition hover:bg-yellow-500"
            >
               Go to Login
            </Link>
         </motion.div>
      );
   }

   const name = profile?.name || "Anonymous";
   const email = profile?.email || user.email || "No email set";
   const photoURL = !imageError ? user?.photoURL || profile?.photoURL : null;

   const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

   // --- Share funds action ---
   const handleShareFunds = async () => {
      if (!selectedUser.value) return;

      try {
         toast.promise(shareAllFunds(selectedUser.value), {
            loading: "Sharing funds...",
            success: (numberOfFundsShared) => {
               if (numberOfFundsShared === 0) {
                  return "No new funds to share.";
               } else {
                  setSharedRecipients((prev) => [
                     ...prev,
                     { uid: selectedUser.value, name: selectedUser.label },
                  ]);
                  // Remove selected user from dropdown options
                  setSelectedUser(null);
                  return `Funds shared successfully! ${numberOfFundsShared} funds shared.`;
               }
            },
            error: (error) => {
               if (error.message === "Recipient does not allow sharing") {
                  return "Recipient does not allow sharing.";
               } else if (error.message === "No funds to share") {
                  return "No funds to share.";
               }
            },
         });
      } catch (error) {
         toast.error("Failed to share funds.");
      } finally {
         setShareModalOpen(false);
      }
   };

   // --- Toggle share permission ---
   const handleShareSwitch = async (newValue) => {
      try {
         setCanShare(newValue);
         await updateUserSharePermission(newValue); // Firestore call
      } catch (err) {
         setCanShare((prev) => !prev); // Revert on error
         toast.error("Failed to update share permission.");
      }
   };

   return (
      <>
         <div className="bg-dark flex min-h-[calc(100vh-152px)] justify-center py-4 md:min-h-[calc(100vh-88px)]">
            <motion.div
               initial={{ opacity: 0, y: 40 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, ease: "easeOut" }}
               className="bg-dark relative flex w-full flex-col justify-between rounded-2xl border border-neutral-700 px-6 py-8 shadow-xl md:max-w-4xl md:px-8"
            >
               {/* Profile Section */}
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex flex-col items-center gap-3 md:flex-row md:justify-between md:gap-5"
               >
                  {/* Profile Image */}
                  {photoURL ? (
                     <motion.img
                        src={photoURL}
                        alt="Profile"
                        onError={() => setImageError(true)}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        whileHover={{ scale: 1.05 }}
                        className="h-16 w-16 rounded-full border-2 border-yellow-500 object-cover shadow-md md:h-20 md:w-20"
                     />
                  ) : (
                     <motion.div
                        // initial={{ scale: 0.8, opacity: 0 }}
                        // animate={{ scale: 1, opacity: 1 }}
                        // transition={{ duration: 0.5, delay: 0.3 }}
                        // whileHover={{ scale: 1.05 }}
                        className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-yellow-500 bg-neutral-800 shadow-md md:h-18 md:w-20"
                     >
                        {name !== "Anonymous" ? (
                           <span className="text-2xl font-bold text-yellow-500 md:text-3xl">
                              {initials}
                           </span>
                        ) : (
                           <User className="h-10 w-10 text-yellow-500 md:h-12 md:w-12" />
                        )}
                     </motion.div>
                  )}

                  {/* Name + Email */}
                  <div className="flex w-full min-w-0 flex-col items-center md:items-start">
                     <h2 className="text-light truncate text-base font-bold md:text-xl">
                        {name}
                     </h2>
                     <p className="max-w-full truncate text-sm text-neutral-400 md:text-base">
                        {email}
                     </p>
                  </div>
               </motion.div>

               <Divider className="my-5 md:my-6" />

               {/* Switches */}
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="space-y-4"
               >
                  <div className="flex items-center justify-between gap-2">
                     <p className="text-sm text-neutral-400">
                        Turn on edit mode to modify or delete funds
                     </p>
                     <Switch
                        defaultChecked={isEditMode}
                        onToggle={toggleEditMode}
                     />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                     <p className="text-sm text-neutral-400">
                        Permit other users to share funds with you
                     </p>
                     <Switch
                        onToggle={handleShareSwitch}
                        defaultChecked={canShare}
                     />
                  </div>
               </motion.div>

               <Divider className="my-5 md:my-6" />

               {/* Shared Recipients */}
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="flex flex-col gap-3"
               >
                  <h3 className="text-light text-base font-semibold md:text-lg">
                     Shared Recipients
                  </h3>

                  {loadingRecipients ? (
                     <Loader2 className="h-6 w-6 animate-spin text-yellow-500" />
                  ) : sharedRecipients.length === 0 ? (
                     <p className="text-sm text-neutral-400">
                        No shared recipients yet.
                     </p>
                  ) : (
                     <>
                        <AnimatePresence>
                           {(showAllRecipients
                              ? sharedRecipients
                              : sharedRecipients.slice(0, 2)
                           ).map((recipient) => (
                              <motion.div
                                 key={recipient.uid}
                                 initial={{ opacity: 0, y: 10 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 exit={{ opacity: 0, y: -10 }}
                                 transition={{ duration: 0.3 }}
                                 className="flex flex-col items-center justify-between gap-1 rounded-lg border border-neutral-700 px-3 py-2 sm:flex-row"
                              >
                                 <span className="text-light truncate text-sm max-sm:max-w-40 sm:text-base">
                                    {recipient.name || recipient.email}
                                 </span>

                                 <div className="flex gap-2">
                                    {/* Update Button */}
                                    <motion.button
                                       whileTap={{ scale: 0.95 }}
                                       whileHover={{ scale: 1.05 }}
                                       onClick={() =>
                                          handleUpdateSharedFunds(recipient.uid)
                                       }
                                       className="text-light rounded-lg border border-blue-800 bg-blue-500/10 px-2 py-1 text-xs transition-colors hover:bg-blue-600/80 sm:text-sm"
                                    >
                                       Update
                                    </motion.button>

                                    {/* Unshare Button */}
                                    <motion.button
                                       whileTap={{ scale: 0.95 }}
                                       whileHover={{ scale: 1.05 }}
                                       onClick={() => {
                                          setUnshareModalOpen(true);
                                          setUnshareRecipient(recipient);
                                       }}
                                       className="text-light rounded-lg border border-red-800 bg-red-500/10 px-2 py-1 text-xs transition-colors hover:bg-red-600/80 sm:text-sm"
                                    >
                                       Unshare
                                    </motion.button>
                                 </div>
                              </motion.div>
                           ))}
                        </AnimatePresence>

                        {sharedRecipients.length > 2 && (
                           <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() =>
                                 setShowAllRecipients((prev) => !prev)
                              }
                              className="mt-2 self-start text-sm text-yellow-400 hover:text-yellow-300"
                           >
                              {showAllRecipients ? "Show Less" : "Show More..."}
                           </motion.button>
                        )}
                     </>
                  )}
               </motion.div>

               <Divider className="my-5 md:my-6" />

               {/* Share Funds Section */}
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="flex flex-col gap-3"
               >
                  <h3 className="text-light text-base font-semibold sm:text-lg">
                     Share Your Funds
                  </h3>

                  <SearchSelect
                     label="Investor's name"
                     options={users.filter(
                        (u) =>
                           !sharedRecipients
                              .map((r) => r.uid)
                              .includes(u.value),
                     )} // List of users to share funds with except shared recipients
                     value={
                        selectedUser
                           ? users.find((u) => u.value === selectedUser.value)
                                ?.label
                           : ""
                     }
                     defaultValue="Select investor"
                     onChange={(opt) => setSelectedUser(opt)}
                     forOnChangeReturnsObject={true}
                     autoFocus={false}
                  />

                  <motion.button
                     whileHover={selectedUser ? { scale: 1.01 } : {}}
                     whileTap={selectedUser ? { scale: 0.99 } : {}}
                     onClick={() => setShareModalOpen(true)}
                     disabled={!selectedUser}
                     className={`text-light flex items-center justify-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 transition ${
                        selectedUser ? "hover:bg-yellow-500" : ""
                     } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                     <Share2 className="h-5 w-5" /> Share Funds
                  </motion.button>
               </motion.div>

               <Divider className="my-5 md:my-6" />

               {/* Back / Home */}
               <motion.div
                  className="text-center text-sm text-neutral-400"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6}}
               >
                  <Link
                     to="/"
                     className="font-medium text-yellow-400 hover:text-yellow-300"
                  >
                     <span className="text-light/80">Go to</span> Home
                  </Link>
               </motion.div>
            </motion.div>
         </div>

         {shareModalOpen && (
            <ShareModal
               value={selectedUser.label}
               onConfirm={handleShareFunds}
               onCancel={() => setShareModalOpen(false)}
            />
         )}

         {unshareModalOpen && (
            <UnshareModal
               recipient={unshareRecipient}
               onConfirm={handleUnshareFunds}
               onCancel={() => setUnshareModalOpen(false)}
            />
         )}
      </>
   );
};

export default Account;
