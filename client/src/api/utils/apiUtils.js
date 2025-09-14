export const getRequestHeaders = () => {
	const authToken = localStorage.getItem("token");
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
		throw new Error(data.message || "Error adding task");
	}
	return data;
};
