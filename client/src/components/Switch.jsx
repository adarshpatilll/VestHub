import { useEditMode } from "../context/EditModeContext";

const Switch = ({ onToggle, defaultChecked }) => {
   return (
      <button
         type="button"
         onClick={() => onToggle(!defaultChecked)}
         className={`relative inline-flex h-6 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            defaultChecked ? "bg-yellow-500" : "bg-neutral-700"
         }`}
      >
         <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
               defaultChecked ? "translate-x-6" : "translate-x-0"
            }`}
         />
      </button>
   );
};

export default Switch;
