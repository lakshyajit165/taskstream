export const NEW_TASK_BACKGROUND_COLOR = "#e4f2fdff";
export const IN_PROGRESS_TASK_BACKGROUND_COLOR = "#fffde7";
export const COMPLETED_TASK_BACKGROUND_COLOR = "#edfbdeff";
export const BACKLOG_TASK_BACKGROUND_COLOR = "#ffebee";
export const DEFAULT_TASK_BACKGROUND_COLOR = "background.paper";
// In Docker, the client container proxies /api to the backend. During local Vite
// development, default to the backend's host port unless explicitly configured.
export const HOST_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
export const EMAIL_VERIFICATION_STEP = "EMAIL_VERIFICATION";
export const RESET_PASSWORD_STEP = "RESET_PASSWORD_STEP";
export const MAX_FILE_SIZE_MB = 50;
export const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
export const SUPPORTED_OAUTH_PROVIDERS = ["GITHUB", "GITLAB"];
