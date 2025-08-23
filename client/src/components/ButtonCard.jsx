import { Link } from "react-router-dom";

const ButtonCard = ({ icon: Icon, label, onClick, to }) => {
   return to ? (
      <Link
         to={to}
         className="flex flex-col items-center justify-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900 p-6 transition-colors hover:bg-neutral-800"
      >
         <Icon size={28} />
         <span className="font-medium">{label}</span>
      </Link>
   ) : (
      <button
         onClick={onClick}
         className="flex flex-col items-center justify-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900 p-6 transition-colors hover:bg-neutral-800"
      >
         <Icon size={28} />
         <span className="font-medium">{label}</span>
      </button>
   );
};

export default ButtonCard;
