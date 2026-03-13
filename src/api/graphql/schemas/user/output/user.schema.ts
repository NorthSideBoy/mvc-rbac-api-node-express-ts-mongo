import { Field, ID, ObjectType, registerEnumType } from "type-graphql";
import type User from "../../../../../DTOs/user/output/user.dto";
import { Role } from "../../../../../enums/role.enum";
import FileGQL from "../../file/output/file.schema";

registerEnumType(Role, {
	name: "Role",
	description: "User roles",
});

@ObjectType("User")
export default class UserGQL implements User {
	@Field(() => ID)
	id!: string;

	@Field()
	firstname!: string;

	@Field()
	lastname!: string;

	@Field()
	username!: string;

	@Field(() => Role)
	role!: Role;

	@Field()
	email!: string;

	@Field(() => FileGQL)
	picture!: FileGQL;

	@Field()
	birthday!: Date;

	@Field()
	enable!: boolean;

	@Field()
	createdAt!: Date;

	@Field()
	updatedAt!: Date;
}
