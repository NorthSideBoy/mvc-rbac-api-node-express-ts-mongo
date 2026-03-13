import type { CreateUser } from "./create-user.dto";

export type UpdateUserPassword = Pick<CreateUser, "password">;
