import { Loader2 } from "lucide-react";

const CircularLoader = ({ label }) => {
   return (
      <div className="bg-dark fixed top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-2 text-sm sm:text-base">
         <Loader2 className="h-8 w-8 animate-spin text-yellow-500" /> {label}
      </div>
   );
};

export default CircularLoader;
