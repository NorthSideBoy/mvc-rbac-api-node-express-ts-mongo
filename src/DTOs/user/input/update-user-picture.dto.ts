import type { CreateUser } from "./create-user.dto";

export type UpdateUserPicture = Required<Pick<CreateUser, "picture">>;
