import { getRequestHeaders, getResponse, checkResponseState } from "../utils/apiUtils";
import { HOST_URL } from "../utils/constants";

const BASE_URL = `${HOST_URL}/api/v1/users`;

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
