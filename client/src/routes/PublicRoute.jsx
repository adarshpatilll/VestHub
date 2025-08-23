import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

const PublicRoute = () => {
	const { user, loading } = useAuthContext();

	if (loading)
		return (
			<div className="flex justify-center items-center h-screen w-full bg-dark gap-2">
				<div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
				<span className="text-light">Loading...</span>
			</div>
		);

	// ✅ If logged in, don't allow login/register page → redirect home
	if (user) {
		return <Navigate to="/" replace />;
	}

	return <Outlet />;
};

export default PublicRoute;
