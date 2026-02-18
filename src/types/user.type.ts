import type { Role } from "../rbac/role";
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

	export type Secure = Omit<Schema, "password">;

	export type Env = Omit<Create, "role" | "enable"> & Pick<Schema, "password">;
}
