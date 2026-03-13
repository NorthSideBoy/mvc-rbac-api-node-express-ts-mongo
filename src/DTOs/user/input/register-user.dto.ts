import type { CreateUser } from "./create-user.dto";

export type RegisterUser = Omit<CreateUser, "role">;
