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
