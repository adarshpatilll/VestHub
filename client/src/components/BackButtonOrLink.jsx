import { IoIosArrowBack } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";

const BackButtonOrLink = ({ isLink = false, className }) => {
   const navigate = useNavigate();

   return (
      <>
         {isLink && (
            <button
               onClick={() => navigate(-1)}
               className={`group flex items-center justify-center rounded-md py-0.5 text-sm text-yellow-400 ${className}`}
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
