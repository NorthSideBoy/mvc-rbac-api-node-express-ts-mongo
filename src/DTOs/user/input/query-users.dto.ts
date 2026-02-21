import type { Role } from "../../../enums/role.enum";
import type { User } from "../../../types/user.type";

type QueryUsersType = User.IQuery;

export class QueryUsers {
	page?: number;
	limit?: number;
	sort?: string;
	search?: string;

	role?: Role;
	enable?: boolean;
	firstname?: string;
	lastname?: string;
	email?: string;
	username?: string;

	birthdayFrom?: Date;
	birthdayTo?: Date;
	createdAtFrom?: Date;
	createdAtTo?: Date;
}

const _typeCheck: QueryUsersType = {} as QueryUsers;
