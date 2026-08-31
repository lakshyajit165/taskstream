import React, { useContext, useState, useEffect } from "react";

import { Container } from "@mui/material";

import { isCurrentUserAdminFromLocal } from "../../api/utils/apiUtils";
import { isCurrentUserAdminFromApi } from "../../api/user/users";

import { ToastContext } from "../../context/ToastContext";

import OAuthSettings from "../../components/OAuthSettings";
import ThemeSettings from "../../components/ThemeSettings";

const Settings = () => {
	const { showToast } = useContext(ToastContext);

	const [isAdmin, setIsAdmin] = useState(false);
	const [adminCheckLoading, setAdminCheckLoading] = useState(true);

	useEffect(() => {
		const checkAdminStatus = async () => {
			const isAdminAccordingToJwt = isCurrentUserAdminFromLocal();

			if (!isAdminAccordingToJwt) {
				setIsAdmin(false);
				setAdminCheckLoading(false);
				return;
			}

			try {
				const response = await isCurrentUserAdminFromApi();

				const isAdminAccordingToApi = response.data === true;

				setIsAdmin(isAdminAccordingToApi);
			} catch (err) {
				showToast(err.message || "Failed to fetch admin details", "error");

				setIsAdmin(false);
			} finally {
				setAdminCheckLoading(false);
			}
		};

		checkAdminStatus();
	}, []);

	return (
		<Container sx={{ maxWidth: { xs: 400, sm: 600 } }}>
			<ThemeSettings />

			{!adminCheckLoading && isAdmin && <OAuthSettings />}
		</Container>
	);
};

export default Settings;
