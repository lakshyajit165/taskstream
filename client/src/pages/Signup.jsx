import React from "react";
import { Box, Button, TextField, Typography, Paper, Link, Divider } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const Signup = () => {
	const handleSubmit = (e) => {
		e.preventDefault();
		// TODO: add signup logic here
	};

	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				minHeight: "100vh",
				bgcolor: "background.default",
				px: 1,
			}}
		>
			<Paper
				elevation={0}
				sx={{
					px: { xs: 2, sm: 4 },
					pb: 4,
					pt: 0,
					width: "100%",
					maxWidth: { xs: "100%", sm: 500 },
				}}
			>
				<Typography variant="h4" sx={{ pt: 2 }}>
					TaskStream
				</Typography>
				<Divider sx={{ my: 2 }} />

				<Typography variant="h6" gutterBottom>
					Sign Up
				</Typography>

				<form onSubmit={handleSubmit}>
					<TextField fullWidth label="Name" margin="normal" />
					<TextField fullWidth label="Email" margin="normal" type="email" />
					<TextField fullWidth label="Password" margin="normal" type="password" />
					<Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
						Sign Up
					</Button>
				</form>

				<Typography variant="body2" sx={{ mt: 2 }}>
					Already have an account?{" "}
					<Link component={RouterLink} to="/login">
						Login
					</Link>
				</Typography>
			</Paper>
		</Box>
	);
};

export default Signup;
