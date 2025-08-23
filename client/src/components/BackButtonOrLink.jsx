import { IoIosArrowBack } from "react-icons/io";
import { Link } from "react-router-dom";

const BackButtonOrLink = ({ setViewMode, isLink = false, to = "/funds" }) => {
   return (
      <>
         {isLink ? (
            <Link
               to={to}
               className="group flex items-center justify-center rounded-md px-3 py-0.5 text-sm text-yellow-400"
            >
               {
                  <IoIosArrowBack className="transition-transform group-hover:-translate-x-1" />
               }{" "}
               Back
            </Link>
         ) : (
            <button
               onClick={() => setViewMode("menu")}
               className="group flex items-center justify-center rounded-md px-3 py-0.5 text-sm text-yellow-400"
            >
               {
                  <IoIosArrowBack className="transition-transform group-hover:-translate-x-1" />
               }{" "}
               Back
            </button>
         )}
      </>
   );
};

export default BackButtonOrLink;
