import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase.config";
import {
	loginWithGoogle,
	registerUser,
	loginUser,
	logoutUser,
	resetPassword,
	getUserDetails,
} from "../firebase/data";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
   
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			setUser(currentUser);
			setLoading(false);
		});

		return () => unsubscribe();
	}, []);

	return (
		<AuthContext.Provider
			value={{
				user,
				loading,
				loginWithGoogle,
				registerUser,
				loginUser,
				logoutUser,
				resetPassword,
				getUserDetails,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

// Custom hook for easy access
export const useAuthContext = () => useContext(AuthContext);
