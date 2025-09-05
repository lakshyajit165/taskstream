import React from "react";
import { Snackbar, Alert } from "@mui/material";

const Toast = ({ open, onClose, severity = "info", message }) => {
	return (
		<Snackbar open={open} autoHideDuration={3000} onClose={onClose} anchorOrigin={{ vertical: "bottom", horizontal: "middle" }}>
			<Alert
				onClose={onClose}
				severity={severity}
				sx={{
					width: {
						xs: "100%", // full width on extra-small screens
						sm: "440px", // fixed width on small screens and above
					},
				}}
			>
				{message}
			</Alert>
		</Snackbar>
	);
};

export default Toast;
