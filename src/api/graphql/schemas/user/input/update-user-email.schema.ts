import { Field, InputType } from "type-graphql";
import type UpdateUserEmail from "../../../../../DTOs/user/input/update-user-email.dto";

@InputType("UpdateUserEmail")
export default class UpdateUserEmailGQL implements UpdateUserEmail {
	@Field()
	email!: string;
}
