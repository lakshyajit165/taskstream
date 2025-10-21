import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";

const PublicRoute = () => {
	const { isAuthenticated } = useContext(AuthContext);
	// If the user IS authenticated, redirect them away from login/signup
	// Navigate to home
	if (isAuthenticated) {
		return <Navigate to="/" replace />;
	}
	// If the user is NOT authenticated, render the requested public route (Login/Signup)
	return <Outlet />;
};

export default PublicRoute;
