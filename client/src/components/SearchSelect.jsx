import { useState, useRef, useEffect } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { searchFilter } from "../lib/searchFilter";

export default function SearchSelect({
   label,
   options,
   value,
   defaultValue,
   onChange,
   allowCreate,
   autoFocus = true,
   forOnChangeReturnsObject = false,
}) {
   const [open, setOpen] = useState(false);
   const [query, setQuery] = useState("");
   const ref = useRef(null);

   // Close on outside click
   useEffect(() => {
      function handleClickOutside(e) {
         if (ref.current && !ref.current.contains(e.target)) {
            setOpen(false);
         }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
         document.removeEventListener("mousedown", handleClickOutside);
   }, []);

   // Filter options based on query
   const filtered = searchFilter(options, query);

   return (
      <div ref={ref} className="relative flex w-full flex-col select-none">
         {label && <label className="text-light text-sm">{label}</label>}

         {/* Input Box */}
         <div
            className={`mt-1 flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors ${
               open
                  ? "border-light border bg-neutral-800" // active state
                  : "border border-neutral-700 bg-neutral-800"
            }`}
            onClick={() => setOpen((prev) => !prev)}
         >
            <span
               className={`flex-1 truncate ${
                  value ? "text-light" : "text-light/50"
               }`}
            >
               {value
                  ? value
                  : defaultValue
                    ? defaultValue
                    : "Select an option"}
            </span>
            <IoIosArrowDown
               className={`ml-2 shrink-0 transition-transform ${
                  open ? "rotate-180" : ""
               }`}
            />
         </div>

         {/* Dropdown */}
         {open && (
            <div className="absolute top-full left-0 z-10 mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 shadow-lg">
               {/* Search */}
               <input
                  type="text"
                  placeholder={`Search or ${allowCreate ? "type new..." : "select an option..."}`}
                  value={query}
                  autoFocus={autoFocus}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-t-lg border-b border-neutral-700 bg-neutral-800 px-3 py-2 text-gray-200 focus:outline-none"
               />

               {/* Options */}
               <ul className="max-h-52 overflow-y-auto">
                  {filtered.map((opt, idx) => (
                     <li
                        key={opt.value + idx}
                        className="cursor-pointer px-3 py-2 text-gray-200 transition-colors hover:bg-neutral-800"
                        onClick={() => {
                           onChange(forOnChangeReturnsObject ? opt : opt.value);
                           setOpen(false);
                           setQuery("");
                        }}
                     >
                        {opt.label}
                     </li>
                  ))}

                  {/* Show "Add new" if input doesn't exist */}
                  {allowCreate &&
                     query &&
                     !options.some((o) => o.value === query) && (
                        <li
                           className="cursor-pointer px-3 py-2 font-medium text-yellow-400 transition-colors hover:bg-neutral-800"
                           onClick={() => {
                              onChange(query); // add the new category
                              setOpen(false);
                              setQuery("");
                           }}
                        >
                           Add "{query}"
                        </li>
                     )}

                  {filtered.length === 0 && query === "" && (
                     <li className="text-light/50 px-3 py-2">
                        No results found
                     </li>
                  )}
               </ul>
            </div>
         )}
      </div>
   );
}
