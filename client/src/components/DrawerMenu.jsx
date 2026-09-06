import React, { useContext } from "react";

import { Box, Drawer, CssBaseline, Toolbar, Typography, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, AppBar, Avatar } from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import { ToastContext } from "../context/ToastContext";
import { ProjectContext } from "../context/ProjectContext";
import { AuthContext } from "../context/AuthContext";

import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";

const drawerWidth = 240;

const DrawerMenu = () => {
	const { showToast } = useContext(ToastContext);
	const { setSelectedProject } = useContext(ProjectContext);
	const { user, setLogoutState } = useContext(AuthContext);

	const navigate = useNavigate();

	const [drawerOpen, setDrawerOpen] = React.useState(false);
	const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);

	const location = useLocation();

	const handleDrawerOpen = () => setDrawerOpen(true);

	const handleDrawerClose = () => setDrawerOpen(false);

	const handleLogoutDialogOpen = () => {
		handleDrawerClose();
		setLogoutDialogOpen(true);
	};

	const handleLogoutDialogClose = () => setLogoutDialogOpen(false);

	const handleLogout = () => {
		setLogoutState();
		setSelectedProject(null);
		navigate("/login");
		showToast("Logout successful", "success");
	};

	const getInitials = (name) => {
		if (!name) {
			return "";
		}

		return name
			.trim()
			.split(/\s+/)
			.slice(0, 2)
			.map((part) => part.charAt(0).toUpperCase())
			.join("");
	};

	return (
		<Box sx={{ display: "flex" }}>
			<CssBaseline />

			<AppBar position="fixed" color="primary">
				<Toolbar>
					<IconButton color="inherit" edge="start" onClick={handleDrawerOpen} sx={{ mr: 2 }}>
						<MenuIcon />
					</IconButton>

					<Typography variant="h6" noWrap sx={{ fontWeight: "bold" }}>
						taskstream_
					</Typography>

					<Avatar
						sx={{
							ml: "auto",
							width: 36,
							height: 36,
							fontSize: "0.9rem",
							fontWeight: "bold",
							color: "black",
							backgroundColor: "#fff",
						}}
					>
						{getInitials(user?.name)}
					</Avatar>
				</Toolbar>
			</AppBar>

			<Drawer
				variant="temporary"
				anchor="left"
				open={drawerOpen}
				onClose={handleDrawerClose}
				sx={{
					"& .MuiDrawer-paper": {
						width: drawerWidth,
						display: "flex",
						flexDirection: "column",
					},
				}}
			>
				<Toolbar sx={{ justifyContent: "flex-end" }}>
					<IconButton onClick={handleDrawerClose}>
						<ChevronLeftIcon />
					</IconButton>
				</Toolbar>

				<Divider />

				<Box sx={{ flexGrow: 1 }}>
					<List>
						<ListItem disablePadding>
							<ListItemButton component={Link} to="/" onClick={handleDrawerClose} selected={location.pathname === "/"}>
								<ListItemIcon>
									<HomeOutlinedIcon />
								</ListItemIcon>
								<ListItemText primary="Home" />
							</ListItemButton>
						</ListItem>

						<ListItem disablePadding>
							<ListItemButton component={Link} to="/projects" onClick={handleDrawerClose} selected={location.pathname.startsWith("/projects")}>
								<ListItemIcon>
									<DescriptionOutlinedIcon />
								</ListItemIcon>
								<ListItemText primary="Projects" />
							</ListItemButton>
						</ListItem>
						<ListItem disablePadding>
							<ListItemButton component={Link} to="/documentation" onClick={handleDrawerClose} selected={location.pathname.startsWith("/documentation")}>
								<ListItemIcon>
									<LibraryBooksIcon />
								</ListItemIcon>

								<ListItemText primary="Documentation" />
							</ListItemButton>
						</ListItem>
						<ListItem disablePadding>
							<ListItemButton component={Link} to="/settings" onClick={handleDrawerClose} selected={location.pathname.startsWith("/settings")}>
								<ListItemIcon>
									<SettingsOutlinedIcon />
								</ListItemIcon>
								<ListItemText primary="Settings" />
							</ListItemButton>
						</ListItem>
					</List>
				</Box>

				<Box>
					<Divider />

					<List>
						<ListItem disablePadding>
							<ListItemButton onClick={handleLogoutDialogOpen}>
								<ListItemIcon>
									<LogoutOutlinedIcon />
								</ListItemIcon>
								<ListItemText primary="Logout" />
							</ListItemButton>
						</ListItem>
					</List>
				</Box>
			</Drawer>

			<Dialog
				open={logoutDialogOpen}
				onClose={handleLogoutDialogClose}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
				sx={{
					"& .MuiPaper-root": {
						minWidth: "350px",
					},
				}}
			>
				<DialogTitle id="alert-dialog-title">{"Logout of TaskStream"}</DialogTitle>

				<DialogContent>
					<DialogContentText id="alert-dialog-description">Are you sure you want to log out?</DialogContentText>
				</DialogContent>

				<DialogActions
					sx={{
						justifyContent: "flex-start",
						padding: "22px",
					}}
				>
					<Button variant="contained" onClick={handleLogout}>
						Yes
					</Button>

					<Button variant="outlined" onClick={handleLogoutDialogClose} autoFocus>
						Cancel
					</Button>
				</DialogActions>
			</Dialog>

			<Box component="main" sx={{ flexGrow: 1, p: 3 }}>
				<Toolbar />
				<Outlet />
			</Box>
		</Box>
	);
};

export default DrawerMenu;
