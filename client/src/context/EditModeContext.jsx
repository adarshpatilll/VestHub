import { createContext, useContext, useEffect, useState } from "react";
import { useAuthContext } from "./AuthContext";

const EditModeContext = createContext();

export const EditModeProvider = ({ children }) => {
   // Get the edit mode state from localstorage
   const [isEditMode, setIsEditMode] = useState(() => {
      const saved = localStorage.getItem("editMode");
      return saved === "true";
   });

   const toggleEditMode = () => {
      localStorage.setItem("editMode", !isEditMode);
      setIsEditMode((prev) => !prev);
   };

   return (
      <EditModeContext.Provider
         value={{ isEditMode, toggleEditMode, setIsEditMode }}
      >
         {children}
      </EditModeContext.Provider>
   );
};

export const useEditMode = () => useContext(EditModeContext);
