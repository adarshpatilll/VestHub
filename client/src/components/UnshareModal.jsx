import { motion } from "framer-motion";

const UnshareModal = ({ recipient, onConfirm, onCancel }) => {
   if (!recipient) return null;

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
         <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-dark text-light hide-scrollbar relative w-[90%] rounded-xl p-4 shadow-xl sm:w-[90%] sm:rounded-2xl sm:p-6 md:w-full md:max-w-md"
         >
            <h2 className="text-light mb-2 text-lg font-semibold">
               Unshare Fund
            </h2>
            <p className="mb-4 text-sm text-neutral-300">
               Are you sure you want to unshare with{" "}
               <span className="font-medium text-yellow-400">
                  {recipient?.name || recipient?.email}
               </span>
               ?
            </p>

            <div className="flex justify-end gap-3">
               <button
                  onClick={onCancel}
                  className="rounded-md bg-neutral-700 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-600"
               >
                  Cancel
               </button>
               <button
                  onClick={() => onConfirm(recipient.uid)}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
               >
                  Confirm
               </button>
            </div>
         </motion.div>
      </div>
   );
};

export default UnshareModal;
