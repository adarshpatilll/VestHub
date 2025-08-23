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
		<div className="min-h-screen flex items-center justify-center bg-neutral-950 p-4">
			<div className="max-w-md w-full bg-dark border border-neutral-700 rounded-2xl p-6 shadow-xl">
				<h2 className="text-xl font-bold text-light mb-4">
					Set New Password
				</h2>
				{email && (
					<p className="text-light/70 mb-4">
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
						className="w-full p-3 bg-neutral-800 text-light rounded-lg border border-neutral-700"
					/>
					<input
						type="password"
						placeholder="Confirm new password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						required
						className="w-full p-3 bg-neutral-800 text-light rounded-lg border border-neutral-700"
					/>
					<button
						type="submit"
						disabled={loading}
						className="w-full bg-yellow-600 hover:bg-yellow-500 transition p-3 rounded-lg text-light"
					>
						{loading ? "Updating..." : "Update Password"}
					</button>
				</form>
			</div>
		</div>
	);
};

export default NewPassword;
