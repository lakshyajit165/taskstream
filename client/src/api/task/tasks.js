import { getRequestHeaders, getResponse, checkResponseState } from "../utils/apiUtils";
import { HOST_URL } from "../utils/constants";

const BASE_URL = `${HOST_URL}/api/v1/tasks`;

export const createTask = async (taskPayload) => {
	const response = await fetch(`${BASE_URL}/create`, {
		method: "POST",
		headers: getRequestHeaders(),
		body: JSON.stringify(taskPayload),
	});
	// Check response state for 401 status
	checkResponseState(response);
	const data = await getResponse(response);
	return data;
};

export const getTaskById = async (taskId) => {
	const response = await fetch(`${BASE_URL}/${taskId}`, {
		method: "GET",
		headers: getRequestHeaders(),
	});
	// Check response state for 401 status
	checkResponseState(response);
	const data = await getResponse(response);
	return data;
};

export const getTasksByProject = async (projectId, page, size) => {
	const response = await fetch(`${BASE_URL}/project/${projectId}?page=${page}&size=${size}`, {
		method: "GET",
		headers: getRequestHeaders(),
	});
	// Check response state for 401 status
	checkResponseState(response);
	const data = await getResponse(response);
	return data;
};

export const updateTask = async (taskId, taskPayload) => {
	const response = await fetch(`${BASE_URL}/${taskId}`, {
		method: "PUT",
		headers: getRequestHeaders(),
		body: JSON.stringify(taskPayload),
	});
	// Check response state for 401 status
	checkResponseState(response);
	const data = await getResponse(response);
	return data;
};

export const deleteTask = async (taskId) => {
	const response = await fetch(`${BASE_URL}/${taskId}`, {
		method: "DELETE",
		headers: getRequestHeaders(),
	});
	// Check response state for 401 status
	checkResponseState(response);
	const data = await getResponse(response);
	return data;
};
