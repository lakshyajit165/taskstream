import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Routes, Route, Navigate } from "react-router-dom";
import DrawerMenu from "./components/DrawerMenu";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Projects from "./pages/Projects";
import { ToastProvider } from "./components/ToastProvider";
import "./App.css";
import Tasks from "./pages/Tasks";
import Settings from "./pages/Settings";

const theme = createTheme({
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: "none",
				},
			},
		},
	},
	typography: {
		fontFamily: '"Lato", sans-serif',
	},
});

function App() {
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<ToastProvider>
				<Routes>
					{/* Auth pages */}
					<Route path="/login" element={<Login />} />
					<Route path="/signup" element={<Signup />} />

					{/* Drawer pages */}
					<Route path="/*" element={<DrawerMenu />}>
						<Route index element={<Navigate to="home" replace />} />
						<Route path="home" element={<Home />} />
						<Route path="tasks" element={<Tasks />} />
						<Route path="projects" element={<Projects />} />
						<Route path="settings" element={<Settings />} />
					</Route>
				</Routes>
			</ToastProvider>
		</ThemeProvider>
	);
}

export default App;
