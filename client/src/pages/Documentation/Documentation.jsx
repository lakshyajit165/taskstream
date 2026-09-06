import React from "react";

import { Box, Container, Divider, Link, Paper, Stack, Typography } from "@mui/material";

const scrollToSection = (sectionId) => {
	document.getElementById(sectionId)?.scrollIntoView({
		behavior: "smooth",
		block: "start",
	});
};

const DocLink = ({ id, children, nested = false }) => (
	<Link
		component="button"
		onClick={() => scrollToSection(id)}
		underline="hover"
		color={nested ? "text.secondary" : "text.primary"}
		sx={{
			display: "block",
			width: "100%",
			textAlign: "left",
			cursor: "pointer",
			fontWeight: nested ? "normal" : 600,
			pl: nested ? 2 : 0,
		}}
	>
		{children}
	</Link>
);
const Documentation = () => {
	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Typography variant="h4" component="h1" sx={{ fontWeight: "bold", mb: 1 }}>
				Documentation
			</Typography>

			<Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
				Guides and setup instructions for configuring and using TaskStream.
			</Typography>

			<Stack direction={{ xs: "column", md: "row" }} spacing={4} alignItems="flex-start">
				<Paper
					elevation={0}
					variant="outlined"
					sx={{
						width: { xs: "100%", md: 220 },
						flexShrink: 0,
						position: { md: "sticky" },
						top: { md: 90 },
					}}
				>
					<Box sx={{ p: 2 }}>
						<Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
							On this page
						</Typography>

						<Stack spacing={0.5}>
							<DocLink id="oauth-setup">OAuth Setup</DocLink>

							<DocLink id="github-setup" nested>
								GitHub OAuth App
							</DocLink>

							<DocLink id="taskstream-config" nested>
								TaskStream Configuration
							</DocLink>

							<DocLink id="callback-url" nested>
								Callback URL
							</DocLink>

							<DocLink id="oauth-scopes" nested>
								Required Scopes
							</DocLink>

							<DocLink id="oauth-flow" nested>
								OAuth Flow
							</DocLink>

							<DocLink id="github-docs" nested>
								GitHub Documentation
							</DocLink>
						</Stack>
					</Box>
				</Paper>

				<Paper
					elevation={0}
					sx={{
						flexGrow: 1,
						minWidth: 0,
					}}
				>
					<Box id="oauth-setup" sx={{ scrollMarginTop: 90 }}>
						<Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
							OAuth Setup
						</Typography>

						<Typography color="text.secondary" sx={{ mb: 3 }}>
							TaskStream supports OAuth-based authentication through external identity providers. OAuth configuration is managed from the TaskStream Settings page.
						</Typography>
					</Box>

					<Divider sx={{ my: 4 }} />

					<Box id="github-setup" sx={{ scrollMarginTop: 90 }}>
						<Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
							1. Create a GitHub OAuth App
						</Typography>

						<Typography color="text.secondary" sx={{ mb: 2 }}>
							Before enabling GitHub authentication in TaskStream, create an OAuth App in GitHub.
						</Typography>

						<Typography component="ol" sx={{ pl: 3 }}>
							<li>Open your GitHub account settings.</li>
							<li>
								Go to <strong>Developer settings → OAuth Apps</strong>.
							</li>
							<li>
								Select <strong>New OAuth App</strong>.
							</li>
							<li>Provide an application name.</li>
							<li>Configure the authorization callback URL described below.</li>
							<li>Create the application.</li>
						</Typography>

						<Typography color="text.secondary" sx={{ mt: 2 }}>
							GitHub provides the Client ID and Client Secret after the OAuth App is created.
						</Typography>

						<Link
							href="https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app"
							target="_blank"
							rel="noopener noreferrer"
							underline="hover"
							sx={{ display: "inline-block", mt: 2 }}
						>
							GitHub: Creating an OAuth App →
						</Link>
					</Box>

					<Divider sx={{ my: 4 }} />

					<Box id="taskstream-config" sx={{ scrollMarginTop: 90 }}>
						<Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
							2. Configure TaskStream
						</Typography>

						<Typography color="text.secondary" sx={{ mb: 2 }}>
							Once the GitHub OAuth App has been created, open the TaskStream Settings page and enable OAuth.
						</Typography>

						<Typography component="ol" sx={{ pl: 3 }}>
							<li>
								Open <strong>Settings</strong> in TaskStream.
							</li>
							<li>
								Enable <strong>OAuth</strong>.
							</li>
							<li>
								Select <strong>GitHub</strong> as the provider.
							</li>
							<li>Enter the GitHub server URL.</li>
							<li>Enter the OAuth App Client ID.</li>
							<li>Enter the OAuth App Client Secret.</li>
							<li>
								Click <strong>Save</strong>.
							</li>
						</Typography>

						<Typography color="text.secondary" sx={{ mt: 2 }}>
							For GitHub.com, the server URL should be:
						</Typography>

						<Paper
							variant="outlined"
							sx={{
								p: 1.5,
								mt: 1,
								bgcolor: "action.hover",
								fontFamily: "monospace",
							}}
						>
							https://github.com
						</Paper>
					</Box>

					<Divider sx={{ my: 4 }} />

					<Box id="callback-url" sx={{ scrollMarginTop: 90 }}>
						<Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
							3. Configure the Callback URL
						</Typography>

						<Typography color="text.secondary" sx={{ mb: 2 }}>
							The callback URL is the endpoint to which GitHub redirects the user after authorization.
						</Typography>

						<Paper
							variant="outlined"
							sx={{
								p: 1.5,
								bgcolor: "action.hover",
								fontFamily: "monospace",
								wordBreak: "break-all",
							}}
						>
							http://localhost:8000/api/v1/auth/oauth2/github/callback
						</Paper>

						<Typography color="text.secondary" sx={{ mt: 2 }}>
							This URL must match the callback URL configured in the GitHub OAuth App.
						</Typography>
					</Box>

					<Divider sx={{ my: 4 }} />

					<Box id="oauth-scopes" sx={{ scrollMarginTop: 90 }}>
						<Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
							4. Required OAuth Scopes
						</Typography>

						<Typography color="text.secondary" sx={{ mb: 2 }}>
							TaskStream currently requests the following GitHub scopes:
						</Typography>

						<Stack spacing={1}>
							<Paper variant="outlined" sx={{ p: 1.5 }}>
								<Typography component="code" sx={{ fontFamily: "monospace" }}>
									read:user
								</Typography>

								<Typography variant="body2" color="text.secondary">
									Allows TaskStream to read the authenticated user's GitHub profile.
								</Typography>
							</Paper>

							<Paper variant="outlined" sx={{ p: 1.5 }}>
								<Typography component="code" sx={{ fontFamily: "monospace" }}>
									user:email
								</Typography>

								<Typography variant="body2" color="text.secondary">
									Allows TaskStream to retrieve the user's GitHub email addresses.
								</Typography>
							</Paper>
						</Stack>

						<Link
							href="https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps"
							target="_blank"
							rel="noopener noreferrer"
							underline="hover"
							sx={{ display: "inline-block", mt: 2 }}
						>
							GitHub: OAuth Scopes →
						</Link>
					</Box>

					<Divider sx={{ my: 4 }} />

					<Box id="oauth-flow" sx={{ scrollMarginTop: 90 }}>
						<Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
							5. How OAuth Login Works
						</Typography>

						<Typography color="text.secondary" sx={{ mb: 2 }}>
							TaskStream uses the OAuth authorization-code flow. At a high level:
						</Typography>

						<Stack spacing={1}>
							<Typography>
								1. User selects <strong>Sign in with GitHub</strong>.
							</Typography>
							<Typography>2. TaskStream generates a temporary OAuth state.</Typography>
							<Typography>3. The user is redirected to GitHub.</Typography>
							<Typography>4. GitHub authenticates and asks the user to authorize TaskStream.</Typography>
							<Typography>5. GitHub redirects back to TaskStream with an authorization code.</Typography>
							<Typography>6. TaskStream exchanges the code for a GitHub access token.</Typography>
							<Typography>7. TaskStream retrieves the GitHub user's profile and email.</Typography>
							<Typography>8. The GitHub identity is linked to the TaskStream user.</Typography>
							<Typography>9. TaskStream generates its own JWT for the authenticated user.</Typography>
						</Stack>

						<Typography color="text.secondary" sx={{ mt: 2 }}>
							The GitHub access token is used only to communicate with GitHub during authentication. TaskStream uses its own JWT for subsequent application authentication.
						</Typography>

						<Link
							href="https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps"
							target="_blank"
							rel="noopener noreferrer"
							underline="hover"
							sx={{ display: "inline-block", mt: 2 }}
						>
							GitHub: OAuth Authorization Flow →
						</Link>
					</Box>

					<Divider sx={{ my: 4 }} />

					<Box id="github-docs" sx={{ scrollMarginTop: 90 }}>
						<Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
							6. Useful GitHub Documentation
						</Typography>

						<Stack spacing={1}>
							<Link href="https://docs.github.com/en/apps/oauth-apps" target="_blank" rel="noopener noreferrer">
								GitHub OAuth Apps
							</Link>

							<Link href="https://docs.github.com/en/apps/oauth-apps/building-oauth-apps" target="_blank" rel="noopener noreferrer">
								Building OAuth Apps
							</Link>

							<Link href="https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps" target="_blank" rel="noopener noreferrer">
								Authorizing OAuth Apps
							</Link>
						</Stack>
					</Box>
				</Paper>
			</Stack>
		</Container>
	);
};

export default Documentation;
