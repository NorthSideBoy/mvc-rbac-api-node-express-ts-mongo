import { Field, ObjectType } from "type-graphql";
import type Result from "../../../../../DTOs/operation/output/result.dto";

@ObjectType("Result")
export default class ResultGQL implements Result {
	@Field()
	success!: boolean;

	@Field()
	affected!: number;
}
