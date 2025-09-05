import ResponsiveToaster from "./components/ResponsiveToaster";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router.config";
import useAntiInspect from "./hooks/useAntiInspect";

const App = () => {
   // useAntiInspect();

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
