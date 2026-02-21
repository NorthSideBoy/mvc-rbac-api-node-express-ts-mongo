export const PERMISSIONS = {
	// Wildcard for 'JOKER' (all permissions)
	WILDCARD: "*:*",

	// Any
	USER_READ: "user:read",

	// All
	USER_UPDATE_USERNAME_ALL: "user:update-username:all",
	USER_UPDATE_EMAIL_ALL: "user:update-email:all",
	USER_UPDATE_PASSWORD_ALL: "user:update-password:all",
	USER_UPDATE_PROFILE_ALL: "user:update-profile:all",

	// Own
	USER_UPDATE_EMAIL_OWN: "user:update-email:own",
	USER_UPDATE_PASSWORD_OWN: "user:update-password:own",
	USER_UPDATE_PROFILE_OWN: "user:update-profile:own",
	USER_UPDATE_USERNAME_OWN: "user:update-username:own",

	// Managed
	USER_CREATE_MANAGED: "user:create:managed",
	USER_UPDATE_ROLE_MANAGED: "user:update-role:managed",
	USER_UPDATE_STATUS_MANAGED: "user:update-status:managed",
	USER_DELETE_MANAGED: "user:delete:managed",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
export type Action = `${string}:${string}`;
