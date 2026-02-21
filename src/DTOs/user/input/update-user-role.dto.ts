import type { UpdateRole } from "../../../enums/role.enum";

type UpdateUserRoleType = { role: UpdateRole };

export class UpdateUserRole {
	role: UpdateRole;
}

const _typeCheck: UpdateUserRoleType = {} as UpdateUserRole;
