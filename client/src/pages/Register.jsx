import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
   hidden: { opacity: 0 },
   visible: { opacity: 1, transition: { duration: 0.25 } },
};

const cardVariants = {
   hidden: { opacity: 0, y: 18, scale: 0.98 },
   visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.35, ease: "easeOut" },
   },
};

const headerVariants = {
   hidden: { opacity: 0, y: 8 },
   visible: { opacity: 1, y: 0, transition: { duration: 0.25, delay: 0.1 } },
};

const formVariants = {
   hidden: { opacity: 0 },
   visible: (shake) => ({
      opacity: 1,
      x: shake ? [0, -6, 6, -4, 4, -2, 2, 0] : 0,
      transition: {
         staggerChildren: 0.07,
         delayChildren: 0.15,
         duration: shake ? 0.35 : 0.3,
      },
   }),
};

const fieldVariants = {
   hidden: { opacity: 0, y: 10 },
   visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const Register = () => {
   const [name, setName] = useState("");
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");

   const [showPassword, setShowPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [errors, setErrors] = useState({});
   const [shake, setShake] = useState(false);

   const { registerUser, loginWithGoogle } = useAuthContext();

   const validateForm = () => {
      const newErrors = {};
      if (!name.trim()) newErrors.name = "Name is required";
      if (!email.trim()) {
         newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(email)) {
         newErrors.email = "Enter a valid email";
      }
      if (!password) {
         newErrors.password = "Password is required";
      } else if (password.length < 6) {
         newErrors.password = "Password must be at least 6 characters";
      }
      if (password !== confirmPassword) {
         newErrors.confirmPassword = "Passwords do not match";
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const triggerShake = () => {
      setShake(true);
      setTimeout(() => setShake(false), 400);
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validateForm()) {
         triggerShake();
         return;
      }

      setIsLoading(true);
      try {
         await registerUser(email, password, name);
         toast.success("Registration successful");
         setName("");
         setEmail("");
         setPassword("");
         setConfirmPassword("");
      } catch (error) {
         if (error.code === "auth/invalid-email") {
            toast.error("Invalid email address");
         } else if (error.code === "auth/email-already-in-use") {
            toast.error("Email already in use");
         } else if (error.code === "auth/weak-password") {
            toast.error("Weak password. At least 6 characters required.");
         } else if (error.code === "auth/too-many-requests") {
            toast.error("Too many attempts. Try again later.");
         } else {
            toast.error("Error registering user");
         }
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <motion.div
         className="flex min-h-screen items-center justify-center bg-neutral-950 p-4 transition-colors duration-300"
         variants={containerVariants}
         initial="hidden"
         animate="visible"
      >
         <motion.div
            className="bg-dark max-xs:max-w-xs w-full max-w-md overflow-hidden rounded-2xl border border-neutral-700 shadow-2xl sm:max-w-lg"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
         >
            {/* Header */}
            <motion.div
               className="space-y-2 p-6 text-center sm:p-8"
               variants={headerVariants}
            >
               <h1 className="text-light max-xs:text-xl text-3xl font-bold sm:text-4xl">
                  Create Account
               </h1>
               <p className="text-light/60 max-xs:text-xs text-sm sm:text-base">
                  Sign up to start managing your funds
               </p>
            </motion.div>

            {/* Google Register */}
            <div className="max-xs:gap-3 flex flex-col gap-5 px-6 sm:gap-6 sm:px-8">
               <motion.button
                  className="text-light max-xs:text-sm flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800 font-medium transition hover:bg-neutral-700"
                  onClick={loginWithGoogle}
               >
                  <FcGoogle size={20} />
                  Continue with Google
               </motion.button>

               {/* Divider */}
               <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                     <div className="w-full border-t border-neutral-700"></div>
                  </div>
                  <div className="max-xs:text-[11px] relative flex justify-center text-xs uppercase">
                     <span className="bg-dark text-light/30 px-2">
                        or sign up with
                     </span>
                  </div>
               </div>

               {/* Form */}
               <motion.form
                  onSubmit={handleSubmit}
                  className="max-xs:gap-3 flex flex-col gap-5 sm:gap-6"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  custom={shake}
                  noValidate
               >
                  {/* Name */}
                  <motion.div variants={fieldVariants}>
                     <label
                        htmlFor="name"
                        className="text-light mb-1 block text-sm font-medium"
                     >
                        Full Name
                     </label>
                     <div className="relative">
                        <User className="text-light/40 absolute top-3.5 left-3 h-4 w-4" />
                        <input
                           id="name"
                           type="text"
                           placeholder="Enter your name"
                           value={name}
                           onChange={(e) => setName(e.target.value)}
                           className={`text-light max-xs:text-sm placeholder-light/35 h-11 w-full rounded-lg border bg-neutral-800 pr-3 pl-10 focus:ring focus:ring-yellow-300 focus:outline-none ${
                              errors.name
                                 ? "border-red-500 focus:ring-red-400"
                                 : "border-neutral-700"
                           }`}
                        />
                     </div>
                     <AnimatePresence>
                        {errors.name && (
                           <motion.p
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.25 }}
                              className="mt-1 text-xs text-red-400"
                           >
                              {errors.name}
                           </motion.p>
                        )}
                     </AnimatePresence>
                  </motion.div>

                  {/* Email */}
                  <motion.div variants={fieldVariants}>
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
                           type="text"
                           placeholder="Enter your email"
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           className={`text-light max-xs:text-sm placeholder-light/35 h-11 w-full rounded-lg border bg-neutral-800 pr-3 pl-10 focus:ring focus:ring-yellow-300 focus:outline-none ${
                              errors.email
                                 ? "border-red-500 focus:ring-red-400"
                                 : "border-neutral-700"
                           }`}
                        />
                     </div>
                     <AnimatePresence>
                        {errors.email && (
                           <motion.p
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
                  </motion.div>

                  {/* Password */}
                  <motion.div variants={fieldVariants}>
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
                           className={`text-light max-xs:text-sm placeholder-light/35 h-11 w-full rounded-lg border bg-neutral-800 pr-10 pl-10 focus:ring focus:ring-yellow-300 focus:outline-none ${
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
                  </motion.div>

                  {/* Confirm Password */}
                  <motion.div variants={fieldVariants}>
                     <label
                        htmlFor="confirmPassword"
                        className="text-light mb-1 block text-sm font-medium"
                     >
                        Confirm Password
                     </label>
                     <div className="relative">
                        <Lock className="text-light/40 absolute top-3.5 left-3 h-4 w-4" />
                        <input
                           id="confirmPassword"
                           type={showConfirmPassword ? "text" : "password"}
                           placeholder="Re-enter your password"
                           value={confirmPassword}
                           onChange={(e) => setConfirmPassword(e.target.value)}
                           className={`text-light max-xs:text-sm placeholder-light/35 h-11 w-full rounded-lg border bg-neutral-800 pr-10 pl-10 focus:ring focus:ring-yellow-300 focus:outline-none ${
                              errors.confirmPassword
                                 ? "border-red-500 focus:ring-red-400"
                                 : "border-neutral-700"
                           }`}
                        />
                        <button
                           type="button"
                           className="text-light/40 hover:text-light/60 absolute top-0 right-0 h-full px-3"
                           onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                           }
                        >
                           {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                           ) : (
                              <Eye className="h-4 w-4" />
                           )}
                        </button>
                     </div>
                     <AnimatePresence>
                        {errors.confirmPassword && (
                           <motion.p
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.25 }}
                              className="mt-1 text-xs text-red-400"
                           >
                              {errors.confirmPassword}
                           </motion.p>
                        )}
                     </AnimatePresence>
                  </motion.div>

                  {/* Submit */}
                  <motion.button
                     type="submit"
                     className="text-light max-xs:mt-1 max-xs:text-sm h-11 w-full rounded-lg bg-yellow-600 text-base font-medium shadow-md transition hover:bg-yellow-500 disabled:opacity-50"
                     disabled={isLoading}
                  >
                     {isLoading ? "Creating account..." : "Sign up"}
                  </motion.button>
               </motion.form>
            </div>

            {/* Footer */}
            <div className="max-xs:text-xs p-6 text-center text-sm text-neutral-400 sm:p-8">
               Already have an account?{" "}
               <Link
                  to="/login"
                  className="font-medium text-yellow-400 hover:text-yellow-300"
               >
                  Sign in
               </Link>
            </div>
         </motion.div>
      </motion.div>
   );
};

export default Register;
