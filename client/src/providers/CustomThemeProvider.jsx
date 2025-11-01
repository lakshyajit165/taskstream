import { useMemo, useState } from "react";
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { CustomThemeContext } from "../context/CustomThemeContext";

export const CustomThemeProvider = ({ children }) => {
	const [mode, setMode] = useState(localStorage.getItem("theme") || "light");

	const toggleTheme = (newMode) => {
		setMode(newMode);
		localStorage.setItem("theme", newMode);
	};

	const theme = useMemo(
		() =>
			createTheme({
				palette: {
					mode,
					primary: {
						main: "#1976d2", // your primary color (blue default)
					},
				},
				components: {
					MuiButton: { styleOverrides: { root: { textTransform: "none" } } },
					MuiTab: { styleOverrides: { root: { textTransform: "none" } } },
					MuiAppBar: {
						styleOverrides: {
							colorPrimary: {
								backgroundColor: "#1976d2", // same color as primary.main
								color: "#fff",
							},
						},
					},
				},
				typography: { fontFamily: '"Lato", sans-serif' },
			}),
		[mode]
	);

	return (
		<CustomThemeContext.Provider value={{ mode, toggleTheme }}>
			<MuiThemeProvider theme={theme}>
				<CssBaseline />
				{children}
			</MuiThemeProvider>
		</CustomThemeContext.Provider>
	);
};
