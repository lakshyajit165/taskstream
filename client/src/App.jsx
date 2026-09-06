import CssBaseline from "@mui/material/CssBaseline";
import { Routes, Route, Navigate } from "react-router-dom";
import DrawerMenu from "./components/DrawerMenu";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import Projects from "./pages/Projects/Projects";
import { ToastProvider } from "./providers/ToastProvider";
import "./App.css";
import Settings from "./pages/Settings/Settings";
import CreateAndUpdateProject from "./pages/CreateAndUpdateProject/CreateAndUpdateProject";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import ProjectDetails from "./pages/ProjectDetails/ProjectDetails";
import NotFound from "./pages/NotFound/NotFound";
import TaskDetails from "./pages/TaskDetails/TaskDetails";
import { ProjectProvider } from "./providers/ProjectProvider";
import { AuthProvider } from "./providers/AuthProvider";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import { CustomThemeProvider } from "./providers/CustomThemeProvider";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import OAuthCallback from "./pages/OAuth/OAuthCallback";
import Documentation from "./pages/Documentation/Documentation";

function App() {
	return (
		<CustomThemeProvider>
			<CssBaseline />
			<AuthProvider>
				<ToastProvider>
					<LocalizationProvider dateAdapter={AdapterDateFns}>
						<ProjectProvider>
							<Routes>
								{/* 1. Auth pages | Public routes (Highest priority) */}
								<Route element={<PublicRoute />}>
									<Route path="/login" element={<Login />} />
									<Route path="/signup" element={<Signup />} />
									<Route path="/forgot_password" element={<ForgotPassword />} />
									<Route path="/oauth2/callback" element={<OAuthCallback />} />
								</Route>

								{/* 2. PROTECTED ROUTES: Layout and Content */}
								<Route element={<PrivateRoute />}>
									{/* The root path starts the DrawerMenu layout */}
									<Route path="/" element={<DrawerMenu />}>
										{/* Nested Protected Pages */}
										<Route index element={<Navigate to="home" replace />} />
										<Route path="home" element={<Home />} />
										<Route path="projects" element={<Projects />} />
										<Route path="settings" element={<Settings />} />
										<Route path="projects/new" element={<CreateAndUpdateProject />} />
										<Route path="projects/:id" element={<ProjectDetails />} />
										<Route path="projects/edit/:id" element={<CreateAndUpdateProject />} />
										<Route path="tasks/:id" element={<TaskDetails />} />
										<Route path="documentation" element={<Documentation />} />
										{/* 3. NESTED NOT FOUND: This catches bad URLs while *inside* the Drawer layout */}
										{/* If the user is logged in but navigates to /bad-url, DrawerMenu renders <Outlet /> (NotFound) */}
										<Route path="*" element={<NotFound />} />
									</Route>
								</Route>

								{/* 4. GLOBAL CATCH-ALL: This catches bad URLs not covered by any route above (including /login and /signup) */}
								{/* If the user is logged OUT and types /dashboard, they hit PrivateRoute (which redirects to /login) 
                                   If they type /totally-random, it falls here (if not inside another route group) */}
								<Route path="*" element={<NotFound />} />
							</Routes>
						</ProjectProvider>
					</LocalizationProvider>
				</ToastProvider>
			</AuthProvider>
		</CustomThemeProvider>
	);
}

export default App;
