import { getRequestHeaders } from "../utils/apiUtils";

const BASE_URL = "http://localhost:8000/api/v1/projects";

export const createProject = async (projectData) => {
	const response = await fetch(`${BASE_URL}/create`, {
		method: "POST",
		headers: getRequestHeaders(),
		body: JSON.stringify(projectData),
	});

	const data = await response.json();

	if (!response.ok) {
		// The server sends { message, error: true } for 4xx/5xx
		throw new Error(data.message || "Error adding project");
	}

	return data;
};

export const getProjects = async (page, size) => {
	const response = await fetch(`${BASE_URL}?page=${page}&size=${size}`, {
		method: "GET",
		headers: getRequestHeaders(),
	});

	const data = await response.json();

	if (!response.ok) {
		// The server sends { message, error: true } for 4xx/5xx
		throw new Error(data.message || "Error fetching projects");
	}

	return data;
};

export const getProjectById = async (id) => {
	const response = await fetch(`${BASE_URL}/${id}`, {
		method: "GET",
		headers: getRequestHeaders(),
	});

	const data = await response.json();

	if (!response.ok) {
		// The server sends { message, error: true } for 4xx/5xx
		throw new Error(data.message || "Error fetching project");
	}

	return data;
};

export const updateProject = async (id, projectData) => {
	const response = await fetch(`${BASE_URL}/${id}`, {
		method: "PUT",
		headers: getRequestHeaders(),
		body: JSON.stringify(projectData),
	});

	const data = await response.json();

	if (!response.ok) {
		// The server sends { message, error: true } for 4xx/5xx
		throw new Error(data.message || "Error updating project");
	}

	return data;
};

export const deleteProject = async (id) => {
	const response = await fetch(`${BASE_URL}/${id}`, {
		method: "DELETE",
		headers: getRequestHeaders(),
	});

	const data = await response.json();

	if (!response.ok) {
		// The server sends { message, error: true } for 4xx/5xx
		throw new Error(data.message || "Error deleting project");
	}

	return data;
};
