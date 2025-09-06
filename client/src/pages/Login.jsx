import React, { useState, useContext } from "react";
import { Box, Button, TextField, Typography, Paper, Link, Divider, FormHelperText, Collapse } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { login } from "../api/auth/auth";
import { ToastContext } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";

const Login = () => {
	const { showToast } = useContext(ToastContext);
	const navigate = useNavigate();

	const [loginPayload, setLoginPayload] = useState({
		email: "",
		password: "",
	});
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);

	const validate = (fieldValues = loginPayload) => {
		let validationErrors = { ...errors };

		if ("email" in fieldValues) {
			if (!fieldValues.email) {
				validationErrors.email = "Email is required";
			} else if (!/\S+@\S+\.\S+/.test(fieldValues.email)) {
				validationErrors.email = "Email is not valid";
			} else {
				delete validationErrors.email;
			}
		}

		if ("password" in fieldValues) {
			if (!fieldValues.password) {
				validationErrors.password = "Password is required";
			} else if (fieldValues.password.length < 6) {
				validationErrors.password = "Password must be at least 6 characters";
			} else {
				delete validationErrors.password;
			}
		}

		setErrors(validationErrors);
		return validationErrors;
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		const newValues = { ...loginPayload, [name]: value };
		setLoginPayload(newValues);
		validate({ [name]: value }); // validate live per field
	};

	const userLogin = async (e) => {
		e.preventDefault();
		const validationErrors = validate(loginPayload);

		if (Object.keys(validationErrors).length === 0) {
			setLoading(true);
			try {
				const data = await login(loginPayload);
				localStorage.setItem("token", data.data.token);
				showToast(data.message, "info");
				setLoading(false);
				navigate("/");
			} catch (error) {
				showToast(error.message || "Error logging in user", "error");
				setLoading(false);
			}
		}
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
				<Typography variant="h4" sx={{ pt: 2, my: 2 }}>
					TaskStream
				</Typography>
				<Divider sx={{ my: 2 }} />

				<Typography variant="h6" gutterBottom>
					Login
				</Typography>

				<form onSubmit={userLogin} noValidate>
					<TextField fullWidth label="Email" name="email" margin="normal" type="email" value={loginPayload.email} onChange={handleInputChange} error={!!errors.email} />
					<Collapse in={!!errors.email} timeout={300}>
						<FormHelperText error>{errors.email}</FormHelperText>
					</Collapse>
					<TextField fullWidth label="Password" name="password" margin="normal" type="password" value={loginPayload.password} onChange={handleInputChange} error={!!errors.password} />
					<Collapse in={!!errors.password} timeout={300}>
						<FormHelperText error>{errors.password}</FormHelperText>
					</Collapse>
					<Button loading={loading} loadingIndicator="Logging in..." type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
						Submit
					</Button>
				</form>
				<Typography variant="body2" sx={{ mt: 2 }}>
					Don't have an account?{" "}
					<Link component={RouterLink} to="/signup">
						Sign Up
					</Link>
				</Typography>
			</Paper>
		</Box>
	);
};

export default Login;
