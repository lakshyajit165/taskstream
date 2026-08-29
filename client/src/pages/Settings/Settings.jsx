import React, { useContext, useState, useEffect } from "react";

import {
	Container,
	Box,
	Typography,
	Stack,
	Divider,
	Switch,
	FormControlLabel,
	TextField,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	ToggleButton,
	ToggleButtonGroup,
	FormHelperText,
	Collapse,
} from "@mui/material";

import GitHubIcon from "@mui/icons-material/GitHub";
import { FaGitlab } from "react-icons/fa";

import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";

import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";

import { CustomThemeContext } from "../../context/CustomThemeContext";
import { isCurrentUserAdminFromLocal } from "../../api/utils/apiUtils";
import { isCurrentUserAdminFromApi } from "../../api/user/users";

import { ToastContext } from "../../context/ToastContext";
import { saveOAuthCreds } from "../../api/auth/auth";
import { validateOAuthSetupPayload } from "../../api/utils/formValidation";

const OAUTH_PROVIDERS = {
	GITHUB: {
		label: "GitHub",
		defaultServer: "https://github.com",
		serverLabel: "GitHub Server URL",
		serverPlaceholder: "https://github.com",
		serverHelper: "Use https://github.com or your GitHub Enterprise Server URL",
	},
	GITLAB: {
		label: "GitLab",
		defaultServer: "https://gitlab.com",
		serverLabel: "GitLab Server URL",
		serverPlaceholder: "https://gitlab.com",
		serverHelper: "Use https://gitlab.com or your self-hosted GitLab URL",
	},
};

