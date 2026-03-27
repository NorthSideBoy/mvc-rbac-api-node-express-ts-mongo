export const EVENTS = {
	AUTH: {
		ACCOUNT_REGISTERED: "account.registered",
		ACCOUNT_LOGGED_IN: "account.logged_in",
	} as const,
	USER: {
		READED: "user.readed",
		CREATED: "user.created",
		PROFILE_UPDATED: "user.profile.updated",
		STATUS_UPDATED: "user.status.updated",
		ROLE_UPDATED: "user.role.updated",
		PASSWORD_UPDATED: "user.password.updated",
		EMAIL_UPDATED: "user.email.updated",
		USERNAME_UPDATED: "user.username.updated",
		PICTURE_UPDATED: "user.picture:updated",
		PICTURE_DELETED: "user.picture:deleted",
		DELETED: "user:deleted",
	} as const,
} as const;
