import { getPresignedUrl, uploadFileToS3 } from "../api/resource_upload/resourceUpload";
import { MAX_FILE_SIZE, MAX_FILE_SIZE_MB } from "../api/utils/constants";

export const uploadResources = async ({ files, resourceType }) => {
	if (!files || !files.length) return [];

	// TYPE VALIDATION
	for (const file of files) {
		if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
			throw new Error(`Unsupported file type: ${file.name}`);
		}
	}

	// SIZE VALIDATION
	for (const file of files) {
		if (file.size > MAX_FILE_SIZE) {
			throw new Error(`${file.name} exceeds ${MAX_FILE_SIZE_MB}MB limit`);
		}
	}

	const uploadedUrls = [];

	for (const file of files) {
		const presignedResponse = await getPresignedUrl({
			fileName: file.name,
			contentType: file.type,
			resourceType,
		});

		const { uploadUrl, fileUrl } = presignedResponse;

		await uploadFileToS3(uploadUrl, file);

		uploadedUrls.push({
			fileName: file.name,
			fileType: file.type,
			fileUrl,
		});
	}

	return uploadedUrls;
};
