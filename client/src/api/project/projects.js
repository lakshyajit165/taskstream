import { getRequestHeaders, getResponse, checkResponseState } from "../utils/apiUtils";

const BASE_URL = "http://localhost:8000/api/v1/projects";

export const createProject = async (projectData) => {
	const response = await fetch(`${BASE_URL}/create`, {
		method: "POST",
		headers: getRequestHeaders(),
		body: JSON.stringify(projectData),
	});
	// Check response state for 401 status
	checkResponseState(response);
	const data = await response.json();

	if (!response.ok) {
		// The server sends { message, error: true } for 4xx/5xx
		throw new Error(data.message || "Error adding project");
	}

	return data;
};

export const getProjects = async (queryParams) => {
	const response = await fetch(`${BASE_URL}/search?${queryParams}`, {
		method: "GET",
		headers: getRequestHeaders(),
	});
	// Check response state for 401 status
	checkResponseState(response);
	const data = await getResponse(response);
	return data;
};

export const getProjectById = async (id) => {
	const response = await fetch(`${BASE_URL}/${id}`, {
		method: "GET",
		headers: getRequestHeaders(),
	});
	// Check response state for 401 status
	checkResponseState(response);
	const data = await getResponse(response);
	return data;
};

export const updateProject = async (id, projectData) => {
	const response = await fetch(`${BASE_URL}/${id}`, {
		method: "PUT",
		headers: getRequestHeaders(),
		body: JSON.stringify(projectData),
	});
	// Check response state for 401 status
	checkResponseState(response);
	const data = await getResponse(response);
	return data;
};

export const deleteProject = async (id) => {
	const response = await fetch(`${BASE_URL}/${id}`, {
		method: "DELETE",
		headers: getRequestHeaders(),
	});
	// Check response state for 401 status
	checkResponseState(response);
	const data = await getResponse(response);
	return data;
};
