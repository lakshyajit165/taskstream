import { useState } from "react";
import Toast from "./Toast"; // your existing Snackbar/Alert component
import { ToastContext } from "../context/ToastContext";

/**
 * Wrap your app with this provider to enable global toasts
 */
export const ToastProvider = ({ children }) => {
	const [toast, setToast] = useState({
		open: false,
		message: "",
		severity: "info",
	});

	const showToast = (message, severity = "info") => {
		setToast({ open: true, message, severity });
	};

	const closeToast = () => {
		setToast((prev) => ({ ...prev, open: false }));
	};

	return (
		<ToastContext.Provider value={{ showToast }}>
			{children}
			<Toast open={toast.open} onClose={closeToast} message={toast.message} severity={toast.severity} />
		</ToastContext.Provider>
	);
};
