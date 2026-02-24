import { Field, ObjectType } from "type-graphql";
import type AuthenticatedUser from "../../../../../DTOs/user/output/authenticated-user.dto";
import UserGQL from "./user.schema";

@ObjectType("AuthenticatedUser")
export default class AuthenticatedUserGQL
	extends UserGQL
	implements AuthenticatedUser
{
	@Field()
	token!: string;
}
