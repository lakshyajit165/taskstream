import * as React from "react";
import { Box, Drawer, CssBaseline, Toolbar, Typography, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, AppBar } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { Link, Outlet, useLocation } from "react-router-dom";

const drawerWidth = 240;

export default function DrawerMenu() {
	const [open, setOpen] = React.useState(false);
	const location = useLocation();

	const handleDrawerOpen = () => setOpen(true);
	const handleDrawerClose = () => setOpen(false);

	return (
		<Box sx={{ display: "flex" }}>
			<CssBaseline />

			<AppBar position="fixed">
				<Toolbar>
					<IconButton color="inherit" edge="start" onClick={handleDrawerOpen} sx={{ mr: 2 }}>
						<MenuIcon />
					</IconButton>
					<Typography variant="h6" noWrap>
						TaskStream
					</Typography>
				</Toolbar>
			</AppBar>

			<Drawer
				variant="temporary"
				anchor="left"
				open={open}
				onClose={handleDrawerClose}
				sx={{
					"& .MuiDrawer-paper": {
						width: drawerWidth,
						display: "flex", // ➡️ Make drawer a flex container
						flexDirection: "column", // ➡️ Stack children vertically
					},
				}}
			>
				<Toolbar sx={{ justifyContent: "flex-end" }}>
					<IconButton onClick={handleDrawerClose}>
						<ChevronLeftIcon />
					</IconButton>
				</Toolbar>

				<Divider />

				{/* This Box contains all items that should be at the top */}
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
							<ListItemButton component={Link} to="/tasks" onClick={handleDrawerClose} selected={location.pathname === "/tasks"}>
								<ListItemIcon>
									<TaskAltOutlinedIcon />
								</ListItemIcon>
								<ListItemText primary="Tasks" />
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
							<ListItemButton component={Link} to="/settings" onClick={handleDrawerClose} selected={location.pathname.startsWith("/settings")}>
								<ListItemIcon>
									<SettingsOutlinedIcon />
								</ListItemIcon>
								<ListItemText primary="Settings" />
							</ListItemButton>
						</ListItem>
					</List>
				</Box>

				{/* This Box contains the item you want at the bottom */}
				<Box>
					<Divider />
					<List>
						<ListItem disablePadding>
							<ListItemButton component={Link} to="/logout" onClick={handleDrawerClose}>
								<ListItemIcon>
									<LogoutOutlinedIcon />
								</ListItemIcon>
								<ListItemText primary="Logout" />
							</ListItemButton>
						</ListItem>
					</List>
				</Box>
			</Drawer>

			<Box component="main" sx={{ flexGrow: 1, p: 3 }}>
				<Toolbar />
				<Outlet />
			</Box>
		</Box>
	);
}
