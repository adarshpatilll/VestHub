import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/firebase.config";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

const ResetPassword = () => {
   const [email, setEmail] = useState("");
   const [loading, setLoading] = useState(false);
   const navigate = useNavigate();

   const handleReset = async (e) => {
      e.preventDefault();
      setLoading(true);

      try {
         const actionCodeSettings = {
            url: `${import.meta.env.VITE_DOMAIN}/new-password`,
            handleCodeInApp: true,
         };

         await sendPasswordResetEmail(auth, email, actionCodeSettings);
         toast.success(
            "Password reset email sent! Check your inbox or Junk folder.",
         );
         navigate("/login", { replace: true });
      } catch (error) {
         console.error(error);
         toast.error(error.message);
      } finally {
         setLoading(false);
         setEmail("");
      }
   };

   return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 p-4">
         <div className="bg-dark max-xs:p-4 max-xs:max-w-xs w-full max-w-sm rounded-2xl border border-neutral-700 p-6 shadow-xl sm:max-w-md">
            <h2 className="text-light max-xs:text-lg mb-4 text-xl font-bold">
               Reset Password
            </h2>
            <form onSubmit={handleReset} className="space-y-4">
               <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="text-light max-xs:p-2 w-full rounded-lg border border-neutral-700 bg-neutral-800 p-3"
               />
               <button
                  type="submit"
                  disabled={loading}
                  className="text-light max-xs:p-2 w-full rounded-lg bg-yellow-600 p-3 transition hover:bg-yellow-500"
               >
                  {loading ? "Sending..." : "Send Reset Link"}
               </button>
            </form>
            <div className="max-xs:text-xs mt-6 text-center text-sm text-neutral-400">
               Back to{" "}
               <Link
                  to="/login"
                  className="font-medium text-yellow-400 hover:text-yellow-300"
               >
                  Login
               </Link>
            </div>
         </div>
      </div>
   );
};

export default ResetPassword;