const Settings = () => {
	const { showToast } = useContext(ToastContext);
	const { mode, toggleTheme } = useContext(CustomThemeContext);

	const [oauthEnabled, setOauthEnabled] = useState(false);
	const [oauthProvider, setOauthProvider] = useState("GITHUB");
	const [oauthServer, setOauthServer] = useState(OAUTH_PROVIDERS.GITHUB.defaultServer);
	const [oauthClientId, setOauthClientId] = useState("");
	const [oauthClientSecret, setOauthClientSecret] = useState("");

	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);

	const [openDisableDialog, setOpenDisableDialog] = useState(false);
	const [isAdmin, setIsAdmin] = useState(false);

	useEffect(() => {
		const checkAdminStatus = async () => {
			const isAdminAccordingToJwt = isCurrentUserAdminFromLocal();

			if (!isAdminAccordingToJwt) {
				setIsAdmin(false);
				return;
			}

			try {
				const response = await isCurrentUserAdminFromApi();
				const isAdminAccordingToApi = response.data === true;

				setIsAdmin(isAdminAccordingToApi);
			} catch (err) {
				showToast(err.message || "Failed to fetch admin details", "error");
				setIsAdmin(false);
			}
		};

		checkAdminStatus();
	}, []);

	const handleChange = (event) => {
		toggleTheme(event.target.value);
	};

	const validate = (fieldValues) => {
		const validationErrors = validateOAuthSetupPayload(fieldValues, errors);

		setErrors(validationErrors);

		return validationErrors;
	};

	const handleOAuthFieldChange = (field, value) => {
		const updatedValues = {
			[field]: value,
		};

		switch (field) {
			case "serverUrl":
				setOauthServer(value);
				break;

			case "clientId":
				setOauthClientId(value);
				break;

			case "clientSecret":
				setOauthClientSecret(value);
				break;

			default:
				break;
		}

		validate(updatedValues);
	};

	const handleSaveOAuth = async () => {
		const oauthSetupData = {
			oauthProvider,
			serverUrl: oauthServer,
			clientId: oauthClientId,
			clientSecret: oauthClientSecret,
		};

		const validationErrors = validateOAuthSetupPayload(oauthSetupData);

		setErrors(validationErrors);

		if (Object.keys(validationErrors).length !== 0) {
			return;
		}

		setLoading(true);

		try {
			const response = await saveOAuthCreds(oauthSetupData);
			showToast(response.message || "OAuth configuration saved successfully", "success");
		} catch (err) {
			showToast(err.message || "Failed to save OAuth configuration", "error");
		} finally {
			setLoading(false);
		}
	};

	const handleOAuthToggle = (event) => {
		const enabled = event.target.checked;

		if (!enabled && oauthEnabled) {
			setOpenDisableDialog(true);
			return;
		}

		setOauthEnabled(true);
	};

	const handleProviderChange = (_, provider) => {
		if (!provider) {
			return;
		}

		const previousProvider = oauthProvider;

		setOauthProvider(provider);

		if (oauthServer === OAUTH_PROVIDERS[previousProvider].defaultServer) {
			setOauthServer(OAUTH_PROVIDERS[provider].defaultServer);
		}
	};

	const handleConfirmDisableOAuth = () => {
		console.log("Disable OAuth API call");

		setOauthEnabled(false);
		setOpenDisableDialog(false);

		// Reset OAuth configuration.
		setOauthProvider("GITHUB");
		setOauthServer(OAUTH_PROVIDERS.GITHUB.defaultServer);
		setOauthClientId("");
		setOauthClientSecret("");
		setErrors({});
	};

	const handleCancelDisableOAuth = () => {
		setOpenDisableDialog(false);
	};

	const selectedProvider = OAUTH_PROVIDERS[oauthProvider];

	const LightLabel = (
		<Stack direction="row" spacing={1} alignItems="center">
			<WbSunnyOutlinedIcon fontSize="small" />
			<Typography>Light</Typography>
		</Stack>
	);

	const DarkLabel = (
		<Stack direction="row" spacing={1} alignItems="center">
			<DarkModeOutlinedIcon fontSize="small" />
			<Typography>Dark</Typography>
		</Stack>
	);

	return (
		<Container sx={{ maxWidth: { xs: 400, sm: 600 } }}>
			{/* Theme Settings */}
			<Box sx={{ my: 2 }}>
				<Typography variant="h6" component="h2" gutterBottom>
					Theme
				</Typography>

				<Divider sx={{ my: 1 }} />

				<RadioGroup aria-labelledby="theme-settings" name="theme-settings" value={mode} onChange={handleChange}>
					<FormControlLabel value="light" control={<Radio />} label={LightLabel} />

					<FormControlLabel value="dark" control={<Radio />} label={DarkLabel} />
				</RadioGroup>
			</Box>

			{/* Authentication & Authorization Settings */}
			{isAdmin && (
				<Box sx={{ my: 4 }}>
					<Typography variant="h6" component="h2" gutterBottom>
						Authentication & Authorization
					</Typography>

					<Divider sx={{ my: 1 }} />

					<FormControlLabel control={<Switch checked={oauthEnabled} onChange={handleOAuthToggle} />} label="Enable OAuth" />

					{oauthEnabled && (
						<Stack spacing={3} sx={{ mt: 3 }}>
							{/* OAuth Provider */}
							<Box>
								<Typography variant="subtitle2" sx={{ mb: 1 }}>
									OAuth Provider
								</Typography>

								<ToggleButtonGroup value={oauthProvider} exclusive onChange={handleProviderChange} fullWidth aria-label="OAuth provider">
									<ToggleButton value="GITHUB" aria-label="GitHub">
										<GitHubIcon sx={{ mr: 1 }} />
										GitHub
									</ToggleButton>

									<ToggleButton value="GITLAB" aria-label="GitLab">
										<FaGitlab size={22} style={{ marginRight: 8 }} />
										GitLab
									</ToggleButton>
								</ToggleButtonGroup>
							</Box>

							{/* Server URL */}
							<Box>
								<TextField
									label={selectedProvider.serverLabel}
									value={oauthServer}
									onChange={(event) => handleOAuthFieldChange("serverUrl", event.target.value)}
									error={!!errors.serverUrl}
									helperText={errors.serverUrl || selectedProvider.serverHelper}
									fullWidth
								/>
							</Box>

							{/* Client ID */}
							<Box>
								<TextField
									label="Client ID"
									value={oauthClientId}
									onChange={(event) => handleOAuthFieldChange("clientId", event.target.value)}
									error={!!errors.clientId}
									helperText={errors.clientId || `The OAuth App Client ID configured in your ${selectedProvider.label} server`}
									fullWidth
								/>

								<Collapse in={!!errors.oauthClientId} timeout={300}>
									<FormHelperText error>{errors.oauthClientId}</FormHelperText>
								</Collapse>
							</Box>

							{/* Client Secret */}
							<Box>
								<TextField
									label="Client Secret"
									type="password"
									value={oauthClientSecret}
									onChange={(event) => handleOAuthFieldChange("clientSecret", event.target.value)}
									error={!!errors.clientSecret}
									helperText={errors.clientSecret || "The OAuth Client Secret. This value will be stored securely."}
									fullWidth
								/>

								<Collapse in={!!errors.oauthClientSecret} timeout={300}>
									<FormHelperText error>{errors.oauthClientSecret}</FormHelperText>
								</Collapse>
							</Box>

							{/* Save */}
							<Box>
								<Button variant="contained" loading={loading} loadingIndicator="Saving..." onClick={handleSaveOAuth}>
									Save
								</Button>
							</Box>
						</Stack>
					)}
				</Box>
			)}

			{/* Disable OAuth Confirmation Dialog */}
			<Dialog open={openDisableDialog} onClose={handleCancelDisableOAuth} aria-labelledby="disable-oauth-dialog-title" aria-describedby="disable-oauth-dialog-description">
				<DialogTitle id="disable-oauth-dialog-title">Disable OAuth Sign-in?</DialogTitle>

				<DialogContent>
					<DialogContentText id="disable-oauth-dialog-description">
						Disabling OAuth Sign-in will remove the configured OAuth authentication settings. Users will no longer be able to sign in using the configured OAuth provider.
					</DialogContentText>
				</DialogContent>

				<DialogActions>
					<Button onClick={handleCancelDisableOAuth}>Cancel</Button>

					<Button onClick={handleConfirmDisableOAuth} color="error" variant="contained">
						Disable
					</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
};

export default Settings;
