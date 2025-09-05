const BASE_URL = "http://localhost:8000/api/v1/auth";

export const login = async (loginData) => {
	const response = await fetch(`${BASE_URL}/login`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(loginData),
	});

	const data = await response.json();

	if (!response.ok) {
		// The server sends { message, error: true } for 4xx/5xx
		throw new Error(data.message || "Login failed");
	}

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

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.message || "Signup failed");
	}

	return data;
};
