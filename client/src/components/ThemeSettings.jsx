import React, { useContext } from "react";

import { Box, Typography, Stack, Divider, FormControlLabel } from "@mui/material";

import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";

import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";

import { CustomThemeContext } from "../context/CustomThemeContext";

const ThemeSettings = () => {
	const { mode, toggleTheme } = useContext(CustomThemeContext);

	const handleChange = (event) => {
		toggleTheme(event.target.value);
	};

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
	);
};

export default ThemeSettings;
