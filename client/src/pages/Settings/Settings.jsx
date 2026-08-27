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
		 * Automatically change the server URL when switching providers
		 * if the user was still using the default URL of the previous
		 * provider.
		 */
		if (oauthServer === OAUTH_PROVIDERS[previousProvider].defaultServer) {
			setOauthServer(OAUTH_PROVIDERS[provider].defaultServer);
		}
	};

	const handleConfirmDisableOAuth = () => {
		setOauthEnabled(false);
		setOpenDisableDialog(false);

		// Reset OAuth configuration.
		setOauthProvider("GITHUB");
		setOauthServer(OAUTH_PROVIDERS.GITHUB.defaultServer);
		setOauthClientId("");
		setOauthClientSecret("");
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
							<TextField
								label={selectedProvider.serverLabel}
								placeholder={selectedProvider.serverPlaceholder}
								value={oauthServer}
								onChange={(event) => setOauthServer(event.target.value)}
								fullWidth
								helperText={selectedProvider.serverHelper}
							/>

							{/* Client ID */}
							<TextField
								label="Client ID"
								value={oauthClientId}
								onChange={(event) => setOauthClientId(event.target.value)}
								fullWidth
								helperText={`The OAuth App Client ID configured in your ${selectedProvider.label} server`}
							/>

							{/* Client Secret */}
							<TextField
								label="Client Secret"
								type="password"
								value={oauthClientSecret}
								onChange={(event) => setOauthClientSecret(event.target.value)}
								fullWidth
								helperText="The OAuth Client Secret. This value will be stored securely."
							/>

							{/* Save */}
							<Box>
								<Button variant="contained">Save</Button>
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
