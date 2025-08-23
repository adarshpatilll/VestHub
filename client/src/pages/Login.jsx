import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthContext } from "../context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";

const Login = () => {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [errors, setErrors] = useState({ email: "", password: "" });

   const [showPassword, setShowPassword] = useState(false);
   const [isLoading, setIsLoading] = useState(false);

   const navigate = useNavigate();
   const { loginWithGoogle, loginUser } = useAuthContext();

   const validateForm = () => {
      let valid = true;
      let newErrors = { email: "", password: "" };

      if (!email.trim()) {
         newErrors.email = "Email is required";
         valid = false;
      } else if (!/\S+@\S+\.\S+/.test(email)) {
         newErrors.email = "Enter a valid email address";
         valid = false;
      }

      if (!password.trim()) {
         newErrors.password = "Password is required";
         valid = false;
      } else if (password.length < 6) {
         newErrors.password = "Password must be at least 6 characters";
         valid = false;
      }

      setErrors(newErrors);
      return valid;
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      setIsLoading(true);
      try {
         await loginUser(email, password);
         navigate("/", { replace: true });
      } catch (error) {
         console.error("Error during login:", error);

         if (error.code === "auth/too-many-requests") {
            toast.error(
               "Too many attempts. Please reset your password or try again later.",
            );
         } else if (error.code === "auth/invalid-credential") {
            toast.error("Invalid credentials. Please try again.");
         } else {
            toast.error(error.message || "Error logging in. Please try again.");
         }
      } finally {
         setIsLoading(false);
         setEmail("");
         setPassword("");
      }
   };

   return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 p-4 sm:p-6 lg:p-8">
         <motion.div
            className="bg-dark w-full max-w-sm overflow-hidden rounded-2xl border border-neutral-700 shadow-2xl sm:max-w-md md:max-w-lg"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
         >
            {/* Header */}
            <div className="space-y-2 p-6 text-center sm:p-8">
               <h1 className="text-light text-2xl font-bold sm:text-3xl">
                  Welcome to VestHub
               </h1>
               <p className="text-light/60 text-sm sm:text-base">
                  Sign in to your account to continue
               </p>
            </div>

            {/* Google Login */}
            <div className="space-y-5 px-6 sm:px-8">
               <button
                  className="text-light flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800 font-medium transition hover:bg-neutral-700"
                  onClick={loginWithGoogle}
               >
                  <FcGoogle size={20} />
                  Continue with Google
               </button>

               {/* Divider */}
               <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                     <div className="w-full border-t border-neutral-700"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                     <span className="bg-dark text-light/30 px-2">
                        or continue with
                     </span>
                  </div>
               </div>

               {/* Form */}
               <motion.form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
               >
                  {/* Email */}
                  <div>
                     <label
                        htmlFor="email"
                        className="text-light mb-1 block text-sm font-medium"
                     >
                        Email
                     </label>
                     <div className="relative">
                        <Mail className="text-light/40 absolute top-3.5 left-3 h-4 w-4" />
                        <input
                           id="email"
                           type="text" // ⬅️ so browser doesn’t throw its own warning
                           placeholder="Enter your email"
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           className={`text-light placeholder-light/35 h-11 w-full rounded-lg border bg-neutral-800 pr-3 pl-10 focus:ring focus:ring-yellow-300 focus:outline-none ${
                              errors.email
                                 ? "border-red-500 focus:ring-red-400"
                                 : "border-neutral-700"
                           }`}
                        />
                     </div>

                     <AnimatePresence>
                        {errors.email && (
                           <motion.p
                              key="emailError"
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.25 }}
                              className="mt-1 text-xs text-red-400"
                           >
                              {errors.email}
                           </motion.p>
                        )}
                     </AnimatePresence>
                  </div>

                  {/* Password */}
                  <div>
                     <label
                        htmlFor="password"
                        className="text-light mb-1 block text-sm font-medium"
                     >
                        Password
                     </label>
                     <div className="relative">
                        <Lock className="text-light/40 absolute top-3.5 left-3 h-4 w-4" />
                        <input
                           id="password"
                           type={showPassword ? "text" : "password"}
                           placeholder="Enter your password"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           className={`text-light placeholder-light/35 h-11 w-full rounded-lg border bg-neutral-800 pr-10 pl-10 focus:ring focus:ring-yellow-300 focus:outline-none ${
                              errors.password
                                 ? "border-red-500 focus:ring-red-400"
                                 : "border-neutral-700"
                           }`}
                        />
                        <button
                           type="button"
                           className="text-light/40 hover:text-light/60 absolute top-0 right-0 h-full px-3"
                           onClick={() => setShowPassword(!showPassword)}
                        >
                           {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                           ) : (
                              <Eye className="h-4 w-4" />
                           )}
                        </button>
                     </div>

                     <AnimatePresence>
                        {errors.password && (
                           <motion.p
                              key="passwordError"
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.25 }}
                              className="mt-1 text-xs text-red-400"
                           >
                              {errors.password}
                           </motion.p>
                        )}
                     </AnimatePresence>
                  </div>

                  {/* Forgot Password */}
                  <div className="flex justify-end">
                     <Link
                        to="/reset-password"
                        className="text-sm text-yellow-400 hover:text-yellow-300"
                     >
                        Forgot password?
                     </Link>
                  </div>

                  {/* Submit */}
                  <button
                     type="submit"
                     className="text-light h-11 w-full rounded-lg bg-yellow-600 text-base font-medium shadow-md transition hover:bg-yellow-500 disabled:opacity-50"
                     disabled={isLoading}
                  >
                     {isLoading ? "Signing in..." : "Sign in"}
                  </button>
               </motion.form>
            </div>

            {/* Footer */}
            <div className="p-6 text-center text-sm text-neutral-400 sm:p-8">
               Don't have an account?{" "}
               <Link
                  to="/register"
                  className="font-medium text-yellow-400 hover:text-yellow-300"
               >
                  Sign up
               </Link>
            </div>
         </motion.div>
      </div>
   );
};

export default Login;
