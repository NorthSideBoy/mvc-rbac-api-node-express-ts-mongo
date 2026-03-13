import type IUser from "../../../contracts/user.contract";

export type CreateUser = Omit<
	IUser,
	"id" | "createdAt" | "updatedAt" | "picture" | "enable"
> & { enable?: boolean; picture?: File };
