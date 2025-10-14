import React from "react";
import { Snackbar, Alert } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";

const maxMessageLength = 50;
function SlideTransition(props) {
	return <Slide {...props} direction="up" />;
}

const Toast = ({ open, onClose, severity = "info", message }) => {
	const action = (
		<React.Fragment>
			<IconButton size="small" aria-label="close" color="inherit" onClick={onClose}>
				<CloseIcon fontSize="small" />
			</IconButton>
		</React.Fragment>
	);

	const truncate = (str) => {
		if (str.length > maxMessageLength) {
			// Subtract 3 from maxLength to account for the '...' ellipsis
			return str.slice(0, maxMessageLength - 3) + "...";
		}
		return str;
	};

	return (
		<Snackbar
			open={open}
			autoHideDuration={3000}
			onClose={onClose}
			anchorOrigin={{ vertical: "bottom", horizontal: "middle" }}
			message={truncate(message)}
			action={action}
			slots={{ transition: SlideTransition }}
			slotProps={{
				// Target the internal SnackbarContent root element
				content: {
					sx: {
						// Apply fixed width (or minWidth/maxWidth range)
						width: {
							xs: "100%", // Full width on small screens
							sm: "400px", // Fixed width on larger screens
						},
						// 1. Vertically center the message and action (x icon)
						display: "flex",
						alignItems: "center", // Centers children (message and action) vertically
					},
				},
			}}
		/>
	);
};

export default Toast;
