import React, { useContext, useState } from "react";
import { Box, IconButton, Button, TextField, Typography, Paper, Link, Divider, FormHelperText, Collapse } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { ToastContext } from "../../context/ToastContext";
import { signup } from "../../api/auth/auth";
import { useNavigate } from "react-router-dom";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Stack from "@mui/material/Stack";
import ProductDescription from "../../components/ProductDescription";

const Signup = () => {
	const { showToast } = useContext(ToastContext);
	const navigate = useNavigate();
	const [signupPayload, setSignupPayload] = useState({
		name: "",
		email: "",
		password: "",
	});

	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const validate = (fieldValues = signupPayload) => {
		let validationErrors = { ...errors };

		if ("name" in fieldValues) {
			if (!fieldValues.name) {
				validationErrors.name = "Name is required";
			} else if (fieldValues.name.length < 2) {
				validationErrors.name = "Name must be at least 2 characters";
			} else {
				delete validationErrors.name;
			}
		}

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
		const newValues = { ...signupPayload, [name]: value };
		setSignupPayload(newValues);
		validate({ [name]: value }); // validate live per field
	};

	const userSignup = async (e) => {
		e.preventDefault();
		const validationErrors = validate(signupPayload);

		if (Object.keys(validationErrors).length === 0) {
			setLoading(true);
			try {
				const data = await signup(signupPayload);
				// route to login page here
				// show toast here
				showToast(data.message || "Signup successful", "info");
				setLoading(false);
				navigate("/login");
			} catch (error) {
				setLoading(false);
				showToast(error.message || "Error signing up user", "error");
			}
		}
	};

	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				minHeight: "85vh",
				bgcolor: "background.default",
				px: 1,
			}}
		>
			<Stack
				direction={{ xs: "column-reverse", md: "row" }}
				sx={{
					justifyContent: "center",
					gap: { xs: 6, sm: 12 },
					p: 2,
					mx: "auto",
				}}
			>
				<ProductDescription />
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
					<Typography variant="h4" sx={{ pt: 2, my: 2, fontWeight: "bold" }}>
						taskstream_
					</Typography>

					<form onSubmit={userSignup} noValidate>
						<TextField fullWidth label="Name" name="name" margin="normal" value={signupPayload.name} onChange={handleInputChange} error={!!errors.name} />
						<Collapse in={!!errors.name} timeout={300}>
							<FormHelperText error>{errors.name}</FormHelperText>
						</Collapse>
						<TextField fullWidth label="Email" name="email" margin="normal" type="email" value={signupPayload.email} onChange={handleInputChange} error={!!errors.email} />
						<Collapse in={!!errors.email} timeout={300}>
							<FormHelperText error>{errors.email}</FormHelperText>
						</Collapse>
						<TextField
							fullWidth
							label="Password"
							name="password"
							margin="normal"
							type={showPassword ? "text" : "password"}
							slotProps={{
								input: {
									endAdornment: (
										<InputAdornment position="end">
											<IconButton aria-label={showPassword ? "hide the password" : "display the password"} onClick={() => setShowPassword(!showPassword)} edge="end">
												{showPassword ? <Visibility /> : <VisibilityOff />}
											</IconButton>
										</InputAdornment>
									),
								},
							}}
							value={signupPayload.password}
							onChange={handleInputChange}
							error={!!errors.password}
						/>
						<Collapse in={!!errors.password} timeout={300}>
							<FormHelperText error>{errors.password}</FormHelperText>
						</Collapse>
						<Button loading={loading} loadingIndicator="Signing up..." type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
							SignUp
						</Button>
					</form>

					<Typography variant="body2" sx={{ mt: 2 }}>
						Already have an account?{" "}
						<Link component={RouterLink} to="/login">
							Login
						</Link>
					</Typography>
				</Paper>
			</Stack>
		</Box>
	);
};

export default Signup;
