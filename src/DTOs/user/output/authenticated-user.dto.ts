import type { User } from "./user.dto";

export interface AuthenticatedUser extends User {
	token: string;
}
