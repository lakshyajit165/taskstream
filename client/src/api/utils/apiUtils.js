// 1. Singleton variable to hold the external logout function from AuthProvider
let onUnauthorizedCallback = () => {};

// 2. Export a function to allow AuthProvider to register the callback
export const registerUnauthorizedCallback = (callback) => {
	onUnauthorizedCallback = callback;
};

export const getRequestHeaders = () => {
	const authToken = getAuthToken();
	if (!authToken) {
		throw new Error("Authentication token not found. Please log in.");
	}
	const headers = {
		"Content-Type": "application/json",
		Authorization: `Bearer ${authToken}`,
	};
	return headers;
};

export const getResponse = async (response) => {
	const data = await response.json();
	if (!response.ok) {
		// The server sends { message, error: true } for 4xx/5xx
		throw new Error(data.message || "Unknown error occurred");
	}
	return data;
};

export const checkResponseState = (response) => {
	if (response.status === 401) {
		// Call the external logout function registered by AuthProvider
		onUnauthorizedCallback();
		// Throw an error to stop further processing in the API call chain
		throw new Error("Session expired or unauthorized access.");
	}
	// For other status codes, do nothing (let the API call continue)
};

export const getAuthToken = () => {
	return localStorage.getItem("token");
};

export const setAuthToken = (token) => {
	localStorage.setItem("token", token);
};

export const userLogout = () => {
	localStorage.removeItem("token");
};

export const buildQueryParams = (filters, currentPage, pageSize) => {
	const params = new URLSearchParams();

	// Mapping over all filter keys
	Object.keys(filters).forEach((key) => {
		const value = filters[key];

		// Only add the parameter if the value is not null, not undefined, and not an empty string
		if (value !== null && value !== undefined && value !== "") {
			if (Array.isArray(value)) {
				value.forEach((item) => {
					// Append the key for each item in the array
					params.append(key, item);
				});
			} else {
				// Append single values (strings, dates, numbers) as before
				params.append(key, value);
			}
		}
	});

	// Add required parameters
	params.append("page", currentPage);
	params.append("size", pageSize);

	return params.toString();
};

const decodeJwtPayload = (token) => {
	const payload = token.split(".")[1];

	const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");

	return JSON.parse(atob(base64));
};

export const isCurrentUserAdminFromLocal = () => {
	const token = getAuthToken();

	if (!token) {
		return false;
	}

	const payload = decodeJwtPayload(token);

	return payload.roles?.includes("ROLE_ADMIN") ?? false;
};

export const isValidURL = (value) => {
	// Standard strict URL regex with start (^) and end ($) anchors
	const pattern = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/;
	return pattern.test(value);
};
