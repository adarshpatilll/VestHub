import { Link, NavLink } from "react-router-dom";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { toast } from "sonner";
import { useAuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const links = [
   { to: "/", label: "Home" },
   { to: "/funds", label: "Manage Funds" },
   { to: "/account", label: "Account" },
];

const Navbar = () => {
   const { user, logoutUser, getUserDetails } = useAuthContext();

   const [userDetails, setUserDetails] = useState(null);

   useEffect(() => {
      const fetchUserDetails = async () => {
         const details = await getUserDetails();
         setUserDetails(details);
      };

      fetchUserDetails();
   }, [getUserDetails]);

   const handleLogout = async () => {
      try {
         await logoutUser();
         toast.success(`Goodbye, ${userDetails?.name || "Investor"}!`, { duration: 3000 });
      } catch (error) {
         toast.error("Failed to log out. Try again.");
      }
   };

   return (
      <motion.nav
         initial={{ y: -60, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         transition={{ duration: 0.5, ease: "easeOut" }}
         className="bg-dark text-light fixed top-0 left-0 z-50 flex h-14 w-full items-center justify-between border-b border-b-neutral-600 px-5 py-1"
      >
         {/* Logo */}
         <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
         >
            <Link
               to={"/"}
               className="flex items-center justify-center text-xl font-bold tracking-wider"
            >
               Vest <span className="text-yellow-300">Hub</span>
            </Link>
         </motion.div>

         {/* Links */}
         <motion.div
            className="hidden w-auto items-center justify-between gap-2 text-sm md:flex"
            initial="hidden"
            animate="visible"
            variants={{
               hidden: {},
               visible: {
                  transition: { staggerChildren: 0.15, delayChildren: 0.3 },
               },
            }}
         >
            {links.map(({ to, label }) => (
               <motion.div
                  key={to}
                  variants={{
                     hidden: { opacity: 0, y: -10 },
                     visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
               >
                  <NavLink
                     to={to}
                     className={({ isActive }) =>
                        `hover:bg-light/15 rounded-md px-4 py-1 transition-colors duration-200 ${
                           isActive ? "bg-light/15" : ""
                        }`
                     }
                  >
                     {label}
                  </NavLink>
               </motion.div>
            ))}
         </motion.div>

         {/* Logout Button */}
         <motion.button
            onClick={handleLogout}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.06 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="text-dark rounded-full bg-yellow-500 px-2 py-2 transition-colors duration-200 hover:bg-yellow-600"
         >
            <RiLogoutCircleRLine size={20} />
         </motion.button>
      </motion.nav>
   );
};

export default Navbar;
