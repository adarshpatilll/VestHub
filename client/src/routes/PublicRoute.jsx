import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

const PublicRoute = () => {
   const { user, loading } = useAuthContext();

   if (loading)
      return (
         <div className="bg-dark flex h-screen w-full items-center justify-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent"></div>
            <span className="text-light">Loading...</span>
         </div>
      );

   // ✅ If logged in, don't allow login/register and reset-password page → redirect home
   if (user) {
      return <Navigate to="/" replace />;
   }

   return <Outlet />;
};

export default PublicRoute;
