import * as React from "react";
import { Box, Drawer, CssBaseline, Toolbar, Typography, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, AppBar } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import AddTaskIcon from "@mui/icons-material/AddTask";
import { Link, Outlet } from "react-router-dom";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

const drawerWidth = 240;

export default function DrawerMenu() {
	const [open, setOpen] = React.useState(false);

	const handleDrawerOpen = () => setOpen(true);
	const handleDrawerClose = () => setOpen(false);

	return (
		<Box sx={{ display: "flex" }}>
			<CssBaseline />

			{/* Top AppBar */}
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

			{/* Temporary Drawer (overlays content) */}
			<Drawer
				variant="temporary"
				anchor="left"
				open={open}
				onClose={handleDrawerClose}
				sx={{
					"& .MuiDrawer-paper": { width: drawerWidth },
				}}
			>
				{/* Drawer Header with Close Icon */}
				<Toolbar sx={{ justifyContent: "flex-end" }}>
					<IconButton onClick={handleDrawerClose}>
						<ChevronLeftIcon />
					</IconButton>
				</Toolbar>

				<Divider />

				<List>
					<ListItem disablePadding>
						<ListItemButton component={Link} to="/" onClick={handleDrawerClose}>
							<ListItemIcon>
								<HomeIcon />
							</ListItemIcon>
							<ListItemText primary="Home" />
						</ListItemButton>
					</ListItem>

					<ListItem disablePadding>
						<ListItemButton component={Link} to="/add-task" onClick={handleDrawerClose}>
							<ListItemIcon>
								<AddTaskIcon />
							</ListItemIcon>
							<ListItemText primary="Add Task" />
						</ListItemButton>
					</ListItem>
				</List>
			</Drawer>

			{/* Page content */}
			<Box component="main" sx={{ flexGrow: 1, p: 3 }}>
				<Toolbar /> {/* pushes content below AppBar */}
				<Outlet />
			</Box>
		</Box>
	);
}
