import { getResponse } from "../utils/apiUtils";
import { HOST_URL } from "../utils/constants";
import { getRequestHeaders } from "../utils/apiUtils";

const BASE_URL = `${HOST_URL}/api/v1/resource/upload`;

export const getPresignedUrl = async (presignedUrlRequest) => {
	const response = await fetch(`${BASE_URL}/get_presigned_url`, {
		method: "POST",
		headers: getRequestHeaders(),
		body: JSON.stringify(presignedUrlRequest),
	});

	const data = await getResponse(response);
	return data;
};

export const uploadFileToS3 = async (uploadUrl, file) => {
	const response = await fetch(uploadUrl, {
		method: "PUT",
		headers: {
			"Content-Type": file.type,
		},
		body: file,
	});

	if (!response.ok) {
		throw new Error("Failed to upload file");
	}

	// S3 returns no JSON — just success status
	return true;
};
