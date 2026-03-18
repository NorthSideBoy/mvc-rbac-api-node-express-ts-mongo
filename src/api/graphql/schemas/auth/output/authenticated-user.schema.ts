import { Field, ObjectType } from "type-graphql";
import type { AuthenticatedUser } from "../../../../../DTOs/auth/output/authenticated-user.dto";
import UserGQL from "../../user/output/user.schema";

@ObjectType("AuthenticatedUser")
export default class AuthenticatedUserGQL
	extends UserGQL
	implements AuthenticatedUser
{
	@Field()
	token!: string;
}
