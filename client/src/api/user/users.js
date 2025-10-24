import { getRequestHeaders, getResponse, checkResponseState } from "../utils/apiUtils";

const BASE_URL = "http://localhost:8000/api/v1/users";

export const searchUsers = async (name) => {
	const response = await fetch(`${BASE_URL}/search?name=${name}`, {
		method: "GET",
		headers: getRequestHeaders(),
	});
	// Check response state for 401 status
	checkResponseState(response);
	const data = await getResponse(response);
	return data;
};
