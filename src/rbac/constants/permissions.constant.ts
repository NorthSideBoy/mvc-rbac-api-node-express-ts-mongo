export const PERMISSIONS = {
	WILDCARD: "*:*" as const,

	USER_READ: "user:read" as const,

	USER_UPDATE_USERNAME_ALL: "user:update-username:all" as const,
	USER_UPDATE_EMAIL_ALL: "user:update-email:all" as const,
	USER_UPDATE_PASSWORD_ALL: "user:update-password:all" as const,
	USER_UPDATE_PROFILE_ALL: "user:update-profile:all" as const,
	USER_UPDATE_PICTURE_ALL: "user:update-picture:all" as const,
	USER_DELETE_PICTURE_ALL: "user:delete-picture:all" as const,

	USER_UPDATE_EMAIL_OWN: "user:update-email:own" as const,
	USER_UPDATE_PASSWORD_OWN: "user:update-password:own" as const,
	USER_UPDATE_PROFILE_OWN: "user:update-profile:own" as const,
	USER_UPDATE_USERNAME_OWN: "user:update-username:own" as const,
	USER_UPDATE_PICTURE_OWN: "user:update-picture:own" as const,
	USER_DELETE_PICTURE_OWN: "user:delete-picture:own" as const,

	USER_CREATE_MANAGED: "user:create:managed" as const,
	USER_UPDATE_ROLE_MANAGED: "user:update-role:managed" as const,
	USER_UPDATE_STATUS_MANAGED: "user:update-status:managed" as const,
	USER_DELETE_MANAGED: "user:delete:managed" as const,
} as const;
