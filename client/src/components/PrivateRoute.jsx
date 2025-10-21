import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // Adjust path as necessary

const PrivateRoute = () => {
	// 1. Access the context using useContext and your AuthContext object
	const { isAuthenticated } = useContext(AuthContext);

	// 2. Conditional Rendering
	// If authenticated, render the child route via <Outlet />.
	// Otherwise, redirect the user to the login page using <Navigate />.
	return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
