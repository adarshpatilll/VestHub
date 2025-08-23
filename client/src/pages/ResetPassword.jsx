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
			// Important: Add your custom reset URL in Firebase console
			const actionCodeSettings = {
				url: `${import.meta.env.VITE_DOMAIN}/new-password`, // 👈 change to your domain
				handleCodeInApp: true,
			};

			await sendPasswordResetEmail(auth, email, actionCodeSettings);
			toast.success(
				"Password reset email sent! Check your inbox or Junk folder."
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
		<div className="min-h-screen flex items-center justify-center bg-neutral-950 p-4">
			<div className="max-w-md w-full bg-dark border border-neutral-700 rounded-2xl p-6 shadow-xl">
				<h2 className="text-xl font-bold text-light mb-4">
					Reset Password
				</h2>
				<form onSubmit={handleReset} className="space-y-4">
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="Enter your email"
						required
						className="w-full p-3 bg-neutral-800 text-light rounded-lg border border-neutral-700"
					/>
					<button
						type="submit"
						disabled={loading}
						className="w-full bg-yellow-600 hover:bg-yellow-500 transition p-3 rounded-lg text-light"
					>
						{loading ? "Sending..." : "Send Reset Link"}
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

export default ResetPassword;
