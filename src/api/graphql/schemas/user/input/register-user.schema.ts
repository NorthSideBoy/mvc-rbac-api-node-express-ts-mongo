import { Field, InputType } from "type-graphql";
import type { RegisterUser } from "../../../../../DTOs/user/input/register-user.dto";

@InputType("RegisterUser")
export default class RegisterUserGQL implements RegisterUser {
	@Field()
	firstname!: string;

	@Field()
	lastname!: string;

	@Field()
	username!: string;

	@Field()
	password!: string;

	@Field()
	email!: string;

	@Field()
	birthday!: Date;

	@Field({ nullable: true })
	enable?: boolean;
}
