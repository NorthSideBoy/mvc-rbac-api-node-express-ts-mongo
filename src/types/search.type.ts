import type Pagination from "./pagination.type";

export default interface Search<T> {
	docs: T[];
	pagination: Pagination;
}
