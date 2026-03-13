import { Field, ObjectType } from "type-graphql";
import type { UsersSearch } from "../../../../../DTOs/user/output/users-search";
import PaginationGQL from "../../common/pagination.schema";
import UserGQL from "./user.schema";

@ObjectType("UsersSearch")
export default class UsersSearchGQL implements UsersSearch {
	@Field(() => [UserGQL])
	docs!: UserGQL[];

	@Field(() => PaginationGQL)
	pagination!: PaginationGQL;
}
