import React, { useState, useContext, useEffect } from "react";
import { Box, IconButton, Button, TextField, Typography, Paper, Link, Divider, FormHelperText, Collapse } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { getOAuthProvider, login } from "../../api/auth/auth";
import { ToastContext } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { validateLogin } from "../../api/utils/formValidation";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { AuthContext } from "../../context/AuthContext";
import Stack from "@mui/material/Stack";
import ProductDescription from "../../components/ProductDescription";
import { FaGitlab } from "react-icons/fa";
import GitHubIcon from "@mui/icons-material/GitHub";

const Login = () => {
	const { showToast } = useContext(ToastContext);
	const { setLoggedinState } = useContext(AuthContext);
	const navigate = useNavigate();

	const [loginPayload, setLoginPayload] = useState({
		email: "",
		password: "",
	});
	const [errors, setErrors] = useState({});
	const [loginLoading, setLoginLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [oAuthProviderLoading, setOAuthProviderLoading] = useState(false);
	const [oAuthProvider, setOAuthProvider] = useState(false);

	const validate = (fieldValues = loginPayload) => {
		let validationErrors = validateLogin(fieldValues);
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
			setLoginLoading(true);
			try {
				const loginResponse = await login(loginPayload);
				setLoggedinState(loginResponse.data.token);
				showToast(loginResponse.message, "success");
				setLoginLoading(false);
				navigate("/");
			} catch (error) {
				showToast(error.message || "Error logging in user", "error");
				setLoginLoading(false);
			}
		}
	};

	useEffect(() => {
		const fetchOAuthProvider = async () => {
			setOAuthProviderLoading(true);
			try {
				const response = await getOAuthProvider();
				setOAuthProvider(response.data);
			} catch (error) {
				showToast(error.message || "Error fetching OAuth provider");
			} finally {
				setOAuthProviderLoading(false);
			}
		};

		fetchOAuthProvider();
	}, []);

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

					<form onSubmit={userLogin} noValidate>
						<TextField fullWidth label="Email" name="email" margin="normal" type="email" value={loginPayload.email} onChange={handleInputChange} error={!!errors.email} />
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
							value={loginPayload.password}
							onChange={handleInputChange}
							error={!!errors.password}
						/>
						<Collapse in={!!errors.password} timeout={300}>
							<FormHelperText error>{errors.password}</FormHelperText>
						</Collapse>

						<Box sx={{ display: "flex", justifyContent: "flex-start", mt: 1 }}>
							<Link component={RouterLink} to="/forgot_password" variant="body2">
								Forgot Password
							</Link>
						</Box>

						<Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }}>
							<Button loading={loginLoading} loadingIndicator="Logging in..." type="submit" fullWidth variant="contained">
								Login
							</Button>

							{oAuthProvider === "GITHUB" && (
								<Button
									fullWidth
									variant="contained"
									disableElevation
									startIcon={<GitHubIcon />}
									onClick={() => {
										window.location.href = "http://localhost:8000/api/v1/auth/oauth2/github";
									}}
									sx={{
										backgroundColor: "white",
										color: "black",
										"&:hover": {
											backgroundColor: "#f5f5f5",
										},
									}}
								>
									Login with GitHub
								</Button>
							)}

							{oAuthProvider === "GITLAB" && (
								<Button
									fullWidth
									variant="contained"
									startIcon={<FaGitlab color="orange" />}
									onClick={() => {
										window.location.href = "http://localhost:8000/api/v1/auth/oauth2/gitlab";
									}}
									sx={{
										backgroundColor: "white",
										color: "black",
										boxShadow: 3,
										"&:hover": {
											backgroundColor: "#f5f5f5",
											boxShadow: 5,
										},
									}}
								>
									Login with GitLab
								</Button>
							)}
						</Stack>
					</form>
					<Typography variant="body2" sx={{ mt: 2 }}>
						Don't have an account?{" "}
						<Link component={RouterLink} to="/signup">
							Sign Up
						</Link>
					</Typography>
				</Paper>
			</Stack>
		</Box>
	);
};

export default Login;
