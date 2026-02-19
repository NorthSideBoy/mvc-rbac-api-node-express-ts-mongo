import type { UpdateRole } from "../../../rbac/role";

type UpdateUserRoleType = { role: UpdateRole };

export class UpdateUserRole {
	role: UpdateRole;
}

const _typeCheck: UpdateUserRoleType = {} as UpdateUserRole;
