// AuthContext.js
import React, { useState, useEffect } from "react";
import { getAuthToken, setAuthToken, userLogout, registerUnauthorizedCallback } from "../api/utils/apiUtils";
import { AuthContext } from "../context/AuthContext";

export const AuthProvider = ({ children }) => {
	const [token, setToken] = useState(getAuthToken());

	useEffect(() => {
		const storedToken = getAuthToken();
		if (storedToken) {
			setToken(storedToken);
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
		}
	};

	const setLogoutState = () => {
		userLogout();
		setToken(null);
	};

	return <AuthContext.Provider value={{ isAuthenticated, token, setLoggedinState, setLogoutState }}>{children}</AuthContext.Provider>;
};
