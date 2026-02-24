import { Field, ObjectType } from "type-graphql";
import type SearchUser from "../../../../../DTOs/user/output/search-user.dto";
import PaginationGQL from "../../operation/output/pagination.schema";
import UserGQL from "./user.schema";

@ObjectType("SearchUser")
export default class SearchUserGQL implements SearchUser {
	@Field(() => [UserGQL])
	docs!: UserGQL[];

	@Field(() => PaginationGQL)
	pagination!: PaginationGQL;
}
