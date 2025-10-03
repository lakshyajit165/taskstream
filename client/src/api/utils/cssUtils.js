import { NEW_TASK_BACKGROUND_COLOR, IN_PROGRESS_TASK_BACKGROUND_COLOR, COMPLETED_TASK_BACKGROUND_COLOR, BACKLOG_TASK_BACKGROUND_COLOR, DEFAULT_TASK_BACKGROUND_COLOR } from "./constants";
export const getTaskBackgroundColor = (state) => {
	switch (state) {
		case "NEW":
			return NEW_TASK_BACKGROUND_COLOR;
		case "BACKLOG":
			// Corresponds to 'yellow' / warning or neutral status
			return BACKLOG_TASK_BACKGROUND_COLOR;
		case "IN_PROGRESS":
			// Corresponds to 'blue' / working status
			return IN_PROGRESS_TASK_BACKGROUND_COLOR;
		case "COMPLETE":
			// Corresponds to 'success' / finished status
			return COMPLETED_TASK_BACKGROUND_COLOR;
		default:
			return DEFAULT_TASK_BACKGROUND_COLOR; // Default background color
	}
};
