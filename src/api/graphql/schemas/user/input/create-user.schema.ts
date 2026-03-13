import { Field, InputType } from "type-graphql";
import type { CreateUser } from "../../../../../DTOs/user/input/create-user.dto";
import { Role } from "../../../../../enums/role.enum";

@InputType("CreateUser")
export default class CreateUserGQL implements CreateUser {
	@Field()
	firstname!: string;

	@Field()
	lastname!: string;

	@Field()
	username!: string;

	@Field(() => Role)
	role!: Role;

	@Field()
	password!: string;

	@Field()
	email!: string;

	@Field()
	birthday!: Date;

	@Field({ nullable: true })
	enable?: boolean;
}
