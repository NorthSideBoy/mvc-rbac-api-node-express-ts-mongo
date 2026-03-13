export const OPERATIONS = {
	USER_CREATE: "user:create" as const,
	USER_READ: "user:read" as const,
	USER_UPDATE_PROFILE: "user:update-profile" as const,
	USER_UPDATE_USERNAME: "user:update-username" as const,
	USER_UPDATE_EMAIL: "user:update-email" as const,
	USER_UPDATE_PICTURE: "user:update-picture" as const,
	USER_UPDATE_PASSWORD: "user:update-password" as const,
	USER_UPDATE_ROLE: "user:update-role" as const,
	USER_UPDATE_STATUS: "user:update-status" as const,
	USER_DELETE: "user:delete" as const,
	USER_DELETE_PICTURE: "user:delete-picture" as const,
} as const;
