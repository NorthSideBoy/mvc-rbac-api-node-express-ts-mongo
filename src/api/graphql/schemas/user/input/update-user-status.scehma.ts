import { Field, InputType } from "type-graphql";
import type UpdateUserStatus from "../../../../../DTOs/user/input/update-user-status.dto";

@InputType("UpdateUserStatus")
export default class UpdateUserStatusGQL implements UpdateUserStatus {
	@Field()
	enable!: boolean;
}
