import React from "react";
import { Box, Container, Typography, Button, Grid, Card, CardContent, AppBar, Toolbar, Stack, Paper } from "@mui/material";
import { CheckCircleOutline, Speed, Groups, Security, Insights, CloudQueue } from "@mui/icons-material";
const Landing = () => {
	const features = [
		{
			icon: <CheckCircleOutline sx={{ fontSize: 48, color: "primary.main" }} />,
			title: "Intuitive Task Management",
			description: "Create, organize, and track tasks effortlessly with our clean and simple interface.",
		},
		{
			icon: <Groups sx={{ fontSize: 48, color: "primary.main" }} />,
			title: "Team Collaboration",
			description: "Work seamlessly with your team, assign tasks, and keep everyone in sync.",
		},
		{
			icon: <Speed sx={{ fontSize: 48, color: "primary.main" }} />,
			title: "Lightning Fast",
			description: "Built with modern tech stack for optimal performance and responsiveness.",
		},
		{
			icon: <Insights sx={{ fontSize: 48, color: "primary.main" }} />,
			title: "Smart Analytics",
			description: "Gain insights into productivity trends and project progress with detailed analytics.",
		},
		{
			icon: <Security sx={{ fontSize: 48, color: "primary.main" }} />,
			title: "Secure & Private",
			description: "Your data is protected with enterprise-grade security and encryption.",
		},
		{
			icon: <CloudQueue sx={{ fontSize: 48, color: "primary.main" }} />,
			title: "Cloud Synced",
			description: "Access your tasks from anywhere, anytime with automatic cloud synchronization.",
		},
	];

	return (
		<Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
			{/* Navigation Bar */}
			<AppBar position="static" elevation={0} sx={{ bgcolor: "white", borderBottom: 1, borderColor: "divider" }}>
				<Toolbar>
					<Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 700, color: "primary.main" }}>
						TaskStream
					</Typography>
					<Stack direction="row" spacing={2}>
						<Button color="inherit" sx={{ color: "text.primary" }}>
							Features
						</Button>
						<Button color="inherit" sx={{ color: "text.primary" }}>
							About
						</Button>
						<Button variant="outlined" color="primary">
							Sign In
						</Button>
						<Button variant="contained" color="primary">
							Get Started
						</Button>
					</Stack>
				</Toolbar>
			</AppBar>

			{/* Hero Section */}
			<Box
				sx={{
					background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
					color: "white",
					py: 12,
					position: "relative",
					overflow: "hidden",
				}}
			>
				<Container maxWidth="lg">
					<Grid container spacing={4} alignItems="center">
						<Grid item xs={12} md={6}>
							<Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
								Streamline Your Workflow
							</Typography>
							<Typography variant="h5" paragraph sx={{ mb: 4, opacity: 0.9 }}>
								The modern task management solution for teams that want to get things done efficiently.
							</Typography>
							<Stack direction="row" spacing={2}>
								<Button
									variant="contained"
									size="large"
									sx={{
										bgcolor: "white",
										color: "primary.main",
										px: 4,
										py: 1.5,
										"&:hover": { bgcolor: "grey.100" },
									}}
								>
									Start Free Trial
								</Button>
								<Button
									variant="outlined"
									size="large"
									sx={{
										borderColor: "white",
										color: "white",
										px: 4,
										py: 1.5,
										"&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
									}}
								>
									Watch Demo
								</Button>
							</Stack>
						</Grid>
						<Grid item xs={12} md={6}>
							<Paper
								elevation={8}
								sx={{
									p: 3,
									bgcolor: "rgba(255,255,255,0.1)",
									backdropFilter: "blur(10px)",
									borderRadius: 3,
								}}
							>
								<Typography variant="h6" gutterBottom>
									✨ Ready to boost productivity?
								</Typography>
								<Typography variant="body2" sx={{ opacity: 0.9 }}>
									Join thousands of teams already using TaskStream to manage their projects efficiently.
								</Typography>
							</Paper>
						</Grid>
					</Grid>
				</Container>
			</Box>

			{/* Features Section */}
			<Container maxWidth="lg" sx={{ py: 10 }}>
				<Box sx={{ textAlign: "center", mb: 8 }}>
					<Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
						Everything You Need
					</Typography>
					<Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
						Powerful features designed to help you and your team stay organized and productive.
					</Typography>
				</Box>

				<Grid container spacing={4}>
					{features.map((feature, index) => (
						<Grid item xs={12} sm={6} md={4} key={index}>
							<Card
								elevation={0}
								sx={{
									height: "100%",
									p: 2,
									border: 1,
									borderColor: "divider",
									transition: "all 0.3s",
									"&:hover": {
										transform: "translateY(-8px)",
										boxShadow: 4,
										borderColor: "primary.main",
									},
								}}
							>
								<CardContent>
									<Box sx={{ mb: 2 }}>{feature.icon}</Box>
									<Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
										{feature.title}
									</Typography>
									<Typography variant="body2" color="text.secondary">
										{feature.description}
									</Typography>
								</CardContent>
							</Card>
						</Grid>
					))}
				</Grid>
			</Container>

			{/* Stats Section */}
			<Box sx={{ bgcolor: "primary.main", color: "white", py: 8 }}>
				<Container maxWidth="lg">
					<Grid container spacing={4} textAlign="center">
						<Grid item xs={12} md={4}>
							<Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
								10K+
							</Typography>
							<Typography variant="h6">Active Users</Typography>
						</Grid>
						<Grid item xs={12} md={4}>
							<Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
								50K+
							</Typography>
							<Typography variant="h6">Tasks Completed</Typography>
						</Grid>
						<Grid item xs={12} md={4}>
							<Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
								99.9%
							</Typography>
							<Typography variant="h6">Uptime</Typography>
						</Grid>
					</Grid>
				</Container>
			</Box>

			{/* CTA Section */}
			<Container maxWidth="md" sx={{ py: 10 }}>
				<Paper
					elevation={0}
					sx={{
						p: 6,
						textAlign: "center",
						background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
						color: "white",
						borderRadius: 3,
					}}
				>
					<Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
						Ready to Get Started?
					</Typography>
					<Typography variant="h6" paragraph sx={{ mb: 4, opacity: 0.9 }}>
						Join TaskStream today and transform the way you manage tasks.
					</Typography>
					<Button
						variant="contained"
						size="large"
						sx={{
							bgcolor: "white",
							color: "primary.main",
							px: 5,
							py: 2,
							fontSize: "1.1rem",
							"&:hover": { bgcolor: "grey.100" },
						}}
					>
						Start Your Free Trial
					</Button>
				</Paper>
			</Container>

			{/* Footer */}
			<Box sx={{ bgcolor: "grey.900", color: "white", py: 4 }}>
				<Container maxWidth="lg">
					<Grid container spacing={4}>
						<Grid item xs={12} md={4}>
							<Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
								TaskStream
							</Typography>
							<Typography variant="body2" color="grey.400">
								Making task management simple and efficient for teams worldwide.
							</Typography>
						</Grid>
						<Grid item xs={12} md={4}>
							<Typography variant="h6" gutterBottom>
								Quick Links
							</Typography>
							<Stack spacing={1}>
								<Typography variant="body2" color="grey.400" sx={{ cursor: "pointer" }}>
									Features
								</Typography>
								<Typography variant="body2" color="grey.400" sx={{ cursor: "pointer" }}>
									Pricing
								</Typography>
								<Typography variant="body2" color="grey.400" sx={{ cursor: "pointer" }}>
									Documentation
								</Typography>
							</Stack>
						</Grid>
						<Grid item xs={12} md={4}>
							<Typography variant="h6" gutterBottom>
								Contact
							</Typography>
							<Typography variant="body2" color="grey.400">
								support@taskstream.com
							</Typography>
						</Grid>
					</Grid>
					<Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: "grey.800", textAlign: "center" }}>
						<Typography variant="body2" color="grey.500">
							© 2024 TaskStream. All rights reserved.
						</Typography>
					</Box>
				</Container>
			</Box>
		</Box>
	);
};

export default Landing;
