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
import { saveOAuthCreds, getOAuthProvider, disableOAuthCreds } from "../../api/auth/auth";
import { validateOAuthSetupPayload } from "../../api/utils/formValidation";
import { CircularProgress } from "@mui/material";

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

	// Tracks whether the user has actually entered a new credential.
	const [clientIdModified, setClientIdModified] = useState(false);
	const [clientSecretModified, setClientSecretModified] = useState(false);

	const [errors, setErrors] = useState({});
	const [saveOAuthConfigLoading, setSaveOAuthConfigLoading] = useState(false);
	const [oAuthProviderLoading, setOAuthProviderLoading] = useState(true);

	const [openDisableDialog, setOpenDisableDialog] = useState(false);
	const [isAdmin, setIsAdmin] = useState(false);

	useEffect(() => {
		const loadSettings = async () => {
			const isAdminAccordingToJwt = isCurrentUserAdminFromLocal();

			if (!isAdminAccordingToJwt) {
				setIsAdmin(false);
				setOAuthProviderLoading(false);
				return;
			}

			try {
				const adminResponse = await isCurrentUserAdminFromApi();
				const isAdminAccordingToApi = adminResponse.data === true;

				setIsAdmin(isAdminAccordingToApi);

				if (!isAdminAccordingToApi) {
					setOAuthProviderLoading(false);
					return;
				}

				const oauthResponse = await getOAuthProvider();
				const provider = oauthResponse.data;

				if (provider === "GITHUB") {
					setOauthEnabled(true);
					setOauthProvider("GITHUB");
					setOauthServer(OAUTH_PROVIDERS.GITHUB.defaultServer);

					// Never load the real credentials into the frontend.
					setOauthClientId("********");
					setOauthClientSecret("********");

					setClientIdModified(false);
					setClientSecretModified(false);
				} else if (provider === "GITLAB") {
					setOauthEnabled(true);
					setOauthProvider("GITLAB");
					setOauthServer(OAUTH_PROVIDERS.GITLAB.defaultServer);

					// Never load the real credentials into the frontend.
					setOauthClientId("********");
					setOauthClientSecret("********");

					setClientIdModified(false);
					setClientSecretModified(false);
				} else {
					setOauthEnabled(false);
					setOauthProvider("GITHUB");
					setOauthServer(OAUTH_PROVIDERS.GITHUB.defaultServer);
					setOauthClientId("");
					setOauthClientSecret("");

					setClientIdModified(false);
					setClientSecretModified(false);
				}
			} catch (err) {
				showToast(err.message || "Failed to load settings", "error");

				setIsAdmin(false);
			} finally {
				setOAuthProviderLoading(false);
			}
		};

		loadSettings();
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
				setClientIdModified(true);
				break;

			case "clientSecret":
				setOauthClientSecret(value);
				setClientSecretModified(true);
				break;

			default:
				break;
		}

		validate(updatedValues);
	};

	const handleSaveOAuth = async () => {
		/*
		 * Do not send oauthClientId/oauthClientSecret blindly.
		 *
		 * They may contain "********" when an existing configuration
		 * is loaded. Only send a credential if the user actually
		 * modified that field.
		 */
		const oauthSetupData = {
			oauthProvider,
			serverUrl: oauthServer,
		};

		if (clientIdModified) {
			oauthSetupData.clientId = oauthClientId;
		}

		if (clientSecretModified) {
			oauthSetupData.clientSecret = oauthClientSecret;
		}

		/*
		 * Neither credential was changed.
		 *
		 * This prevents the masked values from being submitted.
		 */
		const noCredentialsProvided = !clientIdModified && !clientSecretModified;

		if (noCredentialsProvided) {
			setErrors({
				clientId: "Client ID is not valid",
				clientSecret: "Client Secret is not valid",
			});

			return;
		}

		const validationErrors = validateOAuthSetupPayload(oauthSetupData);

		setErrors(validationErrors);

		if (Object.keys(validationErrors).length !== 0) {
			return;
		}

		setSaveOAuthConfigLoading(true);

		try {
			const response = await saveOAuthCreds(oauthSetupData);

			showToast(response.message || "OAuth configuration saved successfully", "success");

			/*
			 * Do not keep the newly entered credentials in the
			 * frontend state after saving.
			 */
			setOauthClientId("********");
			setOauthClientSecret("********");

			setClientIdModified(false);
			setClientSecretModified(false);
			setErrors({});
		} catch (err) {
			showToast(err.message || "Failed to save OAuth configuration", "error");
		} finally {
			setSaveOAuthConfigLoading(false);
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

		/*
		 * The masked credentials currently displayed belong to the
		 * previous provider. Clear them when switching provider.
		 */
		setOauthClientId("");
		setOauthClientSecret("");

		setClientIdModified(false);
		setClientSecretModified(false);

		setErrors({});
	};

	const handleConfirmDisableOAuth = async () => {
		try {
			await disableOAuthCreds();

			showToast("OAuth configuration disabled successfully", "success");

			setOauthEnabled(false);
			setOpenDisableDialog(false);

			// Reset OAuth configuration.
			setOauthProvider("GITHUB");
			setOauthServer(OAUTH_PROVIDERS.GITHUB.defaultServer);
			setOauthClientId("");
			setOauthClientSecret("");

			setClientIdModified(false);
			setClientSecretModified(false);

			setErrors({});
		} catch (err) {
			showToast(err.message || "Failed to disable OAuth configuration", "error");
		}
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

					{oAuthProviderLoading ? (
						<Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 3 }}>
							<CircularProgress size={22} />

							<Typography variant="body2" color="text.secondary">
								Loading OAuth configuration...
							</Typography>
						</Stack>
					) : (
						<>
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
												<FaGitlab
													size={22}
													style={{
														marginRight: 8,
													}}
													color="orange"
												/>
												GitLab
											</ToggleButton>
										</ToggleButtonGroup>
									</Box>

									{/* Server URL */}
									<Box>
										<TextField
											label={selectedProvider.serverLabel}
											placeholder={selectedProvider.serverPlaceholder}
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
											type="password"
											value={oauthClientId}
											onFocus={() => {
												if (!clientIdModified) {
													setOauthClientId("");
												}
											}}
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
											onFocus={() => {
												if (!clientSecretModified) {
													setOauthClientSecret("");
												}
											}}
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
										<Button variant="contained" loading={saveOAuthConfigLoading} loadingIndicator="Saving..." onClick={handleSaveOAuth}>
											Save
										</Button>
									</Box>
								</Stack>
							)}
						</>
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
