import React, { useState, useContext, useRef } from "react";
import { Box, IconButton, Button, TextField, Typography, Paper, Link, Divider, FormHelperText, Collapse } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { login } from "../../api/auth/auth";
import { ToastContext } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { validateLogin } from "../../api/utils/formValidation";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { AuthContext } from "../../context/AuthContext";

const ForgotPassword = () => {
	const { showToast } = useContext(ToastContext);
	const { setLoggedinState } = useContext(AuthContext);
	const navigate = useNavigate();

	const [step, setStep] = useState(1); // 1: email, 2: verification code
	const [loginPayload, setLoginPayload] = useState({
		email: "",
		password: "",
	});
	const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
	const inputRefs = useRef([]);
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const validate = (fieldValues = loginPayload) => {
		let validationErrors = validateLogin(fieldValues);
		setErrors(validationErrors);
		return validationErrors;
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		const newValues = { ...loginPayload, [name]: value };
		setLoginPayload(newValues);
		validate({ [name]: value });
	};

	const handleCodeChange = (index, value) => {
		// Only allow single digit
		if (value.length > 1) return;

		// Only allow numbers
		if (value && !/^\d$/.test(value)) return;

		const newCode = [...verificationCode];
		newCode[index] = value;
		setVerificationCode(newCode);

		// Auto-focus next input
		if (value && index < 5) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleKeyDown = (index, e) => {
		// Handle backspace
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

		// Focus the next empty input or last input
		const nextEmptyIndex = newCode.findIndex((val) => !val);
		if (nextEmptyIndex !== -1) {
			inputRefs.current[nextEmptyIndex]?.focus();
		} else {
			inputRefs.current[5]?.focus();
		}
	};

	const submitEmail = async (e) => {
		e.preventDefault();
		const validationErrors = validate({ email: loginPayload.email });

		if (Object.keys(validationErrors).length === 0) {
			setLoading(true);
			try {
				// Call your API to send verification code
				// await sendVerificationCode(loginPayload.email);
				showToast("Verification code sent to your email", "info");
				setStep(2);
				setLoading(false);
			} catch (error) {
				showToast(error.message || "Error sending verification code", "error");
				setLoading(false);
			}
		}
	};

	const submitVerificationCode = async (e) => {
		e.preventDefault();
		const code = verificationCode.join("");

		if (code.length !== 6) {
			showToast("Please enter complete 6-digit code", "error");
			return;
		}

		setLoading(true);
		try {
			// Call your API to verify code and reset password
			// await verifyCodeAndResetPassword(loginPayload.email, code);
			showToast("Code verified successfully", "success");
			setLoading(false);
			// Navigate to password reset or login
		} catch (error) {
			showToast(error.message || "Invalid verification code", "error");
			setLoading(false);
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

				{step === 1 ? (
					<>
						<Typography variant="body1" sx={{ mb: 1 }}>
							Enter email to get verification code
						</Typography>

						<form onSubmit={submitEmail} noValidate>
							<TextField fullWidth label="Email" name="email" margin="normal" type="email" value={loginPayload.email} onChange={handleInputChange} error={!!errors.email} />
							<Collapse in={!!errors.email} timeout={300}>
								<FormHelperText error>{errors.email}</FormHelperText>
							</Collapse>
							<Button disabled={loading} type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
								{loading ? "Sending..." : "Submit"}
							</Button>
						</form>
					</>
				) : (
					<>
						<Typography variant="body1" sx={{ mb: 1 }}>
							Enter verification code
						</Typography>

						<form onSubmit={submitVerificationCode}>
							<Box
								sx={{
									display: "flex",
									gap: { xs: 0.5, sm: 1 },
									mb: 3,
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
										inputProps={{
											maxLength: 1,
											style: {
												textAlign: "center",
												fontSize: "24px",
												fontWeight: "bold",
											},
										}}
										sx={{
											flex: 1,
											"& input": {
												padding: { xs: "12px 0", sm: "16px 0" },
											},
										}}
									/>
								))}
							</Box>

							<Button disabled={loading} type="submit" fullWidth variant="contained" sx={{ mb: 2 }}>
								{loading ? "Verifying..." : "Verify Code"}
							</Button>
						</form>
					</>
				)}
			</Paper>
		</Box>
	);
};

export default ForgotPassword;
