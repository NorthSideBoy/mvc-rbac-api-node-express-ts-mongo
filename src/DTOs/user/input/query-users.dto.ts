import type { Query } from "../../../types/query.type";
import type { CreateUser } from "./create-user.dto";

export interface QueryUsers
	extends Query,
		Partial<Omit<CreateUser, "picture" | "birthday">> {
	birthdayFrom?: Date;
	birthdayTo?: Date;
}
