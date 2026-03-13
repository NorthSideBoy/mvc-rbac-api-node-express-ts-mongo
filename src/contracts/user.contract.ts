import type { Role } from "../enums/role.enum";
import type IEntity from "./entity.contract";
import type { IFile } from "./file.contract";

export default interface IUser extends IEntity {
	firstname: string;
	lastname: string;
	username: string;
	role: Role;
	enable: boolean;
	email: string;
	password: string;
	picture: IFile;
	birthday: Date;
}
