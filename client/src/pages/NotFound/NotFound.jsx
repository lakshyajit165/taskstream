import React from "react";
import { Box, Typography } from "@mui/material";
import notFoundPage from "../../assets/page_not_found.png";

const NotFound = () => {
	return (
		<Box
			sx={{
				// 1. Enable Flexbox for alignment
				display: "flex",
				// 2. Set direction to column so items stack vertically
				flexDirection: "column",
				// 3. Vertically center the content
				justifyContent: "center",
				// 4. Horizontally center the content (for the Typography and image)
				alignItems: "center",
				// 5. Ensure the box takes up the full viewport height minus any header/footer
				//    (or 100% of its parent container, e.g., the DrawerMenu content area)
				minHeight: "80vh", // Adjust this value (e.g., 100vh, 80vh) based on your layout needs

				// Remove the redundant my: 4 style as centering handles the placement
			}}
		>
			<img
				src={notFoundPage}
				alt="Page not found illustration" // Improved alt text
				style={{
					maxWidth: "300px",
					marginBottom: "16px",
				}}
			/>
			<Typography variant="body1" color="text.secondary" sx={{ textAlign: "center" }}>
				The page you're looking for could not be found
			</Typography>
		</Box>
	);
};

export default NotFound;
