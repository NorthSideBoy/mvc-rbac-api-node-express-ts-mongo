import type { AuthenticatedUser } from "../DTOs/user/output/authenticated-user.dto";
import type { User } from "../models/user.model";

export function toAuthenticated(user: User, token: string): AuthenticatedUser {
	return { ...user.secure, token };
}
