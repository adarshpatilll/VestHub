import ResponsiveToaster from "./components/ResponsiveToaster";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router.config";

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
