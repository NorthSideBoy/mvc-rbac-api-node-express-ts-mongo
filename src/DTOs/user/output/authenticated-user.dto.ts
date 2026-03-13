import type { Role } from "../../../enums/role.enum";
import type File from "../../file/output/file.dto";

export default class AuthenticatedUser {
	id: string;
	firstname: string;
	lastname: string;
	username: string;
	role: Role;
	email: string;
	picture: File;
	birthday: Date;
	enable: boolean;
	createdAt: Date;
	updatedAt: Date;
	token: string;
}
