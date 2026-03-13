import { Field, InputType } from "type-graphql";
import type { UpdateUserUsername } from "../../../../../DTOs/user/input/update-user-username.dto";

@InputType("UpdateUserUsername")
export default class UpdateUserUsernameGQL implements UpdateUserUsername {
	@Field()
	username!: string;
}
