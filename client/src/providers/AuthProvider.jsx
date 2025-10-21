// AuthContext.js
import React, { useState, useEffect } from "react";
import { getAuthToken, setAuthToken, userLogout } from "../api/utils/apiUtils";
import { AuthContext } from "../context/AuthContext";

export const AuthProvider = ({ children }) => {
	const [token, setToken] = useState(getAuthToken());

	useEffect(() => {
		const storedToken = getAuthToken();
		if (storedToken) {
			setToken(storedToken);
		}
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
