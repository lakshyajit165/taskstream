import { getResponse } from "../utils/apiUtils";
import { HOST_URL } from "../utils/constants";

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
