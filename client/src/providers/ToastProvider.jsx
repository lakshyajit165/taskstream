import { useCallback, useState } from "react";

import Toast from "../components/Toast";

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

	/*
	 * Keep the showToast function reference stable between renders.
	 *
	 * Without useCallback, toast state updates create a new function reference,
	 * causing effects that depend on showToast to run again unnecessarily.
	 */
	const showToast = useCallback((message, severity = "info") => {
		setToast({ open: true, message, severity });
	}, []);

	const closeToast = useCallback(() => {
		setToast((prev) => ({ ...prev, open: false }));
	}, []);

	return (
		<ToastContext.Provider value={{ showToast }}>
			{children}

			<Toast open={toast.open} onClose={closeToast} message={toast.message} severity={toast.severity} />
		</ToastContext.Provider>
	);
};
