import React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";

const items = [
	{
		icon: <LightbulbOutlinedIcon sx={{ color: "text.secondary" }} />,
		title: "Lightweight & Free",
		description: "A lightweight and free tool to handle your project management needs.",
	},
	{
		icon: <GroupsOutlinedIcon sx={{ color: "text.secondary" }} />,
		title: "Perfect for Agile Teams",
		description: "Suitable for task management across small to mid-sized teams.",
	},
	{
		icon: <RocketLaunchOutlinedIcon sx={{ color: "text.secondary" }} />,
		title: "Quick Setup",
		description: "Easy to setup and get started with task management in minutes.",
	},
];

export default function ProductDescription() {
	return (
		<Stack sx={{ flexDirection: "column", alignSelf: "center", gap: 4, maxWidth: 450 }}>
			<Box sx={{ display: { xs: "none", md: "flex" } }}>
				{/* Replace SitemarkIcon with your logo component */}
				{/* <YourLogoComponent /> */}
			</Box>
			{items.map((item, index) => (
				<Stack key={index} direction="row" sx={{ gap: 2 }}>
					{item.icon}
					<div>
						<Typography gutterBottom sx={{ fontWeight: "medium" }}>
							{item.title}
						</Typography>
						<Typography variant="body2" sx={{ color: "text.secondary" }}>
							{item.description}
						</Typography>
					</div>
				</Stack>
			))}
		</Stack>
	);
}
