import { Field, ObjectType } from "type-graphql";
import type Pagination from "../../../../types/pagination.type";

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
