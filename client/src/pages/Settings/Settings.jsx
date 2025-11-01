import React, { useContext } from "react";
import {
	Container,
	Box,
	Typography,
	Stack,
	Divider, // Added Divider for visual separation
} from "@mui/material";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { CustomThemeContext } from "../../context/CustomThemeContext";

const Settings = () => {
	const { mode, toggleTheme } = useContext(CustomThemeContext);

	const handleChange = (event) => {
		toggleTheme(event.target.value);
	};

	// Component for the Light label with icon
	const LightLabel = (
		<Stack direction="row" spacing={1} alignItems="center">
			<WbSunnyOutlinedIcon fontSize="small" />
			<Typography>Light</Typography>
		</Stack>
	);

	// Component for the Dark label with icon
	const DarkLabel = (
		<Stack direction="row" spacing={1} alignItems="center">
			<DarkModeOutlinedIcon fontSize="small" />
			<Typography>Dark</Typography>
		</Stack>
	);

	return (
		<Container sx={{ maxWidth: { xs: 400, sm: 600 } }}>
			<Box sx={{ my: 2 }}>
				{/* Header and Title */}
				<Typography variant="h5" component="h1" gutterBottom>
					Settings
				</Typography>
				<Divider sx={{ my: 1 }} />
				<Typography variant="h6" component="h2" gutterBottom>
					Theme
				</Typography>
				<FormControl>
					{/* <FormLabel id="demo-controlled-radio-buttons-group">Gender</FormLabel> */}
					<RadioGroup aria-labelledby="demo-controlled-radio-buttons-group" name="controlled-radio-buttons-group" value={mode} onChange={handleChange}>
						<FormControlLabel
							value="light"
							control={<Radio />}
							label={LightLabel} // Use the custom component
						/>
						<FormControlLabel
							value="dark"
							control={<Radio />}
							label={DarkLabel} // Use the custom component
						/>
					</RadioGroup>
				</FormControl>
			</Box>
		</Container>
	);
};

export default Settings;
