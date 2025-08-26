import ResponsiveToaster from "./components/ResponsiveToaster";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router.config";
import { useFundsContext } from "./context/FundContext";
import { useEffect } from "react";

const App = () => {
   return (
      <>
         {/* Toaster for notifications */}
         <ResponsiveToaster />

         {/* Router setup */}
         <RouterProvider router={router} />
      </>
   );
};

export default App;
