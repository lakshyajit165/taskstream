import React, { useContext, useEffect, useState } from "react";

import { Box, IconButton, Button, TextField, Typography, Paper, Link, Divider, FormHelperText, Collapse } from "@mui/material";

import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";

import { ToastContext } from "../../context/ToastContext";

import { getOAuthProvider, signup } from "../../api/auth/auth";

import InputAdornment from "@mui/material/InputAdornment";

import Visibility from "@mui/icons-material/Visibility";

import VisibilityOff from "@mui/icons-material/VisibilityOff";

import Stack from "@mui/material/Stack";

import ProductDescription from "../../components/ProductDescription";

import GitHubIcon from "@mui/icons-material/GitHub";

import { FaGitlab } from "react-icons/fa";
import { validateSignup } from "../../api/utils/formValidation";

const Signup = () => {
	const { showToast } = useContext(ToastContext);

	const navigate = useNavigate();

	const [searchParams, setSearchParams] = useSearchParams();

	const [signupPayload, setSignupPayload] = useState({
		name: "",
		email: "",
		password: "",
	});

	const [errors, setErrors] = useState({});

	const [loading, setLoading] = useState(false);

	const [showPassword, setShowPassword] = useState(false);

	const [oAuthProviderLoading, setOAuthProviderLoading] = useState(false);

	const [oAuthProvider, setOAuthProvider] = useState(false);

	const validate = (fieldValues = signupPayload) => {
		let validationErrors = validateSignup(fieldValues);
		setErrors(validationErrors);
		return validationErrors;
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;

		const newValues = {
			...signupPayload,
			[name]: value,
		};

		setSignupPayload(newValues);

		validate({ [name]: value });
	};

	const userSignup = async (e) => {
		e.preventDefault();

		const validationErrors = validate(signupPayload);

		if (Object.keys(validationErrors).length !== 0) {
			return;
		}

		setLoading(true);

		try {
			const data = await signup(signupPayload);

			showToast(data.message || "Signup successful", "success");
			navigate("/login");
		} catch (error) {
			showToast(error.message || "Error signing up user", "error");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const oauthError = searchParams.get("oauthError");

		if (oauthError) {
			showToast(oauthError, "error");

			searchParams.delete("oauthError");

			setSearchParams(searchParams, { replace: true });
		}
	}, [searchParams, setSearchParams, showToast]);

	useEffect(() => {
		const fetchOAuthProvider = async () => {
			setOAuthProviderLoading(true);

			try {
				const response = await getOAuthProvider();

				setOAuthProvider(response.data);
			} catch (error) {
				showToast(error.message || "Error fetching OAuth provider", "error");
			} finally {
				setOAuthProviderLoading(false);
			}
		};

		fetchOAuthProvider();
	}, [showToast]);

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
					<Typography
						variant="h4"
						sx={{
							pt: 2,
							my: 2,
							fontWeight: "bold",
						}}
					>
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
							Sign Up
						</Button>

						{!oAuthProviderLoading && (oAuthProvider === "GITHUB" || oAuthProvider === "GITLAB") && (
							<>
								<Divider sx={{ my: 2 }}>OR</Divider>

								{oAuthProvider === "GITHUB" && (
									<Button
										fullWidth
										variant="outlined"
										startIcon={<GitHubIcon />}
										onClick={() => {
											window.location.href = "http://localhost:8000/api/v1/auth/oauth2/github?mode=SIGNUP";
										}}
										sx={{
											color: "text.primary",
											borderColor: "divider",
											textTransform: "none",
											"&:hover": {
												borderColor: "text.primary",
												backgroundColor: "action.hover",
											},
										}}
									>
										Sign Up with GitHub
									</Button>
								)}

								{oAuthProvider === "GITLAB" && (
									<Button
										fullWidth
										variant="outlined"
										startIcon={<FaGitlab color="orange" />}
										onClick={() => {
											window.location.href = "http://localhost:8000/api/v1/auth/oauth2/gitlab?mode=SIGNUP";
										}}
										sx={{
											color: "text.primary",
											borderColor: "divider",
											textTransform: "none",
											"&:hover": {
												borderColor: "text.primary",
												backgroundColor: "action.hover",
											},
										}}
									>
										Sign Up with GitLab
									</Button>
								)}
							</>
						)}
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
