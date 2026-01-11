// --- Signup Validation ---
export const validateSignup = (values, errors = {}) => {
	let validationErrors = { ...errors };

	if ("name" in values) {
		if (!values.name) {
			validationErrors.name = "Name is required";
		} else if (values.name.length < 2) {
			validationErrors.name = "Name must be at least 2 characters";
		} else {
			delete validationErrors.name;
		}
	}

	if ("email" in values) {
		if (!values.email) {
			validationErrors.email = "Email is required";
		} else if (!/\S+@\S+\.\S+/.test(values.email)) {
			validationErrors.email = "Email is not valid";
		} else {
			delete validationErrors.email;
		}
	}

	if ("password" in values) {
		if (!values.password) {
			validationErrors.password = "Password is required";
		} else if (values.password.length < 6) {
			validationErrors.password = "Password must be at least 6 characters";
		} else {
			delete validationErrors.password;
		}
	}

	return validationErrors;
};

// --- Login Validation ---
export const validateLogin = (values, errors = {}) => {
	let validationErrors = { ...errors };

	if ("email" in values) {
		if (!values.email) {
			validationErrors.email = "Email is required";
		} else if (!/\S+@\S+\.\S+/.test(values.email)) {
			validationErrors.email = "Email is not valid";
		} else {
			delete validationErrors.email;
		}
	}

	if ("password" in values) {
		if (!values.password) {
			validationErrors.password = "Password is required";
		} else if (values.password.length < 6) {
			validationErrors.password = "Password must be at least 6 characters";
		} else {
			delete validationErrors.password;
		}
	}

	return validationErrors;
};

// validate project payload
export const validateProject = (values, errors = {}) => {
	let validationErrors = { ...errors };

	if ("title" in values) {
		if (!values.title) {
			validationErrors.title = "Title is required";
		} else if (values.title.length < 5) {
			validationErrors.title = "Title must be at least 5 characters";
		} else {
			delete validationErrors.title;
		}
	}

	if ("description" in values) {
		if (!values.description) {
			validationErrors.description = "Description is required";
		} else if (values.description.length < 10) {
			validationErrors.description = "Description must be at least 10 characters";
		} else {
			delete validationErrors.description;
		}
	}

	if ("dueDate" in values) {
		if (!values.dueDate) {
			validationErrors.dueDate = "Due Date is required";
		} else {
			delete validationErrors.dueDate;
		}
	}

	if ("tags" in values) {
		if (!values.tags || values.tags.length === 0) {
			validationErrors.tags = "At least one tag is required";
		} else {
			delete validationErrors.tags;
		}
	}

	return validationErrors;
};

export const validateTaskPayload = (values, errors = {}) => {
	let validationErrors = { ...errors };
	if ("title" in values) {
		if (!values.title) validationErrors.title = "Title is required";
		else delete validationErrors.title;
	}
	if ("description" in values) {
		if (!values.description) validationErrors.description = "Description is required";
		else delete validationErrors.description;
	}
	if ("dueDate" in values) {
		if (!values.dueDate) validationErrors.dueDate = "Due date is required";
		else delete validationErrors.dueDate;
	}
	if ("priority" in values) {
		if (!values.priority) validationErrors.priority = "Priority is required";
		else delete validationErrors.priority;
	}
	if ("type" in values) {
		if (!values.type) validationErrors.type = "Task type is required";
		else delete validationErrors.type;
	}
	if ("assignedTo" in values) {
		if (!values.assignedTo) validationErrors.assignedTo = "User assigned to is required";
		else delete validationErrors.assignedTo;
	}
	if ("targetVersion" in values) {
		if (!values.targetVersion) validationErrors.targetVersion = "Target version is required";
		else delete validationErrors.targetVersion;
	}
	return validationErrors;
};

export const validateInitiateForgotPasswordPayload = (values, errors = {}) => {
	let validationErrors = { ...errors };

	if ("email" in values) {
		if (!values.email) {
			validationErrors.email = "Email is required";
		} else if (!/\S+@\S+\.\S+/.test(values.email)) {
			validationErrors.email = "Email is not valid";
		} else {
			delete validationErrors.email;
		}
	}
	return validationErrors;
};

export const validateResetPasswordPayload = (values, errors = {}) => {
	let validationErrors = { ...errors };
	if ("email" in values) {
		if (!values.email) {
			validationErrors.email = "Email is required";
		} else if (!/\S+@\S+\.\S+/.test(values.email)) {
			validationErrors.email = "Email is not valid";
		} else {
			delete validationErrors.email;
		}
	}
	if ("password" in values) {
		if (!values.password) {
			validationErrors.password = "Password is required";
		} else if (values.password.length < 6) {
			validationErrors.password = "Password must be at least 6 characters";
		} else {
			delete validationErrors.password;
		}
	}
	if ("verificationCode" in values) {
		if (!values.verificationCode) {
			validationErrors.verificationCode = "Verification code is required";
		} else if (!/^\d{6}$/.test(values.verificationCode)) {
			validationErrors.verificationCode = "Verification code must be exactly 6 digits";
		} else {
			delete validationErrors.verificationCode;
		}
	}
	return validationErrors;
};
