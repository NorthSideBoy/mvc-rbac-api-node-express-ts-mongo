import { Field, InputType } from "type-graphql";
import type LoginUser from "../../../../../DTOs/user/input/login-user.dto";

@InputType("LoginUser")
export default class LoginUserGQL implements LoginUser {
	@Field()
	email!: string;

	@Field()
	password!: string;
}
