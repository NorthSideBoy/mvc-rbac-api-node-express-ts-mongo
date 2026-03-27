import type IUser from "../../contracts/user.contract";
import type { AuthenticatedUser } from "../../DTOs/auth/output/authenticated-user.dto";
import type { UpdateUserEmail } from "../../DTOs/user/input/update-user-email.dto";
import type { UpdateUserPassword } from "../../DTOs/user/input/update-user-password.dto";
import type { UpdateUserProfile } from "../../DTOs/user/input/update-user-profile.dto";
import type { UpdateUserRole } from "../../DTOs/user/input/update-user-role.dto";
import type { UpdateUserStatus } from "../../DTOs/user/input/update-user-status.dto";
import type { UpdateUserUsername } from "../../DTOs/user/input/update-user-username.dto";
import { EVENTS } from "../constants/events.conts";

type UserId = Pick<IUser, "id">;
type AuthRef = UserId & Pick<AuthenticatedUser, "token">;
type UserRef = UserId & Pick<IUser, "role" | "username">;

export interface EventMap {
	//Auth
	[EVENTS.AUTH.ACCOUNT_REGISTERED]: AuthRef;
	[EVENTS.AUTH.ACCOUNT_LOGGED_IN]: AuthRef;

	//User
	[EVENTS.USER.READED]: UserRef;
	[EVENTS.USER.CREATED]: UserRef;
	[EVENTS.USER.DELETED]: UserRef;
	[EVENTS.USER.EMAIL_UPDATED]: UserId & UpdateUserEmail;
	[EVENTS.USER.PASSWORD_UPDATED]: UserId & UpdateUserPassword;
	[EVENTS.USER.PICTURE_DELETED]: UserRef & { pictureId: string };
	[EVENTS.USER.PICTURE_UPDATED]: UserId & { pictureId: string };
	[EVENTS.USER.PROFILE_UPDATED]: UserId & UpdateUserProfile;
	[EVENTS.USER.ROLE_UPDATED]: UserId & UpdateUserRole;
	[EVENTS.USER.STATUS_UPDATED]: UserId & UpdateUserStatus;
	[EVENTS.USER.USERNAME_UPDATED]: UserId & UpdateUserUsername;
}
