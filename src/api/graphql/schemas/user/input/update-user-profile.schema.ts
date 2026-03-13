import { Field, InputType } from "type-graphql";
import type { UpdateUserProfile } from "../../../../../DTOs/user/input/update-user-profile.dto";

@InputType("UpdateUserProfile")
export default class UpdateUserProfileGQL implements UpdateUserProfile {
	@Field({ nullable: true })
	firstname?: string;

	@Field({ nullable: true })
	lastname?: string;

	@Field({ nullable: true })
	birthday?: Date;
}
