import type IUser from "../../../contracts/user.contract";
import type { File } from "../../file/output/file.dto";

export interface User extends Omit<IUser, "password" | "picture"> {
	picture: File;
}
