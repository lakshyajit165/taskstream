import React from "react";
import { Box, Typography } from "@mui/material";
import notFoundPage from "../../assets/page_not_found.png";

const NotFound = () => {
	return (
		<Box sx={{ my: 4, textAlign: "center" }}>
			<img src={notFoundPage} alt="No projects illustration" style={{ maxWidth: "300px", marginBottom: "16px" }} />
			<Typography variant="body1" color="text.secondary">
				The page you're looking for could not be found
			</Typography>
		</Box>
	);
};

export default NotFound;
