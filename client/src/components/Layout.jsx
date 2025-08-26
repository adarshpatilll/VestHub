import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Layout = () => {
   return (
      <div className="bg-dark text-light relative flex h-screen flex-col">
         <Navbar />

         {/* Add padding-top & padding-bottom equal to nav + footer heights */}
         <main className="h-full flex-1 overflow-y-auto px-4 pt-18 pb-20 md:pb-4">
            <Outlet />
         </main>

         <Footer />
      </div>
   );
};

export default Layout;
