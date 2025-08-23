// Default Reset Password by Google




import { useState } from "react";
import { Mail } from "lucide-react";
import { resetPassword } from "../firebase/data";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			await resetPassword(email);
			toast.success("Password reset email sent ✅");
			setEmail("");
		} catch (error) {
			console.error("Error resetting password:", error);
			if (error.code === "auth/user-not-found") {
				toast.error("No user found with this email.");
			} else {
				toast.error("Failed to send reset email.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-neutral-950 p-4">
			<div className="w-full max-w-md bg-dark rounded-2xl shadow-2xl border border-neutral-700 p-6 sm:p-8">
				<h2 className="text-2xl font-bold text-light mb-4 text-center">
					Reset Password
				</h2>
				<p className="text-light/60 text-sm text-center mb-6">
					Enter your email to receive a password reset link
				</p>

				<form onSubmit={handleSubmit} className="space-y-5">
					<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium text-light mb-1"
						>
							Email
						</label>
						<div className="relative">
							<Mail className="absolute left-3 top-3.5 h-4 w-4 text-light/40" />
							<input
								id="email"
								type="email"
								placeholder="Enter your email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full h-11 bg-neutral-800 text-light placeholder-light/35 border border-neutral-700 rounded-lg pl-10 pr-3 focus:outline-none focus:ring focus:ring-yellow-300"
								required
							/>
						</div>
					</div>

					<button
						type="submit"
						disabled={isLoading}
						className="w-full h-11 bg-yellow-600 hover:bg-yellow-500 transition font-medium text-base rounded-lg text-light shadow-md disabled:opacity-50"
					>
						{isLoading ? "Sending..." : "Send Reset Link"}
					</button>
				</form>

				<div className="text-center mt-6 text-sm text-neutral-400">
					Back to{" "}
					<Link
						to="/login"
						className="text-yellow-400 hover:text-yellow-300 font-medium"
					>
						Login
					</Link>
				</div>
			</div>
		</div>
	);
};

export default ForgotPassword;
