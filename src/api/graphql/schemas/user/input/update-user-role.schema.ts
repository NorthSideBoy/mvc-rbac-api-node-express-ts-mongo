import { Field, InputType, registerEnumType } from "type-graphql";
import type { UpdateUserRole } from "../../../../../DTOs/user/input/update-user-role.dto";
import { UpdateRole } from "../../../../../enums/role.enum";

registerEnumType(UpdateRole, {
	name: "UpdateRole",
	description: "User update roles",
});

@InputType("UpdateUserRole")
export default class UpdateUserRoleGQL implements UpdateUserRole {
	@Field(() => UpdateRole)
	role!: UpdateRole;
}
