import React, { useContext, useState, useEffect } from "react";

import {
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
	CircularProgress,
	Collapse,
	FormHelperText,
	styled,
} from "@mui/material";

import GitHubIcon from "@mui/icons-material/GitHub";
import { FaGitlab } from "react-icons/fa";

import { ToastContext } from "../context/ToastContext";

import { saveOAuthCreds, getOAuthProvider, disableOAuthCreds } from "../api/auth/auth";

import { validateOAuthSetupPayload } from "../api/utils/formValidation";

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

const IOSSwitch = styled((props) => <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />)(({ theme }) => ({
	width: 42,
	height: 26,
	padding: 0,

	"& .MuiSwitch-switchBase": {
		padding: 0,
		margin: 2,
		transitionDuration: "300ms",

		"&.Mui-checked": {
			transform: "translateX(16px)",
			color: "#fff",

			"& + .MuiSwitch-track": {
				backgroundColor: theme.palette.primary.main,
				opacity: 1,
				border: 0,
			},

			"&.Mui-disabled + .MuiSwitch-track": {
				opacity: 0.5,
			},
		},

		"&.Mui-focusVisible .MuiSwitch-thumb": {
			color: theme.palette.primary.main,
			border: "6px solid #fff",
		},

		"&.Mui-disabled .MuiSwitch-thumb": {
			color: theme.palette.grey[300],
		},

		"&.Mui-disabled + .MuiSwitch-track": {
			backgroundColor: theme.palette.grey[400],
			opacity: 0.7,
		},
	},

	"& .MuiSwitch-thumb": {
		boxSizing: "border-box",
		width: 22,
		height: 22,
	},

	"& .MuiSwitch-track": {
		borderRadius: 26 / 2,
		backgroundColor: theme.palette.grey[400],
		opacity: 1,
		transition: theme.transitions.create(["background-color"], {
			duration: 500,
		}),
	},
}));

const OAuthSettings = () => {
	const { showToast } = useContext(ToastContext);

	const [oauthEnabled, setOauthEnabled] = useState(false);
	const [oauthProvider, setOauthProvider] = useState("GITHUB");
	const [oauthServer, setOauthServer] = useState(OAUTH_PROVIDERS.GITHUB.defaultServer);

	const [oauthClientId, setOauthClientId] = useState("");
	const [oauthClientSecret, setOauthClientSecret] = useState("");

	/*
	 * These track whether the user has actually entered a new
	 * Client ID / Client Secret.
	 *
	 * This is important because existing credentials are displayed
	 * as ******** and must never be sent back to the API.
	 */
	const [clientIdModified, setClientIdModified] = useState(false);
	const [clientSecretModified, setClientSecretModified] = useState(false);

	const [errors, setErrors] = useState({});
	const [saveOAuthConfigLoading, setSaveOAuthConfigLoading] = useState(false);
	const [oAuthProviderLoading, setOAuthProviderLoading] = useState(true);

	const [openDisableDialog, setOpenDisableDialog] = useState(false);

	/*
	 * Load the currently configured OAuth provider when this
	 * component mounts.
	 */
	useEffect(() => {
		const loadOAuthProvider = async () => {
			try {
				const oauthResponse = await getOAuthProvider();

				const provider = oauthResponse.data;

				if (provider === "GITHUB") {
					setOauthEnabled(true);
					setOauthProvider("GITHUB");
					setOauthServer(OAUTH_PROVIDERS.GITHUB.defaultServer);

					// Never retrieve or display the actual credentials.
					setOauthClientId("********");
					setOauthClientSecret("********");

					setClientIdModified(false);
					setClientSecretModified(false);
				} else if (provider === "GITLAB") {
					setOauthEnabled(true);
					setOauthProvider("GITLAB");
					setOauthServer(OAUTH_PROVIDERS.GITLAB.defaultServer);

					// Never retrieve or display the actual credentials.
					setOauthClientId("********");
					setOauthClientSecret("********");

					setClientIdModified(false);
					setClientSecretModified(false);
				} else {
					// LOCAL means OAuth is disabled.
					setOauthEnabled(false);
					setOauthProvider("GITHUB");
					setOauthServer(OAUTH_PROVIDERS.GITHUB.defaultServer);

					setOauthClientId("");
					setOauthClientSecret("");

					setClientIdModified(false);
					setClientSecretModified(false);
				}
			} catch (err) {
				showToast(err.message || "Failed to load OAuth configuration", "error");
			} finally {
				setOAuthProviderLoading(false);
			}
		};

		loadOAuthProvider();
	}, []);

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
		 * Only send credentials that the user actually modified.
		 *
		 * This prevents ******** from being sent to the backend.
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
		 * If neither credential was modified, don't make the API
		 * call because the fields only contain masked values.
		 */
		const noCredentialsProvided = !clientIdModified && !clientSecretModified;

		if (noCredentialsProvided) {
			setErrors({
				clientId: "Client ID is required",
				clientSecret: "Client Secret is required",
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
			 * Don't retain the actual credentials in the frontend.
			 * Show the masked values again after a successful save.
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

		/*
		 * Automatically change the server URL when switching
		 * providers if the user was still using the default URL.
		 */
		if (oauthServer === OAUTH_PROVIDERS[previousProvider].defaultServer) {
			setOauthServer(OAUTH_PROVIDERS[provider].defaultServer);
		}

		/*
		 * Credentials displayed for the previous provider must
		 * never be submitted for the newly selected provider.
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

	return (
		<Box sx={{ my: 4 }}>
			<Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
				<Typography variant="h6" component="h2">
					Enable OAuth
				</Typography>

				{!oAuthProviderLoading && <FormControlLabel control={<IOSSwitch checked={oauthEnabled} onChange={handleOAuthToggle} />} sx={{ mr: 0 }} />}
			</Box>

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

			{/* Disable OAuth Confirmation Dialog */}
			<Dialog open={openDisableDialog} onClose={handleCancelDisableOAuth} aria-labelledby="disable-oauth-dialog-title" aria-describedby="disable-oauth-dialog-description">
				<DialogTitle id="disable-oauth-dialog-title">Disable OAuth Sign-in?</DialogTitle>

				<DialogContent>
					<DialogContentText id="disable-oauth-dialog-description">
						Disabling OAuth Sign-in will remove the configured OAuth authentication settings. Users will no longer be able to sign in using the configured OAuth provider.
					</DialogContentText>
				</DialogContent>

				<DialogActions
					sx={{
						justifyContent: "flex-start",
						padding: "22px",
					}}
				>
					<Button onClick={handleConfirmDisableOAuth} color="error" variant="contained">
						Disable
					</Button>
					<Button onClick={handleCancelDisableOAuth}>Cancel</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default OAuthSettings;
