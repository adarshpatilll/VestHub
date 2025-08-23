import { FundsProvider } from "../context/FundContext";
import { EditModeProvider } from "../context/EditModeContext";
import { AuthProvider } from "../context/AuthContext";

const AppProvider = ({ children }) => {
   return (
      <AuthProvider>
         <FundsProvider>
            <EditModeProvider>{children}</EditModeProvider>
         </FundsProvider>
      </AuthProvider>
   );
};

export default AppProvider;
