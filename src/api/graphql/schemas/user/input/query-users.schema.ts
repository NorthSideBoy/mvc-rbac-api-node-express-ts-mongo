import { Field, InputType } from "type-graphql";
import type SearchUsers from "../../../../../DTOs/user/input/search-users.dto";
import type { Role } from "../../../../../enums/role.enum";

@InputType("QueryUser")
export default class QueryUsersGQL implements SearchUsers {
	@Field({ nullable: true })
	page?: number;

	@Field({ nullable: true })
	limit?: number;

	@Field({ nullable: true })
	sort?: string;

	@Field({ nullable: true })
	search?: string;

	@Field({ nullable: true })
	role?: Role;

	@Field({ nullable: true })
	enable?: boolean;

	@Field({ nullable: true })
	firstname?: string;

	@Field({ nullable: true })
	lastname?: string;

	@Field({ nullable: true })
	email?: string;

	@Field({ nullable: true })
	username?: string;

	@Field({ nullable: true })
	birthdayFrom?: Date;

	@Field({ nullable: true })
	birthdayTo?: Date;

	@Field({ nullable: true })
	createdAtFrom?: Date;

	@Field({ nullable: true })
	createdAtTo?: Date;
}
