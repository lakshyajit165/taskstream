import { getRequestHeaders } from "../utils/apiUtils";

const BASE_URL = "http://localhost:8000/api/v1/tasks";

export const createTask = async (taskPayload) => {
	const response = await fetch(`${BASE_URL}/create`, {
		method: "POST",
		headers: getRequestHeaders(),
		body: JSON.stringify(taskPayload),
	});

	const data = await response.json();

	if (!response.ok) {
		// The server sends { message, error: true } for 4xx/5xx
		throw new Error(data.message || "Error adding task");
	}

	return data;
};

export const getTaskById = async (taskId) => {
	const response = await fetch(`${BASE_URL}/${taskId}`, {
		method: "GET",
		headers: getRequestHeaders(),
	});

	const data = await response.json();

	if (!response.ok) {
		// The server sends { message, error: true } for 4xx/5xx
		throw new Error(data.message || "Error fetching task");
	}

	return data;
};

export const getTasksByProject = async (projectId) => {
	const response = await fetch(`${BASE_URL}/project/${projectId}`, {
		method: "GET",
		headers: getRequestHeaders(),
	});

	const data = await response.json();

	if (!response.ok) {
		// The server sends { message, error: true } for 4xx/5xx
		throw new Error(data.message || "Error fetching tasks");
	}

	return data;
};

export const updateTask = async (taskId, taskPayload) => {
	const response = await fetch(`${BASE_URL}/${taskId}`, {
		method: "PUT",
		headers: getRequestHeaders(),
		body: JSON.stringify(taskPayload),
	});

	const data = await response.json();

	if (!response.ok) {
		// The server sends { message, error: true } for 4xx/5xx
		throw new Error(data.message || "Error updating task");
	}

	return data;
};

export const deleteTask = async (taskId) => {
	const response = await fetch(`${BASE_URL}/${taskId}`, {
		method: "DELETE",
		headers: getRequestHeaders(),
	});

	const data = await response.json();

	if (!response.ok) {
		// The server sends { message, error: true } for 4xx/5xx
		throw new Error(data.message || "Error deleting task");
	}

	return data;
};
