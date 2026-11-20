import React, { useEffect, useState } from "react";

import { Box, Container, Divider, Link, Paper, Stack, Typography } from "@mui/material";

const scrollToSection = (sectionId) => {
	document.getElementById(sectionId)?.scrollIntoView({
		behavior: "smooth",
		block: "start",
	});
};

const docSections = [
	{ id: "oauth-setup", label: "OAuth Setup" },
	{ id: "gitlab-setup", label: "GitLab OAuth App" },
	{ id: "github-setup", label: "GitHub OAuth App" },
	{ id: "taskstream-config", label: "TaskStream Configuration" },
	{ id: "callback-url", label: "Callback URL" },
	{ id: "oauth-scopes", label: "Required Scopes" },
	{ id: "oauth-flow", label: "OAuth Flow" },
	{ id: "github-docs", label: "GitHub Documentation" },
];

const DocLink = ({ id, children, active, onNavigate }) => (
	<Link
		component="button"
		onClick={() => {
			onNavigate(id);
			scrollToSection(id);
		}}
		underline="none"
		color={active ? "text.primary" : "primary.main"}
		sx={{
			display: "block",
			width: "100%",
			textAlign: "left",
			cursor: "pointer",
			fontWeight: active ? 700 : 400,
			lineHeight: 1.4,
			py: 1,
			pl: 1.5,
			borderLeft: "2px solid",
			borderColor: active ? "text.primary" : "transparent",
			transition: "color 150ms ease, border-color 150ms ease",
			"&:hover": { color: "text.primary", textDecoration: "none" },
		}}
	>
		{children}
	</Link>
);
const Documentation = () => {
	const [activeSection, setActiveSection] = useState("oauth-setup");

	useEffect(() => {
		if (!("IntersectionObserver" in window)) return undefined;

		const visibleSections = new Set();
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						visibleSections.add(entry.target.id);
					} else {
						visibleSections.delete(entry.target.id);
					}
				});

				const topSection = [...visibleSections]
					.map((id) => document.getElementById(id))
					.filter(Boolean)
					.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)[0];
				if (topSection) setActiveSection(topSection.id);
			},
			{ rootMargin: "-100px 0px -70% 0px", threshold: 0 },
		);

		docSections.forEach(({ id }) => {
			const section = document.getElementById(id);
			if (section) observer.observe(section);
		});

		return () => observer.disconnect();
	}, []);

	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Stack
				direction={{ xs: "column", lg: "row" }}
				spacing={{ xs: 4, lg: 5 }}
				justifyContent="center"
				alignItems={{ xs: "stretch", lg: "flex-start" }}
			>
				<Box
					component="nav"
					aria-label="Documentation sections"
					sx={{
						width: { xs: "100%", md: 250 },
						flexShrink: 0,
						position: { lg: "sticky" },
						top: { lg: 90 },
						mx: { xs: 0, md: "auto", lg: 0 },
					}}
				>
					<Stack spacing={0.5}>
						{docSections.map(({ id, label }) => (
							<DocLink key={id} id={id} active={activeSection === id} onNavigate={setActiveSection}>
								{label}
							</DocLink>
						))}
					</Stack>
				</Box>

				<Paper
					elevation={0}
					sx={{
						width: "100%",
						maxWidth: { md: 700 },
						flex: { xs: "0 1 auto", lg: "1 1 0%" },
						minWidth: 0,
						boxSizing: "border-box",
						mx: { xs: "auto", lg: 0 },
					}}
				>
					<Box id="heading">
						<Typography variant="h4" component="h1" sx={{ fontWeight: "bold", mb: 1 }}>
							Documentation
						</Typography>

						<Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
							Guides and setup instructions for configuring and using TaskStream.
						</Typography>
					</Box>
					<Box id="oauth-setup" sx={{ scrollMarginTop: 90 }}>
						<Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
							OAuth Setup
						</Typography>

						<Typography color="text.secondary" sx={{ mb: 3 }}>
							TaskStream supports OAuth-based authentication through external identity providers. OAuth configuration is managed from the TaskStream Settings page.
						</Typography>
					</Box>

					<Divider sx={{ my: 4 }} />

					<Box id="gitlab-setup" sx={{ scrollMarginTop: 90 }}>
						<Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
							Create a GitLab OAuth application
						</Typography>
						<Typography color="text.secondary" sx={{ mb: 2 }}>
							In GitLab, open your avatar menu → Edit profile → Access → Applications, then add a new application. Use the TaskStream callback URL below, enable the{" "}
							<strong>read_user</strong> scope, and save it. GitLab displays the Application ID and Secret; enter these as Client ID and Client Secret in TaskStream Settings, select
							GitLab, and use your GitLab server URL (https://gitlab.com for GitLab.com).
						</Typography>
						<Typography component="div" sx={{ mb: 2, overflowWrap: "anywhere" }}>
							<strong>Callback URL:</strong> <code>https://YOUR_TASKSTREAM_API/api/v1/auth/oauth2/gitlab/callback</code>
						</Typography>
						<Link href="https://docs.gitlab.com/integration/oauth_provider/" target="_blank" rel="noopener noreferrer" underline="hover">
							GitLab: Configure OAuth as an identity provider →
						</Link>
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
