import type IUser from "../../../contracts/user.contract";

export type LoginUser = Pick<IUser, "email" | "password">;
