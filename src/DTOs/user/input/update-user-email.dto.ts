import type { CreateUser } from "./create-user.dto";

export type UpdateUserEmail = Pick<CreateUser, "email">;
