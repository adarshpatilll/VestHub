import { createContext, useContext, useState } from "react";

const EditModeContext = createContext();

export const EditModeProvider = ({ children }) => {
   // Get the edit mode state from localstorage
   const [isEditMode, setIsEditMode] = useState(() => {
      const saved = localStorage.getItem(
         atob("editMode") + btoa(btoa("editMode")),
      );
      return saved === "true";
   });

   // Save hashed edit mode state to localstorage

   const toggleEditMode = () => {
      const hashedEditMode = btoa(!isEditMode) + btoa(btoa(!isEditMode));

      localStorage.setItem("editMode", hashedEditMode);
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
