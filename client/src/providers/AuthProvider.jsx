// AuthContext.js
import React, { useState, useEffect } from "react";
import { getAuthToken, setAuthToken, userLogout, registerUnauthorizedCallback } from "../api/utils/apiUtils";
import { AuthContext } from "../context/AuthContext";
import { getUserFromToken } from "../api/utils/apiUtils";

export const AuthProvider = ({ children }) => {
	const [token, setToken] = useState(getAuthToken());
	const [user, setUser] = useState(() => getUserFromToken(getAuthToken()));

	useEffect(() => {
		const storedToken = getAuthToken();
		if (storedToken) {
			setToken(storedToken);
			setUser(getUserFromToken(storedToken));
		}
		// Register the function that updates the React state
		registerUnauthorizedCallback(setLogoutState);

		// OPTIONAL: Cleanup function to unregister when the component unmounts (best practice)
		return () => {
			registerUnauthorizedCallback(() => {});
		};
	}, []);

	const isAuthenticated = !!token;

	const setLoggedinState = (newToken) => {
		if (newToken) {
			setAuthToken(newToken);
			setToken(newToken);
			setUser(getUserFromToken(newToken));
		}
	};

	const setLogoutState = () => {
		userLogout();
		setToken(null);
		setUser(null);
	};

	return (
		<AuthContext.Provider
			value={{
				isAuthenticated,
				token,
				user,
				setLoggedinState,
				setLogoutState,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
