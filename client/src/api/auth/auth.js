import { getResponse } from "../utils/apiUtils";
import { HOST_URL } from "../utils/constants";
import { getRequestHeaders } from "../utils/apiUtils";

const BASE_URL = `${HOST_URL}/api/v1/auth`;

export const login = async (loginData) => {
	const response = await fetch(`${BASE_URL}/login`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(loginData),
	});

	const data = await getResponse(response);
	return data;
};

export const signup = async (signupData) => {
	const response = await fetch(`${BASE_URL}/signup`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(signupData),
	});

	const data = await getResponse(response);
	return data;
};

export const initiateForgotPassword = async (initiateForgotPasswordData) => {
	const response = await fetch(`${BASE_URL}/send_verification_code`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(initiateForgotPasswordData),
	});

	const data = await getResponse(response);
	return data;
};

export const resetPassword = async (resetPasswordData) => {
	const response = await fetch(`${BASE_URL}/reset_password`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(resetPasswordData),
	});

	const data = await getResponse(response);
	return data;
};

export const saveOAuthCreds = async (oAuthSetupData) => {
	const response = await fetch(`${BASE_URL}/oauth2/config/save`, {
		method: "POST",
		headers: getRequestHeaders(),
		body: JSON.stringify(oAuthSetupData),
	});

	const data = await getResponse(response);
	return data;
};

export const getOAuthProvider = async () => {
	const response = await fetch(`${BASE_URL}/oauth2/provider`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});
	const data = await getResponse(response);
	return data;
};

export const disableOAuthCreds = async () => {
	const response = await fetch(`${BASE_URL}/oauth2/config/disable`, {
		method: "POST",
		headers: getRequestHeaders(),
	});

	const data = await getResponse(response);
	return data;
};
