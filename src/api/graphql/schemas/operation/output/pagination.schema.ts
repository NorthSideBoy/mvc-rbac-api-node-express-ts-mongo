import { Field, ObjectType } from "type-graphql";
import type Pagination from "../../../../../DTOs/operation/output/pagination.dto";

@ObjectType("Pagination")
export default class PaginationGQL implements Pagination {
	@Field()
	page: number;

	@Field()
	pages: number;

	@Field()
	limit: number;

	@Field()
	total: number;

	@Field()
	hasNext: boolean;

	@Field()
	hasPrev: boolean;
}
