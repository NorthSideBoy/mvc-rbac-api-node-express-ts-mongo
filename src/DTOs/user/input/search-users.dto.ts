import type { Role } from "../../../enums/role.enum";

export default class SearchUsers {
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
