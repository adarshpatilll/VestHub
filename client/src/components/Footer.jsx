import { NavLink } from "react-router-dom";
import { IoHomeOutline, IoWalletOutline } from "react-icons/io5";
import { RiAccountCircleLine } from "react-icons/ri";
import { motion } from "framer-motion";

const links = [
   {
      id: 1,
      to: "/",
      icon: <IoHomeOutline size={18} className="shrink-0" />,
      label: "Home",
   },
   {
      id: 2,
      to: "/funds",
      icon: <IoWalletOutline size={18} className="shrink-0" />,
      label: "Manage Funds",
   },
   {
      id: 3,
      to: "/account",
      icon: <RiAccountCircleLine size={18} className="shrink-0" />,
      label: "Account",
   },
];

const Footer = () => {
   return (
      <motion.footer
         initial={{ y: 60, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         transition={{ duration: 0.5, ease: "easeOut" }}
         className="bg-dark text-light fixed right-0 bottom-0 left-0 z-40 flex h-16 w-full items-center justify-between gap-2 border-t border-t-neutral-600 px-2 text-sm sm:flex md:hidden"
      >
         {/* links */}
         {links.map(({ id, to, icon, label }) => {
            return (
               <NavLink
                  key={id}
                  to={to}
                  className={({ isActive }) =>
                     `flex max-w-[120px] flex-col items-center gap-1 rounded-md px-4 py-1 duration-200 ${
                        isActive && "text-yellow-300"
                     }`
                  }
               >
                  {icon}
                  <span className="truncate">{label}</span>
               </NavLink>
            );
         })}
      </motion.footer>
   );
};

export default Footer;
