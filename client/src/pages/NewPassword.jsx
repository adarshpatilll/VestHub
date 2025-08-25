import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase.config";
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { toast } from "sonner";

const NewPassword = () => {
   const [searchParams] = useSearchParams();
   const navigate = useNavigate();

   const [email, setEmail] = useState(null);
   const [newPassword, setNewPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");

   const [loading, setLoading] = useState(false);

   const oobCode = searchParams.get("oobCode");

   useEffect(() => {
      if (oobCode) {
         verifyPasswordResetCode(auth, oobCode)
            .then((email) => setEmail(email))
            .catch(() => toast.error("Invalid or expired reset link"));
      } else {
         navigate("/login", { replace: true });
      }
   }, [oobCode]);

   const handleNewPassword = async (e) => {
      e.preventDefault();
      if (newPassword !== confirmPassword) {
         toast.error("Passwords do not match!");
         return;
      }

      setLoading(true);
      try {
         await confirmPasswordReset(auth, oobCode, newPassword);
         toast.success("Password reset successful 🎉");
         navigate("/login", { replace: true });
      } catch (error) {
         console.error(error);
         toast.error(error.message);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 p-4">
         <div className="bg-dark max-xs:p-4 w-full max-w-md rounded-2xl border border-neutral-700 p-6 shadow-xl">
            <h2 className="text-light max-xs:text-lg mb-4 text-xl font-bold">
               Set New Password
            </h2>
            {email && (
               <p className="text-light/70 max-xs:text-sm mb-4">
                  Resetting password for: {email}
               </p>
            )}
            <form onSubmit={handleNewPassword} className="space-y-4">
               <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="text-light max-xs:p-2 w-full rounded-lg border border-neutral-700 bg-neutral-800 p-3"
               />
               <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="text-light max-xs:p-2 w-full rounded-lg border border-neutral-700 bg-neutral-800 p-3"
               />
               <button
                  type="submit"
                  disabled={loading}
                  className="text-light max-xs:p-2 w-full rounded-lg bg-yellow-600 p-3 transition hover:bg-yellow-500"
               >
                  {loading ? "Updating..." : "Update Password"}
               </button>
            </form>
         </div>
      </div>
   );
};

export default NewPassword;
