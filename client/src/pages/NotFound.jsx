import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
   const navigate = useNavigate();

   return (
      <motion.div
         className="bg-dark text-light flex min-h-screen flex-col items-center justify-center px-4"
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
      >
         <motion.h1
            className="mb-4 text-6xl font-bold text-yellow-400"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4 }}
         >
            404
         </motion.h1>

         <motion.p
            className="mb-6 max-w-md text-center text-lg text-neutral-400 md:text-xl"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
         >
            Oops! The page you’re looking for doesn’t exist or has been moved.
         </motion.p>

         <motion.button
            onClick={() => navigate("/")}
            className="text-dark flex items-center gap-2 rounded-lg bg-yellow-400 px-6 py-3 font-medium transition-colors hover:bg-yellow-500"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
         >
            <ArrowLeft size={18} />
            Go Back Home
         </motion.button>
      </motion.div>
   );
};

export default NotFound;
