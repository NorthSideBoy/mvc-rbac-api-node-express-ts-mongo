import { Field, InputType } from "type-graphql";
import type UpdateUserPassword from "../../../../../DTOs/user/input/update-user-password.dto";

@InputType("UpdateUserPassword")
export default class UpdateUserPasswordGQL implements UpdateUserPassword {
	@Field()
	password!: string;
}
