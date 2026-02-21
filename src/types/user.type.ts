import type { IQuery as QueryType } from "../contracts/query.contract";
import type { Role } from "../enums/role.enum";
export namespace User {
	export type Schema = {
		id: string;
		firstname: string;
		lastname: string;
		username: string;
		role: Role;
		email: string;
		password: string;
		birthday: Date;
		enable: boolean;
		createdAt: Date;
		updatedAt: Date;
	};

	export type Create = Omit<Schema, "id" | "createdAt" | "updatedAt">;

	export type IQuery = Partial<Omit<User.Create, "birthday">> & {
		birthdayFrom?: Date;
		birthdayTo?: Date;
	} & QueryType;

	export type Secure = Omit<Schema, "password">;

	export type Env = Omit<Create, "role" | "enable"> & Pick<Schema, "password">;
}
