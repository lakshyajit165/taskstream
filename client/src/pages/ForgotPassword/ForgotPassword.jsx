import React, { useState, useContext, useRef } from "react";
import { Box, IconButton, Button, TextField, Typography, Paper, Link, Divider, FormHelperText, Collapse } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { initiateForgotPassword, resetPassword } from "../../api/auth/auth";
import { ToastContext } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { validateInitiateForgotPasswordPayload, validateResetPasswordPayload } from "../../api/utils/formValidation";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { EMAIL_VERIFICATION_STEP, RESET_PASSWORD_STEP } from "../../api/utils/constants";

const ForgotPassword = () => {
	const { showToast } = useContext(ToastContext);
	const navigate = useNavigate();

	const [step, setStep] = useState(RESET_PASSWORD_STEP);
	const [initiateForgotPasswordPayload, setInitiateForgotPasswordPayload] = useState({
		email: "",
	});
	const [resetPasswordPayload, setResetPasswordPayload] = useState({
		email: "",
		verificationCode: "",
		password: "",
	});
	const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
	const inputRefs = useRef([]);
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const validateEmail = (fieldValues = initiateForgotPasswordPayload) => {
		let validationErrors = validateInitiateForgotPasswordPayload(fieldValues, errors);
		setErrors(validationErrors);
		return validationErrors;
	};

	const validateReset = (fieldValues = resetPasswordPayload) => {
		let validationErrors = validateResetPasswordPayload(fieldValues, errors);
		setErrors(validationErrors);
		return validationErrors;
	};

	const handleEmailChange = (e) => {
		const { name, value } = e.target;
		const newValues = { ...initiateForgotPasswordPayload, [name]: value };
		setInitiateForgotPasswordPayload(newValues);
		setResetPasswordPayload({ ...resetPasswordPayload, email: value });
		validateEmail({ [name]: value });
	};

	const handlePasswordChange = (e) => {
		const { name, value } = e.target;
		const newValues = { ...resetPasswordPayload, [name]: value };
		setResetPasswordPayload(newValues);
		validateReset({ [name]: value });
	};

	const handleCodeChange = (index, value) => {
		if (value.length > 1) return;
		if (value && !/^\d$/.test(value)) return;

		const newCode = [...verificationCode];
		newCode[index] = value;
		setVerificationCode(newCode);

		// Update resetPasswordPayload with the code
		const codeString = newCode.join("");
		setResetPasswordPayload({ ...resetPasswordPayload, verificationCode: codeString });
		validateReset({ verificationCode: codeString });

		if (value && index < 5) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleKeyDown = (index, e) => {
		if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handlePaste = (e) => {
		e.preventDefault();
		const pastedData = e.clipboardData.getData("text").slice(0, 6);

		if (!/^\d+$/.test(pastedData)) return;

		const newCode = [...verificationCode];
		for (let i = 0; i < pastedData.length && i < 6; i++) {
			newCode[i] = pastedData[i];
		}
		setVerificationCode(newCode);

		// Update resetPasswordPayload with the code
		const codeString = newCode.join("");
		setResetPasswordPayload({ ...resetPasswordPayload, verificationCode: codeString });

		const nextEmptyIndex = newCode.findIndex((val) => !val);
		if (nextEmptyIndex !== -1) {
			inputRefs.current[nextEmptyIndex]?.focus();
		} else {
			inputRefs.current[5]?.focus();
		}
	};

	const submitEmail = async (e) => {
		e.preventDefault();
		const validationErrors = validateEmail(initiateForgotPasswordPayload);

		if (Object.keys(validationErrors).length === 0) {
			setLoading(true);
			try {
				const response = await initiateForgotPassword(initiateForgotPasswordPayload);
				showToast(response.message || "Verification code sent to your email", "info");
				setStep(RESET_PASSWORD_STEP);
				setLoading(false);
			} catch (error) {
				showToast(error.message || "Error sending verification code", "error");
				setLoading(false);
			}
		}
	};

	const submitResetPassword = async (e) => {
		e.preventDefault();
		const validationErrors = validateReset(resetPasswordPayload);

		if (Object.keys(validationErrors).length === 0) {
			setLoading(true);
			try {
				const response = await resetPassword(resetPasswordPayload);
				showToast(response.message || "Password reset successfully", "success");
				setLoading(false);
				navigate("/login");
			} catch (error) {
				showToast(error.message || "Error resetting password", "error");
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
				minHeight: "85vh",
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
				<Typography variant="h4" sx={{ pt: 2, my: 2, fontWeight: "bold" }}>
					taskstream_
				</Typography>

				{step === EMAIL_VERIFICATION_STEP ? (
					<>
						<Typography variant="body1" sx={{ mb: 1 }}>
							Enter email to get verification code
						</Typography>

						<form onSubmit={submitEmail} noValidate>
							<TextField
								fullWidth
								label="Email"
								name="email"
								margin="normal"
								type="email"
								value={initiateForgotPasswordPayload.email}
								onChange={handleEmailChange}
								error={!!errors.email}
							/>
							<Collapse in={!!errors.email} timeout={300}>
								<FormHelperText error>{errors.email}</FormHelperText>
							</Collapse>
							<Button disabled={loading} type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
								{loading ? "Sending..." : "Send Verification Code"}
							</Button>
						</form>
					</>
				) : step === RESET_PASSWORD_STEP ? (
					<>
						<Typography variant="body1" sx={{ mb: 1 }}>
							Enter verification code and new password (Valid for 5 minutes).
						</Typography>

						<form onSubmit={submitResetPassword} noValidate>
							<Typography variant="body2" sx={{ mb: 1, mt: 2, color: "text.secondary" }}>
								Verification Code
							</Typography>
							<Box
								sx={{
									display: "flex",
									gap: { xs: 0.5, sm: 1 },
									mb: 1,
								}}
							>
								{verificationCode.map((digit, index) => (
									<TextField
										key={index}
										inputRef={(el) => (inputRefs.current[index] = el)}
										value={digit}
										onChange={(e) => handleCodeChange(index, e.target.value)}
										onKeyDown={(e) => handleKeyDown(index, e)}
										onPaste={handlePaste}
										error={!!errors.verificationCode}
										slotProps={{
											input: {
												inputProps: {
													maxLength: 1,
												},
											},
										}}
										sx={{
											flex: 1,
											"& input": {
												textAlign: "center",
												fontSize: "24px",
												fontWeight: "bold",
												padding: { xs: "12px 0", sm: "16px 0" },
											},
										}}
									/>
								))}
							</Box>
							<Collapse in={!!errors.verificationCode} timeout={300}>
								<FormHelperText error>{errors.verificationCode}</FormHelperText>
							</Collapse>

							<TextField
								fullWidth
								label="New Password"
								name="password"
								margin="normal"
								type={showPassword ? "text" : "password"}
								value={resetPasswordPayload.password}
								onChange={handlePasswordChange}
								error={!!errors.password}
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
							/>
							<Collapse in={!!errors.password} timeout={300}>
								<FormHelperText error>{errors.password}</FormHelperText>
							</Collapse>

							<Button disabled={loading} type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
								{loading ? "Resetting..." : "Reset Password"}
							</Button>
						</form>
					</>
				) : (
					<>
						<Typography variant="h6" sx={{ mb: 1 }}>
							Unknown stage in password reset flow. Try logging in again!
						</Typography>
						<Link component={RouterLink} to="/login" variant="body1">
							Back to Login
						</Link>
					</>
				)}

				<Typography variant="body2" sx={{ mt: 2 }}>
					Remember your password?{" "}
					<Link component={RouterLink} to="/login">
						Login
					</Link>
				</Typography>
			</Paper>
		</Box>
	);
};

export default ForgotPassword;
