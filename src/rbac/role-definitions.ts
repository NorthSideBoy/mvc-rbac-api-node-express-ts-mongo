import type { IRole } from "./contracts";
import { PERMISSIONS } from "./permissions";
import { Role } from "./role";

export const ROLE_DEFINITIONS: readonly IRole[] = [
	{
		name: Role.JOKER,
		permissions: [PERMISSIONS.WILDCARD],
	},
	{
		name: Role.ADMIN,
		permissions: [
			PERMISSIONS.USER_DELETE_MANAGED,
			PERMISSIONS.USER_UPDATE_ROLE_MANAGED,
			PERMISSIONS.USER_UPDATE_PROFILE_ALL,
			PERMISSIONS.USER_UPDATE_USERNAME_ALL,
			PERMISSIONS.USER_UPDATE_EMAIL_ALL,
			PERMISSIONS.USER_UPDATE_PASSWORD_ALL,
		],
		includes: [Role.MANAGER, Role.USER],
	},
	{
		name: Role.MANAGER,
		permissions: [
			PERMISSIONS.USER_CREATE_MANAGED,
			PERMISSIONS.USER_UPDATE_STATUS_MANAGED,
		],
		includes: [Role.USER],
	},
	{
		name: Role.USER,
		permissions: [
			PERMISSIONS.USER_READ,
			PERMISSIONS.USER_UPDATE_PROFILE_OWN,
			PERMISSIONS.USER_UPDATE_USERNAME_OWN,
			PERMISSIONS.USER_UPDATE_EMAIL_OWN,
			PERMISSIONS.USER_UPDATE_PASSWORD_OWN,
		],
	},
	{
		name: Role.ANONYMOUS,
		permissions: [PERMISSIONS.USER_READ],
	},
] as const;
